@echo off
echo 🚀 Setting up Employee Dashboard...

echo.
echo 📦 Installing dependencies...
cd backend
npm install

echo.
echo 🔧 Starting backend server...
start "Backend Server" cmd /k "node server.js"

echo.
echo ⏳ Waiting for server to start...
timeout /t 5 /nobreak >nul

echo.
echo 📊 Creating sample data...
node create-sample-reports-for-employee.js

echo.
echo 🎯 Starting frontend...
cd ..\starterkit
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ Setup complete!
echo.
echo 🌐 Access the application:
echo    - Admin Dashboard: http://localhost:3000/auth/auth1/login
echo    - Employee Dashboard: http://localhost:3000/auth/auth1/login
echo.
echo 👤 Test credentials:
echo    - Admin: admin/password123
echo    - Employee: employee1/password123
echo.
pause

