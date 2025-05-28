import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server configuration
  port: process.env.INGESTION_PORT || 3002,
  nodeEnv: process.env.NODE_ENV || 'development',

  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',

  // File upload configuration
  maxFileSize: 50 * 1024 * 1024, // 50MB
  uploadDir: process.env.UPLOAD_DIR || 'uploads',

  // RabbitMQ configuration
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    queues: {
      documentProcessing: 'document.processing',
      documentProcessed: 'document.processed'
    }
  },

  // Database configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/studiflow'
  }
}; 