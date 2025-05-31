@echo off
REM StudyFlow AI Platform - Service Startup Script for Windows
REM This script starts all microservices for the StudyFlow platform

echo 🚀 Starting StudyFlow AI Platform Services...
echo ==============================================

echo 📦 Installing dependencies...

REM Install root dependencies (frontend)
echo Installing frontend dependencies...
call npm install

REM Install gateway dependencies
echo Installing gateway dependencies...
cd gateway
call npm install
cd ..

REM Install backend service dependencies
echo Installing backend service dependencies...
cd backend\auth-service
call npm install
cd ..\..

cd backend\ingestion-service
call npm install
cd ..\..

cd backend\analytics-service
call npm install
cd ..\..

cd backend\scheduler-service
call npm install
cd ..\..

cd backend\notification-service
call npm install
cd ..\..

REM Install Python dependencies for NLP service
echo Installing NLP service dependencies...
cd backend\nlp-service
pip install -r requirements.txt
cd ..\..

echo.
echo 🗄️ Starting database services (optional)...
echo If you have Docker installed, starting database services...
docker-compose up -d 2>nul
if %errorlevel% equ 0 (
    echo ✅ Database services started
) else (
    echo ⚠️ Docker Compose not found or failed. Skipping database startup.
    echo Services will run with in-memory storage.
)

echo.
echo 🎯 Starting all services...
echo This will open multiple command prompt windows

REM Start services in new command prompt windows
start "API Gateway" cmd /k "cd /d %cd%\gateway && node index.js"
timeout /t 2 /nobreak >nul

start "Auth Service" cmd /k "cd /d %cd%\backend\auth-service && node index.js"
timeout /t 2 /nobreak >nul

start "Ingestion Service" cmd /k "cd /d %cd%\backend\ingestion-service && npm start"
timeout /t 2 /nobreak >nul

start "NLP Service" cmd /k "cd /d %cd%\backend\nlp-service && uvicorn server:app --host 0.0.0.0 --port 3003 --reload"
timeout /t 2 /nobreak >nul

start "Scheduler Service" cmd /k "cd /d %cd%\backend\scheduler-service && node src\index.js"
timeout /t 2 /nobreak >nul

start "Analytics Service" cmd /k "cd /d %cd%\backend\analytics-service && node src\index.js"
timeout /t 2 /nobreak >nul

start "Notification Service" cmd /k "cd /d %cd%\backend\notification-service && node src\index.js"
timeout /t 2 /nobreak >nul

start "Frontend" cmd /k "npm run dev"

echo.
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo 🎉 StudyFlow AI Platform is starting up!
echo ==============================================
echo Frontend:     http://localhost:8080
echo API Gateway:  http://localhost:8000
echo Test Dashboard: http://localhost:8080/test
echo.
echo Individual Services:
echo Auth:         http://localhost:3000
echo Ingestion:    http://localhost:3002
echo NLP:          http://localhost:3003
echo Scheduler:    http://localhost:3004
echo Analytics:    http://localhost:3005
echo Notifications: http://localhost:3006
echo.
echo 📖 Check the README.md for detailed documentation
echo 🐛 If you encounter issues, see the Troubleshooting section
echo.
echo Happy studying! 📚✨

pause 