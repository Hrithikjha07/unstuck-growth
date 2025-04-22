# The Unstuck Growth - Young Entrepreneurs Platform

A secure and interactive platform for young entrepreneurs to register, log in, and access resources for business growth and development.

## Features

- **User Authentication**: Secure signup/login system with JWT tokens
- **Password Security**: Strong password requirements, secure reset functionality
- **Form Submissions**: Captures entrepreneur information and contact form submissions
- **Notifications**: Email and WhatsApp notifications for administrators
- **User Dashboard**: Personalized dashboard for entrepreneurs
- **Data Storage**: Flexible storage options (Google Sheets or in-memory with possible MongoDB integration)
- **Security**: Rate limiting, XSS protection, HTTPS enforcement, CSRF protection

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Authentication**: JWT (JSON Web Tokens)
- **Storage**: Google Sheets API (with in-memory fallback)
- **Notifications**: Nodemailer (Email) + CallMeBot (WhatsApp)
- **Security**: Helmet, XSS-Clean, Express-Rate-Limit

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- NPM or Yarn
- Google Cloud Platform account (for Google Sheets API)
- Gmail account (for email notifications)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/unstuck-growth.git
   cd unstuck-growth
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   - Generate strong random strings for JWT_SECRET and SESSION_SECRET
   - Add Google Sheets IDs
   - Configure email settings
   - Set up CallMeBot WhatsApp integration

5. Set up Google Sheets API:
   - Create a project in Google Cloud Console
   - Enable Google Sheets API
   - Create a service account
   - Generate and download credentials.json
   - Place credentials.json in the project root
   - Create two Google Sheets:
     - One for user data with columns: ID, Full Name, Email, Phone, Age, Business Stage, Industry, Goals, Challenges, Referral, Newsletter, Created At
     - One for form submissions with columns: User ID, Full Name, Email, Phone, Message, Service Interest, Budget, Timeline, Created At
   - Share both sheets with the service account email

6. Start the server:
   ```
   npm start
   ```

7. Access the website:
   ```
   http://localhost:3000
   ```

## Security Recommendations

1. **Strong Secrets**: Generate strong random values for JWT_SECRET and SESSION_SECRET
   ```
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **HTTPS**: Always use HTTPS in production

3. **Email Security**: Use app-specific passwords for Gmail
   - Go to your Google Account > Security > App passwords
   - Generate a new app password for this application
   - Use this password in the .env file instead of your regular password

4. **WhatsApp Notifications**:
   - Follow the CallMeBot setup instructions at https://www.callmebot.com/blog/free-api-whatsapp-messages/
   - Send "I allow callmebot to send me messages" to +34 603 21 25 97 on WhatsApp
   - Use the provided API key in your .env file

5. **Regular Updates**: Keep dependencies up-to-date to patch security vulnerabilities
   ```
   npm audit fix
   ```

6. **Data Storage**: For production, consider replacing in-memory storage with a proper database
   - MongoDB integration is partially prepared in the codebase

## File Structure

- `server.js` - Main Express server and API endpoints
- `auth.js` - Client-side authentication logic
- `callmebot-service.js` - WhatsApp notification integration
- `dashboard.js` - Dashboard functionality
- `*.html` - Website pages
- `styles.css` - Styling
- `script.js` - Common JavaScript functionality

## Google Sheets Integration Troubleshooting

If you encounter issues with Google Sheets integration:

1. Verify your credentials.json file is valid and properly formatted
2. Ensure the service account has edit permissions on your Google Sheets
3. Check that sheet names in your Google Sheets document match those in the code ("Users" and "Forms")
4. If errors persist, the system will fall back to in-memory storage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License 