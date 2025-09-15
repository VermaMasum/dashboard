@echo off
echo ========================================
echo EMPLOYEE PASSWORD MANAGER
echo ========================================

echo.
echo Choose an option:
echo 1. Check current employee passwords
echo 2. Reset all passwords to password123
echo 3. Exit
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo Checking current employee passwords...
    cd backend
    node employee-password-manager.js
    pause
) else if "%choice%"=="2" (
    echo.
    echo Resetting all passwords to password123...
    cd backend
    node reset-employee-passwords.js
    echo.
    echo Passwords reset! Now you can test with:
    echo - employee1/password123
    echo - employee2/password123
    echo - employee3/password123
    echo - Employee4/password123
    echo - Employee5/password123
    pause
) else if "%choice%"=="3" (
    echo Goodbye!
    exit
) else (
    echo Invalid choice. Please run the script again.
    pause
)







