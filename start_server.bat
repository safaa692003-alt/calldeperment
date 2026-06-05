@echo off
echo ========================================================
echo   Muthanna Internal Mailbox - Production Server
echo ========================================================
echo.

IF NOT EXIST "node_modules\" (
    echo [System] First time setup detected. Installing dependencies...
    call npm install
    echo.
    echo [System] Building the system files...
    call npm run build
    echo.
)

set NODE_ENV=production
set PORT=3000

echo Starting Server on Port %PORT%...
echo To access from other devices, open a browser and type:
echo http://[IP_ADDRESS]:%PORT%
echo (Replace [IP_ADDRESS] with this computer's IP address)
echo.

node dist/server.cjs

pause
