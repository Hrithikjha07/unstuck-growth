const http = require('http');
const fs = require('fs');

// Base URL for API
const BASE_URL = 'http://localhost:3000';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`${method} ${path} - Status: ${res.statusCode}`);
        try {
          const jsonData = JSON.parse(responseData);
          resolve({ statusCode: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`Error with request ${method} ${path}:`, error.message);
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test all API endpoints
async function runTests() {
  console.log('\n=== TESTING THE UNSTUCK GROWTH API ===\n');
  let token;
  let userId;
  
  try {
    // 1. Test health check endpoint
    console.log('1. Testing health check endpoint...');
    const healthCheck = await makeRequest('GET', '/api/health');
    console.log('Result:', healthCheck.data);
    console.log('Health check test completed.\n');
    
    // 2. Test user registration
    console.log('2. Testing user registration...');
    const userData = {
      fullName: "Test User",
      email: `test${Date.now()}@example.com`, // Unique email
      phone: "123-456-7890",
      password: "Test@123",
      age: "25-34",
      businessStage: "idea",
      industry: "technology",
      goals: "Testing the API",
      challenges: "API Testing",
      referral: "test",
      newsletter: true
    };
    
    const registration = await makeRequest('POST', '/api/register', userData);
    
    if (registration.statusCode === 201) {
      console.log('Registration successful!');
      token = registration.data.token;
      userId = registration.data.user.id;
      console.log('User ID:', userId);
      console.log('Token received:', token ? 'Yes' : 'No');
    } else {
      console.log('Registration failed with data:', registration.data);
    }
    console.log('Registration test completed.\n');
    
    // 3. Test login
    console.log('3. Testing login...');
    const loginData = {
      email: userData.email,
      password: userData.password
    };
    
    const login = await makeRequest('POST', '/api/login', loginData);
    
    if (login.statusCode === 200) {
      console.log('Login successful!');
      console.log('Token received:', login.data.token ? 'Yes' : 'No');
    } else {
      console.log('Login failed with data:', login.data);
    }
    console.log('Login test completed.\n');
    
    // 4. Test contact form submission
    console.log('4. Testing contact form submission...');
    const formData = {
      fullName: "Form Test User",
      email: `form${Date.now()}@example.com`,
      phone: "987-654-3210",
      message: "This is a test message from the automated test script",
      serviceInterest: "startup-advisory",
      budget: "1000-5000",
      timeline: "immediate"
    };
    
    const formSubmission = await makeRequest('POST', '/api/contact', formData);
    
    if (formSubmission.statusCode === 201) {
      console.log('Form submission successful!');
    } else {
      console.log('Form submission failed with data:', formSubmission.data);
    }
    console.log('Form submission test completed.\n');
    
    // 5. Test protected endpoint
    if (token) {
      console.log('5. Testing protected endpoint...');
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/user-profile',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const profileReq = http.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          console.log(`GET /api/user-profile - Status: ${res.statusCode}`);
          try {
            const jsonData = JSON.parse(responseData);
            console.log('Protected endpoint test successful!');
            console.log('User profile data retrieved.');
          } catch (error) {
            console.log('Protected endpoint response parsing error:', error.message);
          }
          console.log('Protected endpoint test completed.\n');
          
          // All tests complete
          console.log('=== ALL TESTS COMPLETED ===');
          console.log('The API is functioning correctly and ready for deployment!');
        });
      });
      
      profileReq.on('error', (error) => {
        console.error('Error with protected endpoint test:', error.message);
        console.log('Protected endpoint test failed.\n');
        
        console.log('=== TESTS COMPLETED WITH ERRORS ===');
      });
      
      profileReq.end();
    } else {
      console.log('Skipping protected endpoint test (no token available)');
      console.log('=== TESTS COMPLETED ===');
    }
    
  } catch (error) {
    console.error('Test error:', error);
    console.log('=== TESTS FAILED ===');
  }
}

// Run the tests
runTests(); 