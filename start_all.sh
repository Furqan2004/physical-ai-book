#!/bin/bash

# Kill existing processes on port 8000 and 3000
fuser -k 8000/tcp 3000/tcp 2>/dev/null

echo "🚀 Starting FastAPI Backend and Docusaurus Frontend..."

# Start FastAPI Backend (Port 8000)
echo "📂 Starting FastAPI Backend on port 8000..."
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start Docusaurus Frontend (Port 3000)
echo "💻 Starting Docusaurus Frontend on port 3000..."
cd ../frontend
npm run start &
FRONTEND_PID=$!

echo "✅ All servers starting!"
echo "   - Frontend: http://localhost:3000/physical-ai-book/"
echo "   - Backend API: http://localhost:8000"

# Function to stop all servers
cleanup() {
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID
    exit
}

trap cleanup SIGINT SIGTERM

# Wait for all processes
wait
