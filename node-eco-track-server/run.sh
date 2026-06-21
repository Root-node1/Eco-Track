#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting Eco-Track Development Servers...${NC}"
echo ""

# Get the parent directory (where server-eco-track and client-eco-track live)
PARENT_DIR="$(cd .. && pwd)"

echo -e "${GREEN}📂 Project root: ${PARENT_DIR}${NC}"

# Function to cleanup
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down all servers...${NC}"
    pkill -f "node src/server.js" 2>/dev/null || true
    pkill -f "python manage.py runserver" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    echo -e "${GREEN}✅ All servers stopped.${NC}"
    exit 0
}

trap cleanup EXIT INT TERM

# Start Node Backend (current folder)
echo -e "${GREEN}📡 Starting Node Backend (port 5000)...${NC}"
npm start &
NODE_PID=$!

sleep 3

# Start Django Backend
echo -e "${GREEN}🐍 Starting Django Backend (port 8000)...${NC}"
cd "$PARENT_DIR/server-eco-track"
python manage.py runserver &
DJANGO_PID=$!

sleep 3

# Start React Frontend
echo -e "${GREEN}⚛️  Starting React Frontend (port 5173)...${NC}"
cd "$PARENT_DIR/client-eco-track"
npm run dev &
REACT_PID=$!

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All servers are running!${NC}"
echo ""
echo -e "${YELLOW}📡 Frontend:${NC}  http://localhost:5173"
echo -e "${YELLOW}🐍 Django API:${NC}  http://localhost:8000/api"
echo -e "${YELLOW}📡 Node API:${NC}   http://localhost:5000/api"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"

wait
