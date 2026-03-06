#!/bin/bash
echo "🧪 Running tests..."

# Backend tests
echo "🐍 Testing backend..."
source venv/bin/activate
cd productivity_dashboard/backend
python manage.py test
cd ../..

# Frontend tests
echo "⚛️ Testing frontend..."
cd productivity_dashboard/frontend
npm test
cd ../..

echo "✅ All tests completed!"
