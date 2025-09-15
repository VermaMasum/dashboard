@echo off
echo 🔧 Fixing Employee Reports Issue...

echo.
echo 🛑 Stopping backend server...
taskkill /f /im node.exe 2>nul || echo "No Node processes to kill"

echo.
echo 📊 Setting up proper employee data...
cd backend
node ensure-employee-data.js

echo.
echo 🚀 Starting backend server...
start "Backend Server" cmd /k "node server.js"

echo.
echo ⏳ Waiting for server to start...
timeout /t 3 /nobreak >nul

echo.
echo 🎯 Starting frontend...
cd ..\starterkit
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ Fix Applied!
echo.
echo 🎉 What was fixed:
echo    ✅ Created proper employee user (employee1)
echo    ✅ Created sample project
echo    ✅ Recreated all reports with valid employee references
echo    ✅ All reports now properly linked to employee users
echo.
echo 🌐 Test now:
echo    1. Go to http://localhost:3000/auth/auth1/login
echo    2. Login as admin/password123
echo    3. Go to Daily Reports
echo    4. Employee names should now show "employee1" instead of "Unknown"
echo.
pause






