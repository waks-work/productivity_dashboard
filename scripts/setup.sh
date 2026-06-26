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

echo "🧩 Setting up Productivity Dashboard..."

# Check if we're in the right directory
if [ ! -d "productivity_dashboard" ]; then
    echo "❌ Error: This doesn't look like the productivity_dashboard directory"
    exit 1
fi

# Setup Python virtual environment
echo "🐍 Setting up Python virtual environment..."
if [ ! -d "venv" ]; then
    $PYTHON -m venv venv
fi

source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Install frontend dependencies
echo "⚛️ Installing frontend dependencies..."
cd productivity_dashboard/frontend
npm install
cd ../..

echo "Servers are up start developement with ./script/dev.sh"
