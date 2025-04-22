/**
 * CallMeBot WhatsApp API Service
 * This service uses the free CallMeBot API to send WhatsApp messages
 * More info: https://www.callmebot.com/blog/free-api-whatsapp-messages/
 */
const axios = require('axios');

// API endpoint
const CALLMEBOT_API_URL = 'https://api.callmebot.com/whatsapp.php';

/**
 * Send a WhatsApp message using CallMeBot API
 * Note: Recipient must first activate their phone with CallMeBot
 * Instructions: https://www.callmebot.com/blog/free-api-whatsapp-messages/
 * 
 * @param {string} phone - Phone number with country code (e.g., +1234567890)
 * @param {string} text - Message text
 * @param {string} apiKey - Optional API key (if not provided, needs to be set up separately)
 * @returns {Promise<object>} - Result of the API call
 */
async function sendWhatsApp(phone, text, apiKey = null) {
  try {
    if (!phone || !text) {
      throw new Error('Phone number and message text are required');
    }
    
    // Format phone number (remove non-numeric characters except the + sign)
    const formattedPhone = phone.trim().replace(/[^\d+]/g, '');
    
    // Build API request parameters
    const params = {
      phone: formattedPhone,
      text: text,
      apikey: apiKey || process.env.CALLMEBOT_API_KEY
    };
    
    // Add API key if it exists
    if (!params.apikey) {
      console.warn('No CallMeBot API key provided. Recipients must set up their phone with CallMeBot first.');
    }
    
    // Make API request
    const response = await axios.get(CALLMEBOT_API_URL, {
      params,
      timeout: 10000 // 10 seconds timeout
    });
    
    // Check for error response
    if (response.data && response.data.includes('ERROR')) {
      const errorMsg = response.data.split('\n')[0];
      throw new Error(`CallMeBot API error: ${errorMsg}`);
    }
    
    // Return success
    console.log(`Message sent to ${formattedPhone} via CallMeBot`);
    return {
      success: true,
      message: 'WhatsApp message sent successfully',
      recipientPhone: formattedPhone
    };
  } catch (error) {
    console.error('CallMeBot WhatsApp sending error:', error.message);
    return {
      success: false,
      error: error.message,
      recipientPhone: phone
    };
  }
}

/**
 * Instructions for setting up CallMeBot
 * @returns {string} - Setup instructions
 */
function getSetupInstructions() {
  return `
To use the free CallMeBot WhatsApp API:

1. Each recipient must activate their phone number by sending this message:
   'I allow callmebot to send me messages' to +34 603 21 25 97 on WhatsApp

2. After activation, CallMeBot will send an API key via WhatsApp
   This key should be added to your .env file:
   CALLMEBOT_API_KEY=your_api_key

3. You can then send messages to this activated phone number
   even without sharing the API key (just the phone number is needed)
   
For more details visit: https://www.callmebot.com/blog/free-api-whatsapp-messages/
`;
}

module.exports = {
  sendWhatsApp,
  getSetupInstructions
}; 