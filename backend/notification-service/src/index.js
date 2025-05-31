const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.NOTIFICATION_PORT || 3006;

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

// In-memory storage for notifications
let notifications = [];

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
    
    // Declare queue for consuming reminder events
    await mqChannel.assertQueue('reminder', { durable: true });
    
    console.log('Connected to RabbitMQ');
    
    // Start consuming reminder events
    mqChannel.consume('reminder', handleReminderEvent, { noAck: false });
    console.log('Started consuming reminder events');
    
  } catch (error) {
    console.error('Failed to connect to RabbitMQ, continuing without messaging:', error.message);
    mqConnection = null;
    mqChannel = null;
  }
}

// Handle reminder events
function handleReminderEvent(msg) {
  try {
    const message = JSON.parse(msg.content.toString());
    console.log(`Notify user: documentId ${message.documentId}`);
    
    // Store notification
    const notification = {
      id: notifications.length + 1,
      type: 'reminder',
      documentId: message.documentId,
      userId: message.userId || 1,
      message: `Time to review document ${message.documentId}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    notifications.push(notification);
    console.log('Notification created:', notification);
    
    // In a real implementation, this would:
    // - Send email notification
    // - Send push notification
    // - Send SMS
    // - Update user's notification feed
    
    if (mqChannel) {
      mqChannel.ack(msg);
    }
  } catch (error) {
    console.error('Error processing reminder event:', error);
    if (mqChannel) {
      mqChannel.nack(msg, false, false);
    }
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get notifications for a user
app.get('/notifications/:userId', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const userNotifications = notifications.filter(n => n.userId === userId);
    
    console.log(`Retrieved ${userNotifications.length} notifications for user ${userId}`);
    res.json(userNotifications);
    
  } catch (error) {
    console.error('Error retrieving notifications:', error);
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

// Mark notification as read
app.put('/notifications/:id/read', (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const notification = notifications.find(n => n.id === notificationId);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    notification.read = true;
    console.log(`Marked notification ${notificationId} as read`);
    res.json(notification);
    
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Send test notification
app.post('/test/reminder', (req, res) => {
  const { documentId, userId } = req.body;
  const mockEvent = {
    documentId: documentId || 1,
    userId: userId || 1,
    timestamp: new Date().toISOString()
  };
  
  handleReminderEvent({ content: Buffer.from(JSON.stringify(mockEvent)) });
  res.json({ message: 'Reminder event simulated', event: mockEvent });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'StudyFlow Notification Service',
    version: '1.0.0',
    status: 'running',
    messaging: mqChannel ? 'RabbitMQ' : 'Disabled',
    stats: {
      totalNotifications: notifications.length,
      unreadNotifications: notifications.filter(n => !n.read).length
    },
    endpoints: {
      health: '/health',
      notifications: '/notifications/:userId',
      markRead: '/notifications/:id/read',
      testReminder: '/test/reminder'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    service: 'Notification Service',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Notification service error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong in the Notification Service',
    service: 'Notification Service',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Notification running on ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  
  // Initialize connections (optional)
  await initRabbitMQ();
  
  console.log('Notification service started successfully');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down Notification service...');
  
  if (mqConnection) {
    await mqConnection.close();
  }
  
  process.exit(0);
});

module.exports = app; 