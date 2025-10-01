@echo off
echo ============================================
echo Mobile Access Setup for Time Tracker
echo ============================================
echo.

REM Get the local IP address
echo Finding your PC's IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP_ADDR=%%a
    goto :found
)

:found
REM Trim spaces
for /f "tokens=* delims= " %%a in ("%IP_ADDR%") do set IP_ADDR=%%a

echo.
echo ============================================
echo Your PC's IP Address: %IP_ADDR%
echo ============================================
echo.

REM Create .env.local file for frontend
echo Creating frontend configuration...
cd starterkit
(
echo # API Configuration for Mobile Access
echo # Generated automatically - you can edit this file
echo NEXT_PUBLIC_API_URL=http://%IP_ADDR%:5000/api
) > .env.local

echo ✓ Frontend configured: starterkit\.env.local
echo.

REM Create .env file for backend
echo Creating backend configuration...
cd ..\backend
(
echo # Backend Configuration for Mobile Access
echo # Generated automatically - you can edit this file
echo MONGODB_URI=mongodb://localhost:27017/timetracker
echo PORT=5000
echo JWT_SECRET=your-secret-key-change-in-production
echo ALLOWED_ORIGINS=http://localhost:3000,http://%IP_ADDR%:3000
) > .env

echo ✓ Backend configured: backend\.env
echo.

cd ..

echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo Next Steps:
echo.
echo 1. Start the backend server:
echo    cd backend
echo    node server.js
echo.
echo 2. Start the frontend (in a new terminal):
echo    cd starterkit
echo    npm run dev -- -H 0.0.0.0
echo.
echo 3. Access from your mobile device:
echo    http://%IP_ADDR%:3000
echo.
echo ============================================
echo Important Notes:
echo ============================================
echo.
echo - Make sure your mobile device is on the SAME WiFi
echo - If login fails, restart BOTH servers
echo - Your IP might change if you reconnect to WiFi
echo - Check Windows Firewall if connection fails
echo.
echo Press any key to exit...
pause > nul

