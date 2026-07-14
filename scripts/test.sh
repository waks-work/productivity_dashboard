#!/bin/bash

find_python() {
    if command -v python >/dev/null 2>&1; then
        echo python
    elif command -v python3 >/dev/null 2>&1; then
        echo python3
    else
        echo "❌ Python not found."
        exit 1
    fi
}

PYTHON=$(find_python)

echo "🧪 Running tests..."

# Backend tests
echo "🐍 Testing backend..."
source venv/bin/activate
cd productivity_dashboard/backend
#python manage.py test -> archlinux
$PYTHON manage.py test
cd ../..

# Frontend tests
echo "⚛️ Testing frontend..."
cd productivity_dashboard/frontend
npm test
cd ../..

echo "✅ All tests completed!"
