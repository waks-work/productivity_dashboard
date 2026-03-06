#!/bin/bash
echo "🔧 Starting Productivity Dashboard development..."

# Activate virtual environment
source venv/bin/activate

# Start backend in background
echo "🐍 Starting Django backend..."
cd productivity_dashboard/backend
python manage.py runserver &
BACKEND_PID=$!
cd ../..

# Start frontend in background
echo "⚛️ Starting React frontend..."
cd productivity_dashboard/frontend
npm run dev &
FRONTEND_PID=$!
cd ../..

echo ""
echo "🎉 Development servers started!"
echo "🐍 Backend: http://localhost:8000"
echo "⚛️ Frontend: http://localhost:5173"
echo "📊 Admin: http://localhost:8000/admin"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
