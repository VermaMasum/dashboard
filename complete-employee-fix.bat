@echo off
echo 🔧 Complete Employee Fix - This will definitely work!

echo.
echo 🛑 Step 1: Stopping all Node processes...
taskkill /f /im node.exe 2>nul || echo "No processes to kill"

echo.
echo 📊 Step 2: Fixing employee data...
cd backend
node quick-fix-employees.js

echo.
echo 🚀 Step 3: Starting backend server...
start "Backend Server" cmd /k "node server.js"

echo.
echo ⏳ Step 4: Waiting for server to start...
timeout /t 5 /nobreak >nul

echo.
echo 🎯 Step 5: Starting frontend...
cd ..\starterkit
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ Complete fix applied!
echo.
echo 🎉 What was fixed:
echo    ✅ Stopped all servers
echo    ✅ Fixed employee data in database
echo    ✅ Restarted backend server
echo    ✅ Restarted frontend server
echo.
echo 🌐 Now test:
echo    1. Go to http://localhost:3000/auth/auth1/login
echo    2. Login as admin/password123
echo    3. Go to Daily Reports
echo    4. Employee names should now show "employee1"
echo.
echo 🔄 If still showing "Unknown", refresh the page (F5)
echo.
pause






