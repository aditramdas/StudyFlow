#!/bin/bash

# StudyFlow AI Platform - Service Startup Script
# This script starts all microservices for the StudyFlow platform

echo "🚀 Starting StudyFlow AI Platform Services..."
echo "=============================================="

# Function to check if a port is available
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $1 is already in use"
        return 1
    else
        echo "✅ Port $1 is available"
        return 0
    fi
}

# Check all required ports
echo "🔍 Checking port availability..."
ports=(3000 3002 3003 3004 3005 3006 8000 8080)
for port in "${ports[@]}"; do
    if ! check_port $port; then
        echo "Please stop the service using port $port and try again"
        exit 1
    fi
done

echo ""
echo "📦 Installing dependencies..."

# Install root dependencies (frontend)
echo "Installing frontend dependencies..."
npm install

# Install gateway dependencies
echo "Installing gateway dependencies..."
cd gateway && npm install && cd ..

# Install backend service dependencies
echo "Installing backend service dependencies..."
cd backend/auth-service && npm install && cd ../..
cd backend/ingestion-service && npm install && cd ../..
cd backend/analytics-service && npm install && cd ../..
cd backend/scheduler-service && npm install && cd ../..
cd backend/notification-service && npm install && cd ../..

# Install Python dependencies for NLP service
echo "Installing NLP service dependencies..."
cd backend/nlp-service && pip install -r requirements.txt && cd ../..

echo ""
echo "🗄️ Starting database services (optional)..."
echo "If you have Docker installed, starting database services..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d
    echo "✅ Database services started"
else
    echo "⚠️ Docker Compose not found. Skipping database startup."
    echo "Services will run with in-memory storage."
fi

echo ""
echo "🎯 Starting all services..."
echo "This will open multiple terminal windows/tabs"

# Function to start service in new terminal (macOS)
start_service_mac() {
    osascript -e "tell application \"Terminal\" to do script \"cd $(pwd) && $1\""
}

# Function to start service in new terminal (Linux with gnome-terminal)
start_service_linux() {
    gnome-terminal -- bash -c "cd $(pwd) && $1; exec bash"
}

# Function to start service in new terminal (Windows with Git Bash)
start_service_windows() {
    start bash -c "cd $(pwd) && $1"
}

# Detect OS and start services accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "Starting services on macOS..."
    start_service_mac "cd gateway && node index.js"
    sleep 2
    start_service_mac "cd backend/auth-service && node index.js"
    sleep 2
    start_service_mac "cd backend/ingestion-service && npm start"
    sleep 2
    start_service_mac "cd backend/nlp-service && uvicorn server:app --host 0.0.0.0 --port 3003 --reload"
    sleep 2
    start_service_mac "cd backend/scheduler-service && node src/index.js"
    sleep 2
    start_service_mac "cd backend/analytics-service && node src/index.js"
    sleep 2
    start_service_mac "cd backend/notification-service && node src/index.js"
    sleep 2
    start_service_mac "npm run dev"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    echo "Starting services on Linux..."
    start_service_linux "cd gateway && node index.js"
    sleep 2
    start_service_linux "cd backend/auth-service && node index.js"
    sleep 2
    start_service_linux "cd backend/ingestion-service && npm start"
    sleep 2
    start_service_linux "cd backend/nlp-service && uvicorn server:app --host 0.0.0.0 --port 3003 --reload"
    sleep 2
    start_service_linux "cd backend/scheduler-service && node src/index.js"
    sleep 2
    start_service_linux "cd backend/analytics-service && node src/index.js"
    sleep 2
    start_service_linux "cd backend/notification-service && node src/index.js"
    sleep 2
    start_service_linux "npm run dev"
else
    # Windows or other
    echo "⚠️ Automatic terminal opening not supported on this OS"
    echo "Please manually run the following commands in separate terminals:"
    echo ""
    echo "Terminal 1: cd gateway && node index.js"
    echo "Terminal 2: cd backend/auth-service && node index.js"
    echo "Terminal 3: cd backend/ingestion-service && npm start"
    echo "Terminal 4: cd backend/nlp-service && uvicorn server:app --host 0.0.0.0 --port 3003 --reload"
    echo "Terminal 5: cd backend/scheduler-service && node src/index.js"
    echo "Terminal 6: cd backend/analytics-service && node src/index.js"
    echo "Terminal 7: cd backend/notification-service && node src/index.js"
    echo "Terminal 8: npm run dev"
fi

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

echo ""
echo "🎉 StudyFlow AI Platform is starting up!"
echo "=============================================="
echo "Frontend:     http://localhost:8080"
echo "API Gateway:  http://localhost:8000"
echo "Test Dashboard: http://localhost:8080/test"
echo ""
echo "Individual Services:"
echo "Auth:         http://localhost:3000"
echo "Ingestion:    http://localhost:3002"
echo "NLP:          http://localhost:3003"
echo "Scheduler:    http://localhost:3004"
echo "Analytics:    http://localhost:3005"
echo "Notifications: http://localhost:3006"
echo ""
echo "📖 Check the README.md for detailed documentation"
echo "🐛 If you encounter issues, see the Troubleshooting section"
echo ""
echo "Happy studying! 📚✨" 