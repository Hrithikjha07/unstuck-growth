const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Global client
let whatsappClient = null;
let isClientReady = false;
let pendingMessages = [];
let connectionAttempts = 0;
const MAX_RETRIES = 3;

/**
 * Initialize the WhatsApp client
 * @returns {Promise<void>}
 */
async function initWhatsApp() {
  try {
    // Don't retry too many times
    if (connectionAttempts >= MAX_RETRIES) {
      console.log(`Exceeded ${MAX_RETRIES} WhatsApp connection attempts, stopping retries`);
      return;
    }
    
    connectionAttempts++;
    console.log(`Initializing WhatsApp client (attempt ${connectionAttempts})...`);
    
    // Create client with local authentication
    whatsappClient = new Client({
      authStrategy: new LocalAuth({ clientId: "unstuck-growth-wa" }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ],
        timeout: 60000
      }
    });

    // QR code event handler
    whatsappClient.on('qr', (qr) => {
      console.log('=======================================================');
      console.log('SCAN THIS QR CODE WITH YOUR WHATSAPP MOBILE APPLICATION:');
      qrcode.generate(qr, { small: true });
      console.log('=======================================================');
      console.log('OR visit http://localhost:3000/whatsapp-test to test notifications');
    });

    // Ready event handler
    whatsappClient.on('ready', () => {
      console.log('WhatsApp client is ready! You can now send notifications.');
      isClientReady = true;
      connectionAttempts = 0; // Reset counter on success
      
      // Process any pending messages
      processPendingMessages();
    });

    // Authentication failure handler
    whatsappClient.on('auth_failure', (msg) => {
      console.error('WhatsApp authentication failed:', msg);
      isClientReady = false;
      
      // Retry after auth failure
      setTimeout(() => {
        console.log('Retrying WhatsApp connection after auth failure...');
        initWhatsApp();
      }, 10000);
    });

    // Disconnected event handler
    whatsappClient.on('disconnected', (reason) => {
      console.log('WhatsApp client disconnected:', reason);
      isClientReady = false;
      
      // Retry after disconnection
      setTimeout(() => {
        console.log('Retrying WhatsApp connection after disconnection...');
        initWhatsApp();
      }, 10000);
    });

    // Initialize the client
    await whatsappClient.initialize();

  } catch (error) {
    console.error('Error initializing WhatsApp client:', error);
    whatsappClient = null;
    isClientReady = false;
    
    // Retry after error with increasing delay
    const retryDelay = 5000 * connectionAttempts;
    console.log(`Will retry WhatsApp initialization in ${retryDelay / 1000} seconds...`);
    
    setTimeout(() => {
      initWhatsApp();
    }, retryDelay);
  }
}

/**
 * Process any pending messages once client is ready
 */
async function processPendingMessages() {
  if (pendingMessages.length > 0 && isClientReady) {
    console.log(`Processing ${pendingMessages.length} pending WhatsApp messages`);
    
    for (const msg of pendingMessages) {
      try {
        await sendMessage(msg.phone, msg.text, true);
        console.log(`Sent pending message to: ${msg.phone}`);
      } catch (error) {
        console.error(`Failed to send pending message to ${msg.phone}:`, error);
      }
    }
    
    // Clear pending messages
    pendingMessages = [];
  }
}

/**
 * Format the phone number for WhatsApp
 * @param {string} phone - The phone number to format
 * @returns {string} - Formatted phone number
 */
function formatPhoneNumber(phone) {
  // Remove any non-numeric characters
  const numericPhone = phone.replace(/\D/g, '');
  
  // Ensure the phone number includes country code (default to +1 if not provided)
  if (numericPhone.length <= 10) {
    return `1${numericPhone.padStart(10, '0')}@c.us`;
  }
  
  return `${numericPhone}@c.us`;
}

/**
 * Send a WhatsApp message
 * @param {string} phone - The recipient's phone number
 * @param {string} text - The message to send
 * @param {boolean} fromQueue - Whether this is from the pending queue
 * @returns {Promise<boolean>} - Whether the message was sent successfully
 */
async function sendMessage(phone, text, fromQueue = false) {
  try {
    if (!whatsappClient || !isClientReady) {
      // Store message for later if client is not ready
      if (!fromQueue) {
        pendingMessages.push({ phone, text });
        console.log(`WhatsApp client not ready. Message to ${phone} queued.`);
      }
      return false;
    }
    
    const chatId = formatPhoneNumber(phone);
    await whatsappClient.sendMessage(chatId, text);
    console.log(`WhatsApp message sent to ${phone}`);
    return true;
  } catch (error) {
    console.error(`Error sending WhatsApp message to ${phone}:`, error);
    
    // Add to queue if not already from queue
    if (!fromQueue) {
      pendingMessages.push({ phone, text });
      console.log(`Failed to send WhatsApp message, queued for retry.`);
    }
    
    return false;
  }
}

/**
 * Get the status of the WhatsApp connection
 * @returns {Object} Status information
 */
function getStatus() {
  return {
    ready: isClientReady,
    connectionAttempts,
    pendingMessages: pendingMessages.length
  };
}

module.exports = {
  initWhatsApp,
  sendMessage,
  getStatus
}; 