const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.ANALYTICS_PORT || 3005;

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// In-memory storage for analytics data
let analyticsData = {
  studySessions: [],
  quizResults: [],
  totalStudyTime: 0,
  totalQuizzes: 0,
  averageScore: 0,
  documentsProcessed: 0,
  lastUpdated: new Date().toISOString()
};

// RabbitMQ connection (optional)
let mqConnection = null;
let mqChannel = null;

// Initialize RabbitMQ connection (optional)
async function initRabbitMQ() {
  try {
    const amqp = require('amqplib');
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672/';
    mqConnection = await amqp.connect(rabbitmqUrl);
    mqChannel = await mqConnection.createChannel();
    
    // Declare queues for consuming events
    await mqChannel.assertQueue('study.session', { durable: true });
    await mqChannel.assertQueue('quiz.completed', { durable: true });
    
    console.log('Connected to RabbitMQ');
    
    // Start consuming events
    mqChannel.consume('study.session', handleStudySession, { noAck: false });
    mqChannel.consume('quiz.completed', handleQuizCompleted, { noAck: false });
    console.log('Started consuming study and quiz events');
    
  } catch (error) {
    console.error('Failed to connect to RabbitMQ, continuing without messaging:', error.message);
    mqConnection = null;
    mqChannel = null;
  }
}

// Handle study session events
function handleStudySession(msg) {
  try {
    const message = JSON.parse(msg.content.toString());
    console.log('Received study.session event:', message);
    
    // Store study session data
    analyticsData.studySessions.push({
      ...message,
      timestamp: new Date().toISOString()
    });
    
    // Update total study time
    if (message.duration) {
      analyticsData.totalStudyTime += message.duration;
    }
    
    analyticsData.lastUpdated = new Date().toISOString();
    
    if (mqChannel) {
      mqChannel.ack(msg);
    }
  } catch (error) {
    console.error('Error processing study.session event:', error);
    if (mqChannel) {
      mqChannel.nack(msg, false, false);
    }
  }
}

// Handle quiz completed events
function handleQuizCompleted(msg) {
  try {
    const message = JSON.parse(msg.content.toString());
    console.log('Received quiz.completed event:', message);
    
    // Store quiz result data
    analyticsData.quizResults.push({
      ...message,
      timestamp: new Date().toISOString()
    });
    
    // Update quiz statistics
    analyticsData.totalQuizzes += 1;
    
    // Calculate average score
    if (message.score !== undefined) {
      const totalScore = analyticsData.quizResults.reduce((sum, quiz) => {
        return sum + (quiz.score || 0);
      }, 0);
      analyticsData.averageScore = totalScore / analyticsData.quizResults.length;
    }
    
    analyticsData.lastUpdated = new Date().toISOString();
    
    if (mqChannel) {
      mqChannel.ack(msg);
    }
  } catch (error) {
    console.error('Error processing quiz.completed event:', error);
    if (mqChannel) {
      mqChannel.nack(msg, false, false);
    }
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Dashboard metrics endpoint
app.get('/dashboard/metrics', (req, res) => {
  try {
    // Return comprehensive metrics matching Performance Analytics UI
    const metrics = {
      overview: {
        totalStudyTime: analyticsData.totalStudyTime,
        totalQuizzes: analyticsData.totalQuizzes,
        averageScore: Math.round(analyticsData.averageScore * 100) / 100,
        documentsProcessed: analyticsData.documentsProcessed,
        lastUpdated: analyticsData.lastUpdated
      },
      studyProgress: {
        dailyStudyTime: generateDailyStudyTime(),
        weeklyProgress: generateWeeklyProgress(),
        monthlyTrends: generateMonthlyTrends()
      },
      quizPerformance: {
        recentScores: analyticsData.quizResults.slice(-10).map(quiz => ({
          date: quiz.timestamp,
          score: quiz.score || 0,
          topic: quiz.topic || 'General'
        })),
        averageByTopic: generateTopicAverages(),
        improvementTrend: generateImprovementTrend()
      },
      engagement: {
        sessionsPerWeek: Math.round(analyticsData.studySessions.length / 4) || 1,
        averageSessionLength: analyticsData.studySessions.length > 0 
          ? Math.round(analyticsData.totalStudyTime / analyticsData.studySessions.length) 
          : 0,
        streakDays: calculateStreakDays(),
        preferredStudyTimes: generateStudyTimePreferences()
      },
      recommendations: generateRecommendations()
    };
    
    console.log(`Retrieved analytics metrics: ${JSON.stringify(metrics.overview)}`);
    res.json(metrics);
    
  } catch (error) {
    console.error('Error retrieving analytics metrics:', error);
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
});

// Helper functions for generating mock analytics data
function generateDailyStudyTime() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    minutes: Math.floor(Math.random() * 120) + 30 // 30-150 minutes
  }));
}

function generateWeeklyProgress() {
  const weeks = [];
  for (let i = 4; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7));
    weeks.push({
      week: `Week ${5-i}`,
      studyTime: Math.floor(Math.random() * 500) + 200,
      quizzesCompleted: Math.floor(Math.random() * 10) + 5,
      averageScore: Math.round((Math.random() * 30 + 70) * 100) / 100
    });
  }
  return weeks;
}

function generateMonthlyTrends() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map(month => ({
    month,
    studyHours: Math.floor(Math.random() * 50) + 20,
    improvement: Math.round((Math.random() * 20 - 10) * 100) / 100
  }));
}

function generateTopicAverages() {
  const topics = ['Mathematics', 'Science', 'History', 'Literature', 'Programming'];
  return topics.map(topic => ({
    topic,
    averageScore: Math.round((Math.random() * 30 + 70) * 100) / 100,
    quizCount: Math.floor(Math.random() * 15) + 5
  }));
}

function generateImprovementTrend() {
  const trend = [];
  for (let i = 10; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    trend.push({
      date: date.toISOString().split('T')[0],
      score: Math.round((Math.random() * 20 + 75) * 100) / 100
    });
  }
  return trend;
}

function calculateStreakDays() {
  // Simple calculation based on recent sessions
  return Math.min(analyticsData.studySessions.length, 7);
}

function generateStudyTimePreferences() {
  const hours = ['6-9', '9-12', '12-15', '15-18', '18-21', '21-24'];
  return hours.map(hour => ({
    timeRange: hour,
    sessionCount: Math.floor(Math.random() * 10) + 1
  }));
}

function generateRecommendations() {
  const recommendations = [
    "Consider increasing study time in Mathematics based on recent quiz performance",
    "Great progress this week! Keep up the consistent study schedule",
    "Try studying during your peak performance hours (15-18) more often",
    "Focus on reviewing topics where quiz scores are below 80%",
    "Your study streak is impressive! Aim for 10 consecutive days"
  ];
  
  return recommendations.slice(0, 3); // Return top 3 recommendations
}

// Test endpoints for simulating events
app.post('/test/study-session', (req, res) => {
  const { userId, duration, topic } = req.body;
  const mockEvent = {
    userId: userId || 1,
    duration: duration || 60,
    topic: topic || 'General',
    timestamp: new Date().toISOString()
  };
  
  handleStudySession({ content: Buffer.from(JSON.stringify(mockEvent)) });
  res.json({ message: 'Study session event simulated', event: mockEvent });
});

app.post('/test/quiz-completed', (req, res) => {
  const { userId, score, topic } = req.body;
  const mockEvent = {
    userId: userId || 1,
    score: score || Math.floor(Math.random() * 40) + 60,
    topic: topic || 'General',
    timestamp: new Date().toISOString()
  };
  
  handleQuizCompleted({ content: Buffer.from(JSON.stringify(mockEvent)) });
  res.json({ message: 'Quiz completed event simulated', event: mockEvent });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'StudyFlow Analytics Service',
    version: '1.0.0',
    status: 'running',
    messaging: mqChannel ? 'RabbitMQ' : 'Disabled',
    dataPoints: {
      studySessions: analyticsData.studySessions.length,
      quizResults: analyticsData.quizResults.length,
      totalStudyTime: analyticsData.totalStudyTime
    },
    endpoints: {
      health: '/health',
      metrics: '/dashboard/metrics',
      testStudy: '/test/study-session',
      testQuiz: '/test/quiz-completed'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    service: 'Analytics Service',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Analytics service error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong in the Analytics Service',
    service: 'Analytics Service',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Analytics running on ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  
  // Initialize connections (optional)
  await initRabbitMQ();
  
  console.log('Analytics service started successfully');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down Analytics service...');
  
  if (mqConnection) {
    await mqConnection.close();
  }
  
  process.exit(0);
});

module.exports = app; 