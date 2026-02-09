@echo off
echo Starting development servers...
echo.

echo Starting back-end server...
start "Back-End" cmd /k "cd /d %~dp0back-end && npm run dev"

echo Starting front-end server...
start "Front-End" cmd /k "cd /d %~dp0front-end && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo Back-End will run on its default port
echo Front-End will run on its default port
echo.
pause
