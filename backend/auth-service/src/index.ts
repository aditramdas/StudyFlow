import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.AUTH_PORT || 3000;

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

// JWT Middleware stub
const jwtMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    console.log('Authorization header found:', authHeader);
    // Extract token (assuming "Bearer <token>" format)
    const token = authHeader.split(' ')[1];
    console.log('Token extracted:', token ? 'present' : 'missing');
  } else {
    console.log('No Authorization header provided');
  }
  
  // For now, allow all requests through (stub behavior)
  console.log('JWT middleware: allowing request through (stub)');
  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes
// Login stub
app.post('/auth/login', (req, res) => {
  console.log('Login attempt:', req.body);
  res.json({ token: 'dummy' });
});

// Protected route for testing JWT middleware
app.get('/protected', jwtMiddleware, (req, res) => {
  res.json({ 
    message: 'Access granted to protected route',
    timestamp: new Date().toISOString(),
    user: 'test-user' // Stub user data
  });
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'StudyFlow Auth Service',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      login: '/auth/login',
      register: '/auth/register',
      protected: '/protected',
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    service: 'Auth Service',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Auth service error:', error);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: 'Something went wrong in the Auth Service',
    service: 'Auth Service',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Auth service running on ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app; 