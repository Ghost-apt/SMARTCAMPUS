@echo off
title SmartCampus AI — Trust Development Root CA
color 0A
echo ======================================================================
echo    SmartCampus AI — Install Local Root CA into Windows Store
echo ======================================================================
echo.
echo This utility registers the "SmartCampus AI Development Root CA" into your
echo Windows "Trusted Root Certification Authorities" store.
echo.
echo When the Windows Security Warning dialog pops up asking:
echo    "Do you want to install this certificate?"
echo.
echo ==^> Please click [ YES ] to authorize the Root CA.
echo.
echo ======================================================================
echo.

set CA_FILE=%~dp0..\certs\smartcampus-ca.crt
if not exist "%CA_FILE%" set CA_FILE=%~dp0..\certs\smartcampus-ca.pem

if not exist "%CA_FILE%" (
    echo [ERROR] CA Certificate file not found at: %CA_FILE%
    echo Please run "npm --prefix client run generate-cert" first.
    pause
    exit /b 1
)

certutil -addstore -user "Root" "%CA_FILE%"

if %ERRORLEVEL% equ 0 (
    echo.
    echo ======================================================================
    echo [SUCCESS] Root CA installed into Trusted Root Authorities!
    echo.
    echo Next Steps:
    echo 1. Close and reopen Google Chrome (or your browser).
    echo 2. Navigate to: https://192.168.208.1:5173 or https://localhost:5173
    echo 3. You will now see the verified secure padlock [🔒] with 0 warnings!
    echo ======================================================================
) else (
    echo.
    echo [INFO] Certificate installation was canceled or not completed.
)

echo.
pause
