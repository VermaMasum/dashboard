@echo off
echo 🔧 Fixing Daily Reports Logic - Only Show Assigned Employees...

echo.
echo 🛑 Stopping all servers...
taskkill /f /im node.exe 2>nul || echo "No processes to kill"

echo.
echo 📊 Setting up projects with assigned employees...
cd backend
node setup-projects-with-employees.js

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
echo    ✅ Daily Reports now only shows employees assigned to selected project
echo    ✅ Created projects with properly assigned employees
echo    ✅ Employee dropdown clears when project changes
echo    ✅ Shows helpful message when no employees assigned
echo    ✅ Created sample reports with valid data
echo.
echo 🌐 Test the fix:
echo    1. Go to http://localhost:3000/auth/auth1/login
echo    2. Login as admin/password123
echo    3. Go to Project Details - assign employees to projects
echo    4. Go to Daily Reports - try creating a report
echo    5. Select a project - only assigned employees will show
echo.
echo 🔄 If still showing all employees, refresh the page (F5)
echo.
pause

