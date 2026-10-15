@echo off
title SmartCampus AI — Stop Services
echo ============================================================
echo   SmartCampus AI - Stopping All Services...
echo ============================================================
cd /d "%~dp0"
node scripts/stop-all.js
pause
