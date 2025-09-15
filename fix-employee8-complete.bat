@echo off
echo 🔧 Complete Fix for Employee8 Dashboard...

echo.
echo 🛑 Stopping all servers...
taskkill /f /im node.exe 2>nul || echo "No processes to kill"

echo.
echo 📊 Running complete employee8 fix...
cd backend
node complete-employee8-fix.js

echo.
echo 🚀 Starting backend server...
start "Backend Server" cmd /k "node server.js"

echo.
echo ⏳ Waiting for server to start...
timeout /t 5 /nobreak >nul

echo.
echo 🎯 Starting frontend...
cd ..\starterkit
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ Complete fix applied!
echo.
echo 🎉 What was fixed:
echo    ✅ Created employee8 user with proper credentials
echo    ✅ Assigned employee8 to 3 projects (Dashboard, AI summarizer, Reel-eats)
echo    ✅ Created 3 sample reports for employee8
echo    ✅ Fixed all database references
echo    ✅ Restarted both servers
echo.
echo 🌐 Test now:
echo    1. Go to http://localhost:3000/auth/auth1/login
echo    2. Login as employee8/password123
echo    3. Should redirect to employee dashboard
echo    4. Should show assigned projects and reports
echo    5. No more "Failed to fetch data" error
echo.
echo 🔄 If still showing error, wait 10 seconds and refresh (F5)
echo.
pause






