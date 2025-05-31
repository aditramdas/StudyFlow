const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email, password: '***' });
  
  // Simple stub - always return success with dummy token
  res.json({ 
    token: 'dummy-jwt-token-' + Date.now(),
    user: {
      id: 1,
      email: email,
      name: 'Test User'
    },
    message: 'Login successful'
  });
});

// Protected route for testing JWT middleware
app.get('/protected', (req, res) => {
  const authHeader = req.headers.authorization;
  console.log('Protected route accessed with auth header:', authHeader);
  
  res.json({ 
    message: 'Access granted to protected route',
    user: { id: 1, email: 'test@example.com' }
  });
});

// Profile endpoint
app.get('/profile', (req, res) => {
  res.json({
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: 'student'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'StudyFlow Auth Service',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      login: '/login',
      profile: '/profile',
      protected: '/protected'
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
app.use((error, req, res, next) => {
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
  console.log(`Auth service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Login endpoint: http://localhost:${PORT}/login`);
});

module.exports = app; 