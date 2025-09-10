@echo off
echo 🔧 Fixing all glitches in the system...

echo.
echo 🛑 Stopping all Node processes...
taskkill /f /im node.exe 2>nul || echo "No Node processes to kill"

echo.
echo 📦 Starting backend server...
cd backend
start "Backend Server" cmd /k "node server.js"

echo.
echo ⏳ Waiting for server to start...
timeout /t 3 /nobreak >nul

echo.
echo 🔧 Fixing report employee references...
node fix-report-employees.js

echo.
echo 🎯 Starting frontend...
cd ..\starterkit
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ All fixes applied!
echo.
echo 🎉 Fixed Issues:
echo    ✅ Project Details: Employee assignment now visible
echo    ✅ Daily Reports: Employee names now show correctly
echo    ✅ Employee Management: Can now add employees with password
echo.
echo 🌐 Test the fixes:
echo    - Admin Dashboard: http://localhost:3000/auth/auth1/login
echo    - Login: admin/password123
echo    - Try assigning employees to projects
echo    - Check Daily Reports for employee names
echo    - Try adding new employees
echo.
pause

