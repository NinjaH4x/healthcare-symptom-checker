#!/bin/bash

# Healthcare AI Chatbot - Quick Start Script
# This script sets up and runs the chatbot application

echo "🏥 HealthCare AI Assistant - Quick Start"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "📥 Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo "✅ npm found: $(npm --version)"
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Show project info
echo "📊 Project Information:"
echo "   Name: HealthCare AI Assistant"
echo "   Type: Next.js Web Application"
echo "   URL: http://localhost:3000"
echo ""

# Start development server
echo "🚀 Starting development server..."
echo "   Press Ctrl+C to stop the server"
echo ""

npm run dev
