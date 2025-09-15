@echo off
echo ========================================
echo TESTING BOTH ADMIN AND EMPLOYEE DASHBOARDS
echo ========================================

echo.
echo Step 1: Installing dependencies...
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
echo Step 4: Starting frontend...
cd ..
cd starterkit
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo ADMIN DASHBOARD:
echo - Login: http://localhost:3000/auth/auth1/login
echo - Credentials: admin/admin or superAdmin/superAdmin
echo - Features: Project Details, Daily Reports, Employee Management
echo.
echo EMPLOYEE DASHBOARD:
echo - Login: http://localhost:3000/auth/employee-login
echo - Credentials: john_doe/password123 or jane_smith/password123
echo - Features: Submit Reports, View Past Reports, Stats
echo.
echo ========================================
pause







