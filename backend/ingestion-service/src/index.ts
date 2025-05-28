import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import documentRoutes from './routes/document.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.INGESTION_PORT || 3002;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'Ingestion Service',
    timestamp: new Date().toISOString()
  });
});

// Document routes
app.use('/api/documents', documentRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'StudyFlow Ingestion Service',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      upload: '/api/documents/upload',
      status: '/api/documents/status/:documentId'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    service: 'Ingestion Service',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Ingestion service error:', error);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: 'Something went wrong in the Ingestion Service',
    service: 'Ingestion Service',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Ingestion service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app; 