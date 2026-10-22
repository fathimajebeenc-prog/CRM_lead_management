@echo off
title LeadFlow launcher
start "LeadFlow Backend" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate.bat && python manage.py runserver"
start "LeadFlow Frontend" cmd /k "cd /d %~dp0frontend && npm run dev -- --port 5173 --strictPort"
echo Waiting for the app to start, please wait...
powershell -NoProfile -Command "$t=0; while(-not ((Test-NetConnection -ComputerName 127.0.0.1 -Port 8000 -InformationLevel Quiet) -and (Test-NetConnection -ComputerName localhost -Port 5173 -InformationLevel Quiet)) -and $t -lt 90){Start-Sleep -Seconds 1; $t++}"
timeout /t 2 >nul
start http://localhost:5173