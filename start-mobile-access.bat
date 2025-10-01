@echo off
echo ============================================
echo Starting Time Tracker for Mobile Access
echo ============================================
echo.

REM Get the local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP_ADDR=%%a
    goto :found
)

:found
REM Trim spaces
for /f "tokens=* delims= " %%a in ("%IP_ADDR%") do set IP_ADDR=%%a

echo Your PC's IP Address: %IP_ADDR%
echo.
echo Access the application from your mobile at:
echo http://%IP_ADDR%:3000
echo.
echo ============================================
echo.

REM Start backend server
echo Starting backend server...
start "Backend Server" cmd /k "cd backend && echo Backend running on http://%IP_ADDR%:5000 && node server.js"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend server with network access
echo Starting frontend server...
start "Frontend Server" cmd /k "cd starterkit && echo Frontend running on http://%IP_ADDR%:3000 && npm run dev -- -H 0.0.0.0"

echo.
echo ============================================
echo Both servers are starting!
echo ============================================
echo.
echo Two new windows will open:
echo   1. Backend Server (Node.js)
echo   2. Frontend Server (Next.js)
echo.
echo Access URLs:
echo   - From PC: http://localhost:3000
echo   - From Mobile: http://%IP_ADDR%:3000
echo.
echo Make sure your mobile device is on the same WiFi!
echo.
echo Press any key to close this window...
pause > nul

