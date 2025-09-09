@echo off
echo ========================================
echo Testing Employee API Integration
echo ========================================

echo.
echo Step 1: Starting backend server...
cd backend
start "Backend Server" cmd /k "node server.js"

echo.
echo Waiting for server to start...
timeout /t 5 /nobreak > nul

echo.
echo Step 2: Creating sample data...
node create-sample-users.js
node create-sample-employees.js

echo.
echo Step 3: Testing employee API...
node test-employee-api.js

echo.
echo Step 4: Starting frontend...
cd ..
cd starterkit
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo Integration test complete!
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Test the employee API by:
echo 1. Login with admin/admin
echo 2. Go to Employee Management
echo 3. Check browser console for API calls
echo ========================================
pause
