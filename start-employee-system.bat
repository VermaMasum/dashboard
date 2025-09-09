@echo off
echo ========================================
echo STARTING EMPLOYEE SYSTEM
echo ========================================

echo.
echo Step 1: Installing dependencies...
cd backend
npm install axios

echo.
echo Step 2: Creating admin users...
node create-sample-users.js

echo.
echo Step 3: Creating employee users...
node create-employee-users.js

echo.
echo Step 4: Creating test projects...
node create-test-data.js

echo.
echo Step 5: Starting backend server...
start "Backend Server" cmd /k "node server.js"

echo.
echo Step 6: Starting frontend...
cd ..
cd starterkit
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo EMPLOYEE SYSTEM READY!
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo ADMIN DASHBOARD:
echo - Login: http://localhost:3000/auth/auth1/login
echo - Credentials: admin/admin or superAdmin/superAdmin
echo.
echo EMPLOYEE DASHBOARD:
echo - Login: http://localhost:3000/auth/employee-login
echo - Credentials: john_doe/password123, jane_smith/password123, etc.
echo.
echo ========================================
pause
