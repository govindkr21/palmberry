@echo off
REM PalmBerry Local Development Setup Script
REM This script will install all dependencies and prepare your project

echo.
echo ================================
echo 🌴 PalmBerry Setup Script
echo ================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js is installed: 
node --version
echo.

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed!
    echo Please reinstall Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ npm is installed: 
npm --version
echo.

echo Installing dependencies...
echo.

REM Install root dependencies
echo 📦 Installing root dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)
echo ✅ Root dependencies installed
echo.

REM Install server dependencies
echo 📦 Installing server dependencies...
cd server
call npm install
if errorlevel 1 (
    echo ❌ Failed to install server dependencies
    cd ..
    pause
    exit /b 1
)
echo ✅ Server dependencies installed
cd ..
echo.

REM Install client dependencies
echo 📦 Installing client dependencies...
cd client
call npm install
if errorlevel 1 (
    echo ❌ Failed to install client dependencies
    cd ..
    pause
    exit /b 1
)
echo ✅ Client dependencies installed
cd ..
echo.

echo.
echo ================================
echo ✨ Setup Complete!
echo ================================
echo.
echo To start development:
echo.
echo Option 1: Run both servers in one terminal
echo   npm run dev
echo.
echo Option 2: Run servers in separate terminals
echo   Terminal 1: npm run server
echo   Terminal 2: npm run client
echo.
echo Your app will be available at:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo.
echo Admin Panel: http://localhost:3000/admin
echo.
pause
