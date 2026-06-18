#!/bin/bash

# Eco-Track Development Server Script
# Starts both the React client and Django server in parallel

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Eco-Track development servers...${NC}"

# Start Django server in the background
echo -e "${GREEN}Starting Django server...${NC}"
cd server-eco-track
venv/bin/python manage.py runserver &
DJANGO_PID=$!

# Start React development server in the background
echo -e "${GREEN}Starting React development server...${NC}"
cd ../client-eco-track
npm run dev &
REACT_PID=$!

# Function to handle cleanup on exit
cleanup() {
    echo -e "${BLUE}Shutting down servers...${NC}"
    kill $DJANGO_PID 2>/dev/null || true
    kill $REACT_PID 2>/dev/null || true
    wait $DJANGO_PID $REACT_PID 2>/dev/null || true
    echo -e "${BLUE}Servers stopped.${NC}"
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

echo -e "${GREEN}Both servers are running!${NC}"
echo -e "${BLUE}Django: http://localhost:8000${NC}"
echo -e "${BLUE}React: http://localhost:5173${NC}"
echo -e "${BLUE}Press Ctrl+C to stop both servers${NC}"

# Wait for both processes
wait
