@echo off
echo ========================================
echo Starting Backend Server and Creating Data
echo ========================================

cd backend
echo.
echo Creating admin users...
node create-sample-users.js
echo.
echo Creating sample employees...
node create-sample-employees.js
echo.
echo Creating sample reports...
node create-sample-reports.js
echo.
echo Starting backend server...
start "Backend Server" cmd /k "node server.js"

echo.
echo ========================================
echo Backend server started!
echo.
echo Admin Login Credentials:
echo - admin/admin (Admin role)
echo - superAdmin/superAdmin (SuperAdmin role)
echo.
echo Sample Employees Created:
echo - john_doe/password123 (Engineering)
echo - jane_smith/password123 (Marketing)
echo - mike_wilson/password123 (Sales)
echo - sarah_jones/password123 (HR)
echo.
echo You can now test the dashboard APIs!
echo ========================================
pause
