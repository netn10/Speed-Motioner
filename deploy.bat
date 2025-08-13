@echo off
REM Speed Motioner Deployment Script for Windows
REM This script deploys the application to both GitHub and Heroku

echo.
echo 🚀 Starting Speed Motioner Deployment
echo =====================================
echo.

REM Check if git is available
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if node is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if heroku is available
heroku --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Heroku CLI is not installed or not in PATH
    pause
    exit /b 1
)

echo ✅ All prerequisites are installed
echo.

REM Build frontend
echo 🔨 Building frontend...
call npm run build:local
if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Build completed
echo.

REM Stage all changes
echo 📦 Staging changes...
git add .
if errorlevel 1 (
    echo ❌ Failed to stage changes
    pause
    exit /b 1
)

REM Commit changes
echo 💾 Committing changes...
set "timestamp=%date:~10,4%-%date:~4,2%-%date:~7,2% %time:~0,2%:%time:~3,2%:%time:~6,2%"
git commit -m "Auto-deploy: %timestamp%"
if errorlevel 1 (
    echo ❌ Failed to commit changes
    pause
    exit /b 1
)

REM Push to GitHub
echo 🌐 Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo ⚠️ GitHub push failed, but continuing with Heroku deployment...
)

REM Deploy to Heroku
echo ☁️ Deploying to Heroku...
git push heroku main
if errorlevel 1 (
    echo ❌ Heroku deployment failed
    pause
    exit /b 1
)

echo.
echo 🎉 Deployment completed successfully!
echo GitHub: https://github.com/netn10/Speed-Motioner
echo Heroku: https://speed-motioner-640587c36085.herokuapp.com/
echo.

pause
