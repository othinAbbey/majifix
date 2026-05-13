@echo off
REM MajiFix Development Environment Setup Script for Windows

setlocal enabledelayedexpansion
cls

echo.
echo 🚀 MajiFix MVP Setup Script - Windows
echo ====================================
echo.

REM Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v18+
    pause
    exit /b 1
)

REM Check for PostgreSQL
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL is not installed. Please install PostgreSQL 12+
    pause
    exit /b 1
)

echo 📋 Checking prerequisites...
echo ✅ Node.js installed
echo ✅ PostgreSQL installed
echo.

REM Create database
echo 🗄️  Setting up database...
echo Please ensure PostgreSQL is running. You may need to provide credentials.

REM Try to create database
createdb -U postgres majifix 2>nul
if %errorlevel% equ 0 (
    echo ✅ Database 'majifix' created
) else (
    echo ⚠️  Database 'majifix' may already exist
)
echo.

REM Load schema
echo 📝 Loading database schema...
psql -U postgres -d majifix -f backend\database.sql
if %errorlevel% equ 0 (
    echo ✅ Schema loaded
) else (
    echo ❌ Failed to load schema
    pause
    exit /b 1
)
echo.

REM Ask about test data
set /p load_seeds="Load test data (y/n)? "
if /i "%load_seeds%"=="y" (
    psql -U postgres -d majifix -f backend\seeds.sql
    if %errorlevel% equ 0 (
        echo ✅ Test data loaded
    ) else (
        echo ❌ Failed to load test data
    )
)
echo.

REM Backend setup
echo ⚙️  Setting up backend...
cd backend
if exist .env (
    echo ⚠️  .env already exists
) else (
    copy .env.example .env
    echo ✅ Created .env from .env.example
)
echo 📄 Installing backend dependencies...
call npm install
if %errorlevel% equ 0 (
    echo ✅ Backend dependencies installed
) else (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..
echo.

REM Frontend setup
echo ⚙️  Setting up frontend...
cd majifix-frontend\majifix-frontend
echo 📄 Installing frontend dependencies...
call npm install
if %errorlevel% equ 0 (
    echo ✅ Frontend dependencies installed
) else (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..\..
echo.

REM Create frontend .env
if exist majifix-frontend\majifix-frontend\.env (
    echo ✅ Frontend .env already exists
) else (
    (
        echo REACT_APP_API_URL=http://localhost:5000/api
    ) > majifix-frontend\majifix-frontend\.env
    echo ✅ Created frontend .env
)
echo.

echo 🎉 Setup Complete!
echo.
echo 📚 Documentation:
echo    - Development Guide: .\DEVELOPMENT.md
echo    - API Reference: .\API.md
echo    - Project Checklist: .\PROJECT_CHECKLIST.md
echo.
echo 🚀 Next Steps:
echo    1. Edit backend\.env with your database credentials
echo    2. Start backend:  cd backend ^&^& npm run dev
echo    3. Start frontend: cd majifix-frontend\majifix-frontend ^&^& npm start
echo    4. Open http://localhost:3000 in your browser
echo.
echo 🔐 Test credentials (if using seeds):
echo    Username: admin
echo    Password: password123
echo.
pause