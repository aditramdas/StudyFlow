const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.SCHEDULER_PORT || 3004;

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

// In-memory storage for testing (when Redis is not available)
let inMemorySchedule = [];

// Redis client (optional)
let redisClient = null;

// RabbitMQ connection (optional)
let mqConnection = null;
let mqChannel = null;

// Initialize Redis connection (optional)
async function initRedis() {
  try {
    const redis = require('redis');
    redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    });
    
    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
      redisClient = null; // Fallback to in-memory
    });
    
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Failed to connect to Redis, using in-memory storage:', error.message);
    redisClient = null;
  }
}

// Initialize RabbitMQ connection (optional)
async function initRabbitMQ() {
  try {
    const amqp = require('amqplib');
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672/';
    mqConnection = await amqp.connect(rabbitmqUrl);
    mqChannel = await mqConnection.createChannel();
    
    // Declare the queue for consuming nlp.completed events
    await mqChannel.assertQueue('nlp.completed', { durable: true });
    
    console.log('Connected to RabbitMQ');
    
    // Start consuming nlp.completed events
    mqChannel.consume('nlp.completed', handleNlpCompleted, { noAck: false });
    console.log('Started consuming nlp.completed events');
    
  } catch (error) {
    console.error('Failed to connect to RabbitMQ, continuing without messaging:', error.message);
    mqConnection = null;
    mqChannel = null;
  }
}

// Handle nlp.completed events
function handleNlpCompleted(msg) {
  try {
    const message = JSON.parse(msg.content.toString());
    console.log('Received nlp.completed event:', message);
    
    const documentId = message.documentId;
    if (documentId) {
      // Seed schedule with a dummy review entry
      seedSchedule(documentId);
    }
    
    if (mqChannel) {
      mqChannel.ack(msg);
    }
  } catch (error) {
    console.error('Error processing nlp.completed event:', error);
    if (mqChannel) {
      mqChannel.nack(msg, false, false);
    }
  }
}

// Seed schedule for a document
async function seedSchedule(documentId) {
  try {
    const dueAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
    const scheduleItem = { documentId, dueAt };
    
    if (redisClient) {
      // Use Redis if available
      await redisClient.zAdd('due:flashcards', {
        score: dueAt,
        value: JSON.stringify(scheduleItem)
      });
      console.log(`Seeded schedule in Redis for document ${documentId}, due at ${new Date(dueAt).toISOString()}`);
    } else {
      // Use in-memory storage as fallback
      inMemorySchedule.push(scheduleItem);
      console.log(`Seeded schedule in memory for document ${documentId}, due at ${new Date(dueAt).toISOString()}`);
    }
  } catch (error) {
    console.error('Error seeding schedule:', error);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get today's schedule
app.get('/schedule/today', async (req, res) => {
  try {
    const now = Date.now();
    const endOfDay = now + (24 * 60 * 60 * 1000); // Next 24 hours
    let schedule = [];
    
    if (redisClient) {
      // Use Redis if available
      try {
        const dueItems = await redisClient.zRangeByScore('due:flashcards', now, endOfDay);
        schedule = dueItems.map(item => {
          try {
            return JSON.parse(item);
          } catch (e) {
            console.error('Error parsing schedule item:', e);
            return null;
          }
        }).filter(item => item !== null);
      } catch (error) {
        console.error('Error retrieving from Redis:', error);
        // Fallback to in-memory
        schedule = inMemorySchedule.filter(item => item.dueAt >= now && item.dueAt <= endOfDay);
      }
    } else {
      // Use in-memory storage
      schedule = inMemorySchedule.filter(item => item.dueAt >= now && item.dueAt <= endOfDay);
    }
    
    console.log(`Retrieved ${schedule.length} items for today's schedule`);
    res.json(schedule);
    
  } catch (error) {
    console.error('Error retrieving schedule:', error);
    res.status(500).json({ error: 'Failed to retrieve schedule' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'StudyFlow Scheduler Service',
    version: '1.0.0',
    status: 'running',
    storage: redisClient ? 'Redis' : 'In-Memory',
    messaging: mqChannel ? 'RabbitMQ' : 'Disabled',
    endpoints: {
      health: '/health',
      schedule: '/schedule/today',
    }
  });
});

// Setup cron job to scan for due flashcards every minute
cron.schedule('* * * * *', () => {
  console.log('Scanning due flashcards');
  // In a real implementation, this would process due flashcards
  // For now, just log the activity
});

// Test endpoint to manually seed a schedule item
app.post('/test/seed', (req, res) => {
  const { documentId } = req.body;
  if (!documentId) {
    return res.status(400).json({ error: 'documentId is required' });
  }
  
  seedSchedule(documentId);
  res.json({ message: `Seeded schedule for document ${documentId}` });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    service: 'Scheduler Service',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Scheduler service error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong in the Scheduler Service',
    service: 'Scheduler Service',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Scheduler running on ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  
  // Initialize connections (optional)
  await initRedis();
  await initRabbitMQ();
  
  console.log('Scheduler service started successfully');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down Scheduler service...');
  
  if (redisClient) {
    await redisClient.quit();
  }
  
  if (mqConnection) {
    await mqConnection.close();
  }
  
  process.exit(0);
});

module.exports = app; 