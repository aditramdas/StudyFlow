# StudyFlow AI Platform
![StudyFLow 1](https://github.com/user-attachments/assets/920fd2bb-2854-4964-b4d8-300f7d8bd92a)

A comprehensive microservices-based AI-powered study platform that helps users manage, process, and learn from their documents through intelligent scheduling, analytics, and personalized recommendations.

## 🏗️ Architecture Overview

StudyFlow is built using a modern microservices architecture with 8 independent services:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway    │    │   Auth Service  │
│   (React)       │◄──►│   (Express)      │◄──►│   (Node.js)     │
│   Port: 8080    │    │   Port: 8000     │    │   Port: 3000    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼─────┐
        │ Ingestion    │ │ Analytics   │ │ Scheduler │
        │ Service      │ │ Service     │ │ Service   │
        │ Port: 3002   │ │ Port: 3005  │ │ Port: 3004│
        └──────────────┘ └─────────────┘ └───────────┘
                │               │               │
                └───────────────┼───────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────────────┐
        │ NLP Service  │ │ Notification Service│
        │ (Python)     │ │ (Node.js)           │
        │ Port: 3003   │ │ Port: 3006          │
        └──────────────┘ └─────────────────────┘
```

## 🚀 Features

### Core Functionality

- **Document Management**: Upload, store, and organize study materials
- **AI-Powered Summarization**: Automatic document summarization using NLP
- **Intelligent Scheduling**: Spaced repetition algorithm for optimal learning
- **Analytics Dashboard**: Comprehensive study progress tracking
- **Real-time Notifications**: Event-driven notification system
- **User Authentication**: Secure JWT-based authentication

### Technical Features

- **Microservices Architecture**: Scalable, maintainable service design
- **Event-Driven Communication**: RabbitMQ for asynchronous messaging
- **Multi-Database Support**: PostgreSQL, Redis, Neo4j integration
- **API Gateway**: Centralized routing and load balancing
- **Modern Frontend**: React with TypeScript and shadcn/ui components
- **Containerization**: Docker Compose for easy deployment

## 📋 Prerequisites

Before running the StudyFlow AI Platform, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**
- **Git**

### Optional (for full functionality):

- **Docker** and **Docker Compose** (for databases)
- **PostgreSQL** (v13 or higher)
- **Redis** (v6 or higher)
- **RabbitMQ** (v3.8 or higher)
- **Neo4j** (v4 or higher)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/aditramdas/StudyFlow.git
cd StudyFlow
```

### 2. Install Dependencies

#### Root Project (Frontend)

```bash
npm install
```

#### Gateway Service

```bash
cd gateway
npm install
cd ..
```

#### Backend Services

```bash
# Auth Service
cd backend/auth-service
npm install
cd ../..

# Ingestion Service
cd backend/ingestion-service
npm install
cd ../..

# Analytics Service
cd backend/analytics-service
npm install
cd ../..

# Scheduler Service
cd backend/scheduler-service
npm install
cd ../..

# Notification Service
cd backend/notification-service
npm install
cd ../..

# NLP Service (Python)
cd backend/nlp-service
pip install -r requirements.txt
cd ../..
```

### 3. Database Setup (Optional)

#### Using Docker Compose (Recommended)

```bash
docker-compose up -d
```

This will start:

- PostgreSQL on port 5432
- Redis on port 6379
- RabbitMQ on ports 5672/15672
- Neo4j on ports 7474/7687

#### Manual Setup

If you prefer manual database setup, configure the following:

- PostgreSQL: Create database `studyflow_db`
- Redis: Default configuration
- RabbitMQ: Default configuration with management plugin
- Neo4j: Default configuration

## 🚀 Running the Application

### Quick Start (All Services)

You can run all services simultaneously using the following commands in separate terminal windows:

#### Terminal 1: Frontend

```bash
npm run dev
```

#### Terminal 2: API Gateway

```bash
cd gateway
node index.js
```

#### Terminal 3: Auth Service

```bash
cd backend/auth-service
node index.js
```

#### Terminal 4: Ingestion Service

```bash
cd backend/ingestion-service
npm start
```

#### Terminal 5: NLP Service

```bash
cd backend/nlp-service
uvicorn server:app --host 0.0.0.0 --port 3003 --reload
```

#### Terminal 6: Scheduler Service

```bash
cd backend/scheduler-service
node src/index.js
```

#### Terminal 7: Analytics Service

```bash
cd backend/analytics-service
node src/index.js
```

#### Terminal 8: Notification Service

```bash
cd backend/notification-service
node src/index.js
```

### Service URLs

Once all services are running, you can access:

- **Frontend**: http://localhost:8080
- **API Gateway**: http://localhost:8000
- **Auth Service**: http://localhost:3000
- **Ingestion Service**: http://localhost:3002
- **NLP Service**: http://localhost:3003
- **Scheduler Service**: http://localhost:3004
- **Analytics Service**: http://localhost:3005
- **Notification Service**: http://localhost:3006

## 📖 API Documentation

### API Gateway Endpoints

The API Gateway (port 8000) provides unified access to all services:

#### Authentication

- `POST /auth/login` - User login
- `GET /auth/health` - Auth service health check

#### Document Management

- `POST /upload` - Upload documents
- `GET /upload/documents` - List user documents

#### Analytics

- `GET /analytics/dashboard/metrics` - Get dashboard metrics
- `POST /analytics/test/study-session` - Simulate study session
- `POST /analytics/test/quiz` - Simulate quiz completion

#### Scheduling

- `GET /schedule/schedule/today` - Get today's schedule
- `POST /schedule/test/seed` - Seed schedule data

#### Notifications

- `GET /notifications/notifications/:userId` - Get user notifications
- `POST /notifications/test/reminder` - Test reminder notification

### Service-Specific Endpoints

Each service also exposes its own endpoints directly:

#### Auth Service (Port 3000)

```
GET  /health          - Health check
POST /login           - User authentication
GET  /protected       - Protected route (requires JWT)
```

#### Ingestion Service (Port 3002)

```
GET  /health                    - Health check
POST /api/documents/upload      - Upload document
GET  /api/documents             - List documents
GET  /api/documents/:id         - Get document details
```

#### NLP Service (Port 3003)

```
GET  /health          - Health check
POST /nlp/summarize   - Summarize document
```

#### Scheduler Service (Port 3004)

```
GET  /health          - Health check
GET  /schedule/today  - Get today's schedule
POST /test/seed       - Seed test data
```

#### Analytics Service (Port 3005)

```
GET  /health                    - Health check
GET  /dashboard/metrics         - Get analytics metrics
POST /test/study-session        - Simulate study session
POST /test/quiz                 - Simulate quiz completion
```

#### Notification Service (Port 3006)

```
GET  /health                    - Health check
GET  /notifications/:userId     - Get user notifications
POST /test/reminder             - Test reminder
```

## 🎯 Usage Examples

### 1. User Authentication

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 2. Upload Document

```bash
curl -X POST http://localhost:8000/upload \
  -F "document=@your-document.pdf"
```

### 3. Get Analytics Dashboard

```bash
curl http://localhost:8000/analytics/dashboard/metrics
```

### 4. Get Today's Schedule

```bash
curl http://localhost:8000/schedule/schedule/today
```

## 🧪 Testing

### Health Checks

Verify all services are running:

```bash
# Gateway
curl http://localhost:8000/health

# Individual services
curl http://localhost:3000/health  # Auth
curl http://localhost:3002/health  # Ingestion
curl http://localhost:3003/health  # NLP
curl http://localhost:3004/health  # Scheduler
curl http://localhost:3005/health  # Analytics
curl http://localhost:3006/health  # Notification
```

### End-to-End Testing

The frontend includes a comprehensive test dashboard at:
http://localhost:8080/test

This dashboard allows you to:

- Check service health status
- Test API endpoints
- Upload documents
- View analytics data
- Test the complete workflow

### Manual Testing Workflow

1. **Start all services** (see Running the Application section)
2. **Open frontend**: http://localhost:8080
3. **Login**: Use test credentials (test@example.com / password123)
4. **Upload document**: Use the upload feature
5. **Check analytics**: View the dashboard metrics
6. **Verify schedule**: Check today's study schedule

## 🏗️ Development

### Project Structure

```
StudyFlow/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and API client
│   │   └── App.tsx         # Main application component
│   └── package.json
├── gateway/                 # API Gateway service
│   ├── index.js            # Gateway server
│   ├── simple-gateway.js   # Simplified gateway
│   └── package.json
├── backend/
│   ├── auth-service/       # Authentication service
│   ├── ingestion-service/  # Document upload service
│   ├── nlp-service/        # Python NLP service
│   ├── scheduler-service/  # Study scheduling service
│   ├── analytics-service/  # Analytics and metrics
│   └── notification-service/ # Notification system
├── shared/                 # Shared libraries
│   ├── db/                # Database utilities
│   └── messaging/         # RabbitMQ utilities
├── docker-compose.yml     # Database services
└── README.md
```

### Adding New Features

1. **Create new service**: Follow the existing service structure
2. **Update API Gateway**: Add proxy routes for new endpoints
3. **Update Frontend**: Add new API calls and UI components
4. **Add tests**: Include health checks and integration tests

### Environment Variables

Create `.env` files in each service directory:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/studyflow_db
REDIS_URL=redis://localhost:6379
NEO4J_URL=bolt://localhost:7687

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# Service URLs
AUTH_SERVICE_URL=http://localhost:3000
INGESTION_SERVICE_URL=http://localhost:3002
NLP_SERVICE_URL=http://localhost:3003
SCHEDULER_SERVICE_URL=http://localhost:3004
ANALYTICS_SERVICE_URL=http://localhost:3005
NOTIFICATIONS_SERVICE_URL=http://localhost:3006

# JWT
JWT_SECRET=your-secret-key
```

## 🐳 Docker Deployment

### Database Services

```bash
docker-compose up -d
```

### Full Application (Future Enhancement)

A complete Docker setup for all services is planned for future releases.

## 🔧 Troubleshooting

### Common Issues

#### Services Not Starting

1. **Check ports**: Ensure no other applications are using the required ports
2. **Install dependencies**: Run `npm install` in each service directory
3. **Database connections**: Verify database services are running

#### Database Connection Errors

1. **Start databases**: `docker-compose up -d`
2. **Check credentials**: Verify database connection strings
3. **Network issues**: Ensure Docker is running and accessible

#### Frontend Not Loading

1. **Check API Gateway**: Ensure gateway is running on port 8000
2. **CORS issues**: Verify CORS configuration in gateway
3. **Build issues**: Try `npm install` and restart dev server

#### Python Service Issues

1. **Install dependencies**: `pip install -r requirements.txt`
2. **Python version**: Ensure Python 3.8+ is installed
3. **Port conflicts**: Check if port 3003 is available

### Debug Mode

Enable debug logging by setting environment variables:

```bash
DEBUG=true
LOG_LEVEL=debug
```

### Service Dependencies

Services have graceful degradation:

- **Database unavailable**: Services continue with in-memory storage
- **RabbitMQ unavailable**: Services continue without messaging
- **Individual service down**: Other services remain functional

## 📊 Monitoring

### Health Endpoints

All services provide `/health` endpoints for monitoring:

- Returns 200 OK when service is healthy
- Includes service status and uptime information

### Logging

Services log to console with timestamps and request tracking.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests for new functionality
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by spaced repetition learning techniques
- Uses industry-standard microservices patterns

## 📞 Support

For support and questions:

- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

---

**StudyFlow AI Platform** - Revolutionizing the way you learn and study with AI-powered insights and intelligent scheduling.
