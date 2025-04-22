@echo off
echo Starting The Unstuck Growth server...
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Error: Node.js is not installed or not in PATH.
  echo Please install Node.js from https://nodejs.org/
  pause
  exit /b 1
)

:: Check if server.js exists
if not exist server.js (
  echo Error: server.js file not found.
  echo Please make sure you are in the correct directory.
  pause
  exit /b 1
)

:: Start the server in production mode
echo Starting server in production mode...
call npm run prod

echo.
echo Server is now running in the background.
echo Check the logs directory for output and error logs.
echo.
echo You can safely close this window.
echo.
pause 