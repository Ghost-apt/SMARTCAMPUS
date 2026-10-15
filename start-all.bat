@echo off
title SmartCampus AI — Full Stack Services
echo ============================================================
echo   SmartCampus AI - Starting All Services...
echo ============================================================
cd /d "%~dp0"
node scripts/start-all.js
pause
