# Test script for The Unstuck Growth website (PowerShell version)

Write-Host "=== Testing The Unstuck Growth Website ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed. Please install Node.js to continue." -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. Check if npm is installed
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm -v
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "npm is not installed. Please install npm to continue." -ForegroundColor Red
    exit 1
}
Write-Host ""

# 3. Check if required files exist
Write-Host "Checking required files..." -ForegroundColor Yellow
$requiredFiles = @("server.js", "package.json", ".env", "credentials.json")
$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "ERROR: The following required files are missing:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "  - $file" -ForegroundColor Red
    }
    exit 1
} else {
    Write-Host "All required files found." -ForegroundColor Green
}
Write-Host ""

# 4. Check if Google Sheets API is set up
Write-Host "Testing Google Sheets API connection..." -ForegroundColor Yellow
try {
    node test.js
    if ($LASTEXITCODE -ne 0) {
        throw "Google Sheets API test failed."
    }
    Write-Host "Google Sheets API connection successful." -ForegroundColor Green
} catch {
    Write-Host "ERROR: Google Sheets API test failed." -ForegroundColor Red
    Write-Host "Please check your credentials.json file and sheet IDs in .env file." -ForegroundColor Red
    exit 1
}
Write-Host ""

# 5. Test server startup
Write-Host "Testing server startup..." -ForegroundColor Yellow
$testScript = @"
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
"@

Set-Content -Path "temp-test-server.js" -Value $testScript
try {
    node temp-test-server.js
    if ($LASTEXITCODE -ne 0) {
        throw "Server startup test failed."
    }
    Write-Host "Server startup test successful." -ForegroundColor Green
} catch {
    Write-Host "ERROR: Server startup test failed." -ForegroundColor Red
    exit 1
} finally {
    Remove-Item -Path "temp-test-server.js" -ErrorAction SilentlyContinue
}
Write-Host ""

Write-Host "=== All tests passed! ===" -ForegroundColor Cyan
Write-Host "The website is ready for deployment." -ForegroundColor Green
Write-Host ""
Write-Host "To start the server:" -ForegroundColor Yellow
Write-Host "npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "For development with auto-reload:" -ForegroundColor Yellow
Write-Host "npm run dev" -ForegroundColor Cyan
Write-Host "" 