@echo off
echo ========================================
echo TESTING UNIFIED LOGIN
echo ========================================

echo.
echo Step 1: Testing login credentials...
cd backend
node test-unified-login.js

echo.
echo Step 2: Starting backend server...
start "Backend Server" cmd /k "node server.js"

echo.
echo Step 3: Starting frontend...
cd ..
cd starterkit
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo UNIFIED LOGIN READY!
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo UNIFIED LOGIN PAGE:
echo - URL: http://localhost:3000/auth/auth1/login
echo - Accepts ALL user types (Admin, SuperAdmin, Employee)
echo.
echo TEST CREDENTIALS:
echo - admin/admin → Admin Dashboard
echo - superAdmin/superAdmin → Admin Dashboard  
echo - employee1/password123 → Employee Dashboard
echo - employee2/password123 → Employee Dashboard
echo - Employee4/password123 → Employee Dashboard
echo.
echo ========================================
pause







