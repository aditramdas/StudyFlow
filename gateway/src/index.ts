import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.GATEWAY_PORT || 8000;

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

// Proxy routes
// Auth Service proxy
app.use('/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/auth': '', // Remove /auth prefix when forwarding
  },
  onError: (err, req, res) => {
    console.error('Auth service proxy error:', err);
    res.status(502).json({ 
      error: 'Bad Gateway',
      message: 'Auth service unavailable',
      timestamp: new Date().toISOString()
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} to Auth Service`);
  }
}));

// Ingestion Service proxy
app.use('/upload', createProxyMiddleware({
  target: process.env.INGESTION_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('Ingestion service proxy error:', err);
    res.status(502).json({ 
      error: 'Bad Gateway',
      message: 'Ingestion service unavailable',
      timestamp: new Date().toISOString()
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} to Ingestion Service`);
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'API Gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'StudyFlow API Gateway',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/auth/*',
      upload: '/upload',
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Gateway error:', error);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: 'Something went wrong in the API Gateway',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Gateway listening on ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Auth proxy: http://localhost:${PORT}/auth/* -> ${process.env.AUTH_SERVICE_URL || 'http://localhost:3000'}`);
  console.log(`Upload proxy: http://localhost:${PORT}/upload -> ${process.env.INGESTION_SERVICE_URL || 'http://localhost:3001'}/upload`);
});

export default app; 