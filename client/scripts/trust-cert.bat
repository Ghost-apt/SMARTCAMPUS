@echo off
title SmartCampus AI — Trust Development SSL Certificate
color 0A
echo ======================================================================
echo    SmartCampus AI — Install Local SSL Certificate into Windows
echo ======================================================================
echo.
echo This utility will register the development SSL certificate into your
echo Windows "Trusted Root Certification Authorities" store.
echo.
echo When the Windows Security Warning dialog pops up asking:
echo    "Do you want to install this certificate?"
echo.
echo ==^> Please click [ YES ] to authorize the certificate.
echo.
echo ======================================================================
echo.

set CERT_FILE=%~dp0..\certs\cert.pem

if not exist "%CERT_FILE%" (
    echo [ERROR] Certificate file not found at: %CERT_FILE%
    echo Please run "npm --prefix client run generate-cert" first.
    pause
    exit /b 1
)

certutil -addstore -user "Root" "%CERT_FILE%"

if %ERRORLEVEL% equ 0 (
    echo.
    echo ======================================================================
    echo [SUCCESS] Certificate installed into Trusted Root Authorities!
    echo.
    echo Next Steps:
    echo 1. Close and reopen Google Chrome (or your browser).
    echo 2. Navigate to: https://192.168.1.45:5173 or https://localhost:5173
    echo 3. You will now see the secure padlock icon [🔒] with zero warnings!
    echo ======================================================================
) else (
    echo.
    echo [INFO] Certificate installation was canceled or not completed.
)

echo.
pause
