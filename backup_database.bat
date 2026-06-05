@echo off
echo ========================================================
echo   Muthanna Internal Mailbox - Database Backup
echo ========================================================
echo.

if not exist "backups" mkdir "backups"

for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set mytime=%mytime: =%

set backupfile=backups\data_store_backup_%mydate%_%mytime%.json

if exist "data_store.json" (
    copy "data_store.json" "%backupfile%"
    echo Backup created successfully at: %backupfile%
) else (
    echo Error: data_store.json not found!
)

echo.
pause
