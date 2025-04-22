require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { google } = require('googleapis');
const fs = require('fs');
// const whatsappService = require('./whatsapp-service');
// Use CallMeBot instead for more reliable WhatsApp messages
const callmebot = require('./callmebot-service');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const crypto = require('crypto');
const validator = require('validator');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for users (in a production environment, use a proper database)
const users = [];
let nextUserId = 1;

// In-memory storage for password reset tokens
const resetTokens = new Map();

// Middleware for security
// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Rate limiting
if (process.env.ENABLE_RATE_LIMIT === 'true') {
  const limiter = rateLimit({
    max: parseInt(process.env.MAX_REQUESTS_PER_IP || 100),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000), // 15 minutes
    message: 'Too many requests from this IP, please try again later'
  });
  app.use('/api/', limiter);
}

// Body parser, reading data from body
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against XSS
app.use(xss());

// Serve static files
app.use(express.static(path.join(__dirname, '/')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'unstuck-growth-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict'
  }
}));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Google Sheets Setup
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

// Load credentials and set up Google Sheets API
let sheetsAPI = null;
let usersSheetId = process.env.USERS_SHEET_ID || '1-your-users-sheet-id';
let formsSheetId = process.env.FORMS_SHEET_ID || '1-your-forms-sheet-id';

// Flag to track if we're using Google Sheets or fallback mode
let usingGoogleSheets = false;

async function setupGoogleSheets() {
  try {
    // Check if credentials file exists
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      console.log('Google Sheets credentials file not found. Using fallback storage mode.');
      return false;
    }
    
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: SCOPES,
    });
    
    const client = await auth.getClient();
    sheetsAPI = google.sheets({ version: 'v4', auth: client });
    console.log('Google Sheets API initialized');
    return true;
  } catch (error) {
    console.error('Error setting up Google Sheets:', error);
    return false;
  }
}

// Save user to Google Sheets or fallback to console logging
async function saveUserToSheet(user) {
  if (!usingGoogleSheets) {
    console.log('Fallback mode: User registration captured:', user.email);
    return;
  }
  
  if (!sheetsAPI) {
    console.error('Google Sheets API not initialized');
    return;
  }
  
  try {
    // User data without password
    const userData = [
      user.id.toString(),
      user.fullName,
      user.email,
      user.phone,
      user.age,
      user.businessStage,
      user.industry,
      user.goals,
      user.challenges || '',
      user.referral || '',
      user.newsletter ? 'Yes' : 'No',
      new Date().toISOString()
    ];
    
    // Append to users sheet
    await sheetsAPI.spreadsheets.values.append({
      spreadsheetId: usersSheetId,
      range: 'Users!A:L',
      valueInputOption: 'RAW',
      resource: {
        values: [userData]
      }
    });
    
    console.log(`User ${user.fullName} saved to Google Sheets`);
  } catch (error) {
    console.error('Error saving user to Google Sheets:', error);
  }
}

// Save form submission to Google Sheets or fallback to console logging
async function saveFormToSheet(form) {
  if (!usingGoogleSheets) {
    console.log('Fallback mode: Form submission captured:', form.email);
    return;
  }
  
  if (!sheetsAPI) {
    console.error('Google Sheets API not initialized');
    return;
  }
  
  try {
    // Form data
    const formData = [
      form.userId || '',
      form.fullName,
      form.email,
      form.phone,
      form.message,
      form.serviceInterest || '',
      form.budget || '',
      form.timeline || '',
      new Date().toISOString()
    ];
    
    // Append to forms sheet
    await sheetsAPI.spreadsheets.values.append({
      spreadsheetId: formsSheetId,
      range: 'Forms!A:I',
      valueInputOption: 'RAW',
      resource: {
        values: [formData]
      }
    });
    
    console.log(`Form from ${form.fullName} saved to Google Sheets`);
  } catch (error) {
    console.error('Error saving form to Google Sheets:', error);
  }
}

// Get user by email
function getUserByEmail(email) {
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
}

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'unstuck-growth-jwt-secret');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Email notification setup
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-email-password'
  },
  tls: {
    rejectUnauthorized: false // For development environments
  }
});

// Test email connection
emailTransporter.verify((error, success) => {
  if (error) {
    console.error('Email notification setup error:', error.message);
    console.log('Email notifications will be disabled');
  } else {
    console.log('Email server is ready to send notifications');
  }
});

// Replace Twilio setup with our WhatsApp service
// Comment out or remove Twilio code
// const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
//   ? require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
//   : null;
// const twilioEnabled = !!twilioClient;
// if (!twilioEnabled) {
//   console.log('Twilio not configured or invalid credentials - WhatsApp notifications will be disabled');
// }

// Initialize our WhatsApp service
let whatsappReady = false;

// Notification function
const sendNotifications = async (type, data) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@theunstuckgrowth.com';
  const adminPhone = process.env.ADMIN_PHONE || '+1234567890';
  
  // Email notification
  let emailSent = false;
  try {
    if (!emailTransporter) {
      console.log('Email transporter not available - skipping email notification');
    } else {
      let subject, text;
      
      if (type === 'signup') {
        subject = 'New Young Entrepreneur Sign Up';
        text = `
          New user signed up:
          Name: ${data.fullName}
          Email: ${data.email}
          Phone: ${data.phone}
          Business Stage: ${data.businessStage}
          Industry: ${data.industry}
          Goals: ${data.goals}
        `;
      } else if (type === 'form') {
        subject = 'New Intake Form Submission';
        text = `
          New form submission:
          Name: ${data.fullName}
          Email: ${data.email}
          Phone: ${data.phone}
          Message: ${data.message}
          Service Interest: ${data.serviceInterest || 'Not specified'}
        `;
      }
      
      const emailResult = await emailTransporter.sendMail({
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: adminEmail,
        subject,
        text
      });
      
      console.log('Email notification sent:', emailResult.messageId);
      emailSent = true;
    }
  } catch (error) {
    console.error('Email notification error:', error);
    console.log('Failed to send email notification');
  }
  
  // WhatsApp notification via CallMeBot
  let whatsappSent = false;
  try {
    const message = type === 'signup' 
      ? `New Young Entrepreneur Sign Up: ${data.fullName} (${data.email})`
      : `New Form Submission: ${data.fullName} (${data.email})`;
    
    const result = await callmebot.sendWhatsApp(adminPhone, message);
    whatsappSent = result.success;
    if (whatsappSent) {
      console.log('WhatsApp notification sent via CallMeBot');
    } else {
      console.error('WhatsApp notification failed:', result.error);
    }
  } catch (error) {
    console.error('WhatsApp notification error:', error);
    console.log('Failed to send WhatsApp notification');
  }
  
  return { emailSent, whatsappSent };
};

// Validate Email
function isValidEmail(email) {
  return validator.isEmail(email);
}

// Validate Password Strength
function isStrongPassword(password) {
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  });
}

// Validate Phone Number
function isValidPhone(phone) {
  return validator.isMobilePhone(phone, 'any', { strictMode: false });
}

// Generate Password Reset Token
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Routes
// Register new user
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, email, phone, password, age, businessStage, industry, goals, challenges, referral, newsletter } = req.body;
    
    // Validate required fields
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }
    
    // Validate phone format
    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Please provide a valid phone number' });
    }
    
    // Validate password strength
    if (!isStrongPassword(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long and include lowercase, uppercase, number, and special character' 
      });
    }
    
    // Check if user already exists
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Hash password with higher salt rounds for better security
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user with a simple ID
    const newUser = {
      id: nextUserId++,
      fullName,
      email,
      phone,
      password: hashedPassword,
      age,
      businessStage,
      industry,
      goals,
      challenges,
      referral,
      newsletter: newsletter === true || newsletter === 'on',
      createdAt: new Date(),
      lastLogin: new Date()
    };
    
    // Add to in-memory users array
    users.push(newUser);
    
    // Save to Google Sheets
    saveUserToSheet(newUser);
    
    // Send notifications
    const notificationResults = await sendNotifications('signup', newUser);
    
    // Create token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'unstuck-growth-jwt-secret',
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email
      },
      notificationResults
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user
    const user = getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    
    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'unstuck-growth-jwt-secret',
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Request Password Reset
app.post('/api/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Find user
    const user = getUserByEmail(email);
    if (!user) {
      // Don't reveal that the user doesn't exist for security
      return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent' });
    }
    
    // Generate reset token
    const resetToken = generateResetToken();
    const resetExpiry = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
    
    // Store reset token
    resetTokens.set(resetToken, {
      userId: user.id,
      expiry: resetExpiry
    });
    
    // Create reset URL (in a real app, this would be a frontend URL)
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password.html?token=${resetToken}`;
    
    // Send email with reset link if email transporter is available
    if (emailTransporter) {
      const emailResult = await emailTransporter.sendMail({
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: user.email,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Please click the link below to reset your password. This link is valid for 1 hour.\n\n${resetUrl}\n\nIf you didn't request this, please ignore this email.`
      });
      
      console.log('Password reset email sent:', emailResult.messageId);
    } else {
      console.log('Email transporter not available. Reset URL:', resetUrl);
    }
    
    res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Server error during password reset request' });
  }
});

// Reset Password
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    
    // Validate password strength
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long and include lowercase, uppercase, number, and special character' 
      });
    }
    
    // Find reset token
    const resetData = resetTokens.get(token);
    if (!resetData) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    // Check if token has expired
    if (Date.now() > resetData.expiry) {
      resetTokens.delete(token);
      return res.status(400).json({ error: 'Reset token has expired' });
    }
    
    // Find user
    const user = users.find(u => u.id === resetData.userId);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user password
    user.password = hashedPassword;
    
    // Remove used token
    resetTokens.delete(token);
    
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Server error during password reset' });
  }
});

// Contact form submission
app.post('/api/contact', async (req, res) => {
  try {
    const { fullName, email, phone, message, serviceInterest, budget, timeline } = req.body;
    let userId = null;
    
    // Check if user exists
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      userId = existingUser.id;
    }
    
    // Create form submission
    const newSubmission = {
      userId,
      fullName,
      email,
      phone,
      message,
      serviceInterest,
      budget,
      timeline,
      createdAt: new Date()
    };
    
    // Save to Google Sheets
    saveFormToSheet(newSubmission);
    
    // Send notifications
    const notificationResults = await sendNotifications('form', newSubmission);
    
    res.status(201).json({
      message: 'Form submitted successfully',
      submission: {
        fullName: newSubmission.fullName,
        email: newSubmission.email
      },
      notificationResults
    });
  } catch (error) {
    console.error('Form submission error:', error);
    res.status(500).json({ error: 'Server error during form submission' });
  }
});

// Protected route example
app.get('/api/user-profile', authenticateToken, async (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    
    res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve the entrepreneur-signup.html page
app.get('/entrepreneur-signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'entrepreneur-signup.html'));
});

// Serve login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve dashboard page
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    googleSheets: sheetsAPI ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV
  });
});

// WhatsApp status endpoint - now returns CallMeBot service info
app.get('/api/whatsapp-status', (req, res) => {
  res.status(200).json({
    provider: 'CallMeBot API',
    setupInstructions: callmebot.getSetupInstructions()
  });
});

// Test WhatsApp notification - update to use CallMeBot
app.post('/api/test-whatsapp', async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number and message are required' 
      });
    }
    
    const result = await callmebot.sendWhatsApp(phone, message);
    
    if (result.success) {
      res.status(200).json({ 
        success: true, 
        message: 'WhatsApp message sent successfully via CallMeBot' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error || 'Failed to send WhatsApp message' 
      });
    }
  } catch (error) {
    console.error('Test WhatsApp error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error sending WhatsApp message' 
    });
  }
});

// WhatsApp test page
app.get('/whatsapp-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'whatsapp-test.html'));
});

// Create a simple reset-password.html page
app.get('/reset-password.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'reset-password.html'));
});

// Serve error page
app.get('/error', (req, res) => {
  res.sendFile(path.join(__dirname, 'error.html'));
});

// Catch-all route to serve the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Check if headers have already been sent
  if (res.headersSent) {
    return next(err);
  }
  
  // For API requests, return JSON error
  if (req.path.startsWith('/api/')) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message || 'Something went wrong on the server',
      status: 500
    });
  }
  
  // For non-API requests, redirect to error page
  const errorDetails = encodeURIComponent(err.message || 'Unexpected server error');
  res.redirect(`/error?code=500&message=Internal Server Error&details=${errorDetails}`);
});

// Start server
async function startServer() {
  // Try to setup Google Sheets
  usingGoogleSheets = await setupGoogleSheets();
  
  // Start the Express server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Storage mode: ${usingGoogleSheets ? 'Google Sheets' : 'Fallback (console logging)'}`);
    console.log(`WhatsApp notifications: CallMeBot API (no authentication needed)`);
    console.log(`To test WhatsApp, visit: http://localhost:${PORT}/whatsapp-test`);
  });
}

startServer(); 