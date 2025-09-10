@echo off
echo ========================================
echo FIXING EMPLOYEE LOGIN SYSTEM
echo ========================================

echo.
echo Step 1: Installing dependencies...
cd backend
npm install axios bcryptjs

echo.
echo Step 2: Setting up employee system...
node setup-employee-system.js

echo.
echo Step 3: Starting backend server...
start "Backend Server" cmd /k "node server.js"

echo.
echo Step 4: Starting frontend...
cd ..
cd starterkit
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo EMPLOYEE LOGIN FIXED!
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo EMPLOYEE LOGIN:
echo - URL: http://localhost:3000/auth/employee-login
echo - All employees use password: password123
echo.
echo WORKING CREDENTIALS:
echo - employee1/password123
echo - employee2/password123
echo - employee3/password123
echo - Employee4/password123
echo - Employee5/password123
echo - john_doe/password123
echo - jane_smith/password123
echo.
echo ========================================
pause


