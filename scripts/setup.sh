#!/bin/bash
echo "🧩 Setting up Productivity Dashboard..."

# Check if we're in the right directory
if [ ! -d "productivity_dashboard" ]; then
    echo "❌ Error: This doesn't look like the productivity_dashboard directory"
    exit 1
fi

# Setup Python virtual environment
echo "🐍 Setting up Python virtual environment..."
if [ ! -d "venv" ]; then
    python -m venv venv
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

echo "✅ Productivity Dashboard setup complete!"
echo "💡 Start development with: ./scripts/dev.sh"
