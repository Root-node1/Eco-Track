@echo off
REM Initialize Django project if it doesn't exist
if not exist "server-eco-track\manage.py" (
    echo Initializing Django project...
    cd server-eco-track
    django-admin startproject config .
    cd ..
)

REM Install dependencies
echo Installing dependencies...
call npm run install-all

REM Create .env if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo ⚠️  Update .env with your configuration!
)

echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Update .env with your settings
echo 2. Run: npm run dev
echo 3. Frontend: http://localhost:5173
echo 4. Backend: http://localhost:8000
