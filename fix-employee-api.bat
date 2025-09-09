@echo off
echo ========================================
echo FIXING EMPLOYEE API ISSUES
echo ========================================

echo.
echo Step 1: Installing missing dependencies...
cd backend
npm install axios

echo.
echo Step 2: Creating sample data...
node create-sample-users.js
node create-sample-employees.js

echo.
echo Step 3: Starting backend server...
start "Backend Server" cmd /k "node server.js"

echo.
echo Step 4: Waiting for server to start...
timeout /t 3 /nobreak > nul

echo.
echo Step 5: Testing employee API...
node simple-diagnose.js

echo.
echo Step 6: Starting frontend...
cd ..
cd starterkit
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo EMPLOYEE API FIX COMPLETE!
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Test Steps:
echo 1. Login with admin/admin
echo 2. Go to Employee Management - should show employees
echo 3. Go to Project Details - should allow employee assignment
echo ========================================
pause
