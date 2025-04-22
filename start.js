const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting The Unstuck Growth server...');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create log files
const out = fs.openSync(path.join(logsDir, 'output.log'), 'a');
const err = fs.openSync(path.join(logsDir, 'error.log'), 'a');

// Start the server as a detached process
const serverProcess = spawn('node', ['server.js'], {
  detached: true,
  stdio: ['ignore', out, err]
});

// Unref the child process
serverProcess.unref();

console.log(`Server started with PID: ${serverProcess.pid}`);
console.log('The server is now running in the background.');
console.log('To stop the server, run: taskkill /F /PID ' + serverProcess.pid);
console.log('Logs are being written to the logs directory.'); 