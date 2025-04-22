#!/bin/bash

# Test script for The Unstuck Growth website

echo "=== Testing The Unstuck Growth Website ==="
echo ""

# 1. Check if Node.js is installed
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null
then
    echo "Node.js is not installed. Please install Node.js to continue."
    exit 1
fi
echo "Node.js version: $(node -v)"
echo ""

# 2. Check if npm is installed
echo "Checking npm installation..."
if ! command -v npm &> /dev/null
then
    echo "npm is not installed. Please install npm to continue."
    exit 1
fi
echo "npm version: $(npm -v)"
echo ""

# 3. Check if required files exist
echo "Checking required files..."
required_files=("server.js" "package.json" ".env" "credentials.json")
for file in "${required_files[@]}"
do
    if [ ! -f "$file" ]; then
        echo "ERROR: Required file '$file' is missing."
        exit 1
    fi
done
echo "All required files found."
echo ""

# 4. Check if Google Sheets API is set up
echo "Testing Google Sheets API connection..."
node test.js
if [ $? -ne 0 ]; then
    echo "ERROR: Google Sheets API test failed."
    echo "Please check your credentials.json file and sheet IDs in .env file."
    exit 1
fi
echo ""

# 5. Test server startup
echo "Testing server startup..."
node -e "
const http = require('http');
const { fork } = require('child_process');

let serverProcess = fork('server.js', [], { silent: true });
let serverStarted = false;
let serverError = null;

serverProcess.stdout.on('data', (data) => {
    console.log(data.toString().trim());
    if (data.toString().includes('Server running')) {
        serverStarted = true;
        testEndpoint();
    }
});

serverProcess.stderr.on('data', (data) => {
    serverError = data.toString();
    console.error('Server error:', serverError);
});

function testEndpoint() {
    setTimeout(() => {
        http.get('http://localhost:3000/api/health', (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                console.log('Health check response:', data);
                console.log('Server started successfully!');
                serverProcess.kill();
                process.exit(0);
            });
        }).on('error', (err) => {
            console.error('Health check failed:', err.message);
            serverProcess.kill();
            process.exit(1);
        });
    }, 1000);
}

// Kill server after timeout
setTimeout(() => {
    if (!serverStarted) {
        console.error('Server failed to start within timeout period.');
        if (serverError) {
            console.error('Error:', serverError);
        }
        serverProcess.kill();
        process.exit(1);
    }
}, 5000);
"

if [ $? -ne 0 ]; then
    echo "ERROR: Server startup test failed."
    exit 1
fi
echo ""

echo "=== All tests passed! ==="
echo "The website is ready for deployment."
echo ""
echo "To start the server:"
echo "npm start"
echo ""
echo "For development with auto-reload:"
echo "npm run dev"
echo "" 