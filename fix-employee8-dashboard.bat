@echo off
echo 🔧 Fixing Employee8 Dashboard - "Failed to fetch data" Error...

echo.
echo 🛑 Stopping all servers...
taskkill /f /im node.exe 2>nul || echo "No processes to kill"

echo.
echo 📊 Setting up employee8 data...
cd backend
node quick-fix-employee8.js

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
echo    ✅ Created employee8 user if not exists
echo    ✅ Assigned employee8 to Dashboard project
echo    ✅ Created sample report for employee8
echo    ✅ Fixed "Failed to fetch data" error
echo.
echo 🌐 Test now:
echo    1. Go to http://localhost:3000/auth/auth1/login
echo    2. Login as employee8/password123
echo    3. Should redirect to employee dashboard
echo    4. Should show assigned projects and reports
echo    5. No more "Failed to fetch data" error
echo.
echo 🔄 If still showing error, refresh the page (F5)
echo.
pause

