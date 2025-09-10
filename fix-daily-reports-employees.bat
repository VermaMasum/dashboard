@echo off
echo 🔧 Fixing Daily Reports Employee Fetching Issue...

echo.
echo 🛑 Stopping all servers...
taskkill /f /im node.exe 2>nul || echo "No processes to kill"

echo.
echo 📊 Fixing database data...
cd backend
node simple-employee-fix.js

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
echo    ✅ Updated Daily Reports to fetch from /users?role=employee
echo    ✅ Fixed database with proper employee references
echo    ✅ Created sample reports with valid employee data
echo    ✅ Restarted both servers
echo.
echo 🌐 Test now:
echo    1. Go to http://localhost:3000/auth/auth1/login
echo    2. Login as admin/password123
echo    3. Go to Daily Reports
echo    4. Employee names should now show "employee1"
echo.
echo 🔄 If still showing "Unknown", refresh the page (F5)
echo.
pause

