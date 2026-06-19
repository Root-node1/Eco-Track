@echo off
REM Eco-Track Development Server Script
REM Starts both the React client and Django server in parallel

echo Starting Eco-Track development servers...

REM Start Django server in the background
echo Starting Django server...
cd server-eco-track
start cmd /k python manage.py runserver

REM Start React development server in the background
echo Starting React development server...
cd ..\client-eco-track
start cmd /k npm run dev

cd ..

echo.
echo Both servers are running!
echo Django: http://localhost:8000
echo React: http://localhost:5173
echo Close the command windows to stop the servers.
