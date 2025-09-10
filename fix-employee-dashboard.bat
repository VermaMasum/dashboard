@echo off
echo 🔧 Fixing Employee Dashboard - Show Only Assigned Projects & Reports...

echo.
echo 🛑 Stopping all servers...
taskkill /f /im node.exe 2>nul || echo "No processes to kill"

echo.
echo 📊 Setting up employee8 with assigned projects...
cd backend
node setup-employee8-projects.js

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
echo    ✅ Employee dashboard now only shows projects assigned to logged-in employee
echo    ✅ Employee dashboard only shows reports belonging to logged-in employee
echo    ✅ Employee8 is assigned to Dashboard and AI summarizer projects
echo    ✅ Created sample reports for employee8
echo    ✅ Dashboard refetches data when user changes
echo.
echo 🌐 Test the fix:
echo    1. Go to http://localhost:3000/auth/auth1/login
echo    2. Login as employee8/password123
echo    3. Should redirect to employee dashboard
echo    4. Should only see projects assigned to employee8
echo    5. Should only see reports created by employee8
echo.
echo 🔄 If still showing all data, refresh the page (F5)
echo.
pause

