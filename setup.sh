#!/bin/bash

# Initialize Django project if it doesn't exist
if [ ! -f "server-eco-track/manage.py" ]; then
    echo "Initializing Django project..."
    cd server-eco-track
    django-admin startproject config .
    cd ..
fi

# Install dependencies
echo "Installing dependencies..."
npm run install-all

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  Update .env with your configuration!"
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your settings"
echo "2. Run: npm run dev"
echo "3. Frontend: http://localhost:5173"
echo "4. Backend: http://localhost:8000"
