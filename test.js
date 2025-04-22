require('dotenv').config();
const { google } = require('googleapis');
const path = require('path');

// Google Sheets Setup
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

// Sheet IDs
const usersSheetId = process.env.USERS_SHEET_ID || '1-your-users-sheet-id';
const formsSheetId = process.env.FORMS_SHEET_ID || '1-your-forms-sheet-id';

// Test function to verify Google Sheets setup
async function testGoogleSheets() {
  try {
    console.log('Testing Google Sheets API connection...');
    console.log('Credentials path:', CREDENTIALS_PATH);
    
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: SCOPES,
    });
    
    // Get auth client
    const client = await auth.getClient();
    console.log('Auth client created successfully');
    
    // Initialize sheets API
    const sheetsAPI = google.sheets({ version: 'v4', auth: client });
    console.log('Google Sheets API initialized');
    
    // Test write to both sheets
    const testUser = {
      id: 'test-123',
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '123-456-7890',
      age: '25-34',
      businessStage: 'idea',
      industry: 'technology',
      goals: 'Testing the API',
      challenges: 'Integration testing',
      referral: 'test',
      newsletter: true
    };
    
    console.log('Writing test user to users sheet...');
    await writeTestUser(sheetsAPI, testUser);
    
    const testForm = {
      userId: 'test-123',
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '123-456-7890',
      message: 'This is a test message',
      serviceInterest: 'startup-advisory',
      budget: '1000-5000',
      timeline: 'immediate'
    };
    
    console.log('Writing test form to forms sheet...');
    await writeTestForm(sheetsAPI, testForm);
    
    console.log('Test completed successfully!');
    
    // Clean up (optional)
    console.log('Cleaning up test data...');
    await cleanupTestData(sheetsAPI);
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Error testing Google Sheets API:', error);
  }
}

// Write test user
async function writeTestUser(sheetsAPI, user) {
  try {
    // User data without password
    const userData = [
      user.id,
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
    const response = await sheetsAPI.spreadsheets.values.append({
      spreadsheetId: usersSheetId,
      range: 'Users!A:L',
      valueInputOption: 'RAW',
      resource: {
        values: [userData]
      }
    });
    
    console.log('Test user written successfully:', response.data);
    return response;
  } catch (error) {
    console.error('Error writing test user:', error);
    throw error;
  }
}

// Write test form
async function writeTestForm(sheetsAPI, form) {
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
    const response = await sheetsAPI.spreadsheets.values.append({
      spreadsheetId: formsSheetId,
      range: 'Forms!A:I',
      valueInputOption: 'RAW',
      resource: {
        values: [formData]
      }
    });
    
    console.log('Test form written successfully:', response.data);
    return response;
  } catch (error) {
    console.error('Error writing test form:', error);
    throw error;
  }
}

// Clean up test data
async function cleanupTestData(sheetsAPI) {
  try {
    // This is a simplified approach - Google Sheets API doesn't have a direct "delete row" function
    // In a real scenario, you'd need to search for the test data and then update the range to empty values
    console.log('Note: In a real application, you would implement proper cleanup logic');
    console.log('For this test, manual cleanup may be required');
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
}

// Run the test
testGoogleSheets(); 