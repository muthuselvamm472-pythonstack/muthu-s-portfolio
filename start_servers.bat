@echo off
title Muthu Portfolio Dev Servers
echo ============================================================
echo   Starting Muthu Portfolio Full-Stack Dev Servers
echo ============================================================
echo.
echo [1/2] Starting Django REST Backend (http://127.0.0.1:8000)...
start "Portfolio Backend (Django 8000)" cmd /k "cd /d %~dp0backend && python manage.py runserver 127.0.0.1:8000"

echo [2/2] Starting Vite React Frontend (http://127.0.0.1:3000)...
start "Portfolio Frontend (Vite 3000)" cmd /k "cd /d %~dp0frontend && npm run dev -- --host 127.0.0.1 --port 3000"

echo.
echo ============================================================
echo  Both servers started successfully in separate windows!
echo  - Public Website: http://localhost:3000
echo  - Admin Panel:    http://localhost:3000/#/admin
echo  - Backend API:    http://localhost:8000/api/portfolio/
echo ============================================================
echo Keep the server windows open while working.
echo.
pause
