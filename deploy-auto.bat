@echo off
REM Speed Motioner Auto Deployment Script
REM This script runs the deployment with retry logic until it succeeds

echo.
echo ========================================
echo Speed Motioner Auto Deployment
echo ========================================
echo.

REM Check if PowerShell script exists
if not exist "deploy-with-retry.ps1" (
    echo ERROR: deploy-with-retry.ps1 not found!
    echo Please ensure the deployment script exists.
    pause
    exit /b 1
)

REM Run the deployment script with retry logic
echo Starting deployment with retry logic...
echo.

powershell -ExecutionPolicy Bypass -File deploy-with-retry.ps1 -SkipTests

REM Check if deployment was successful
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo DEPLOYMENT SUCCESSFUL!
    echo ========================================
    echo.
    echo Your application is now live at:
    echo GitHub: https://github.com/netn10/Speed-Motioner
    echo Heroku: https://speed-motioner-640587c36085.herokuapp.com/
    echo.
) else (
    echo.
    echo ========================================
    echo DEPLOYMENT FAILED!
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo You can try running the script again.
    echo.
)

pause
