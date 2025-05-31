const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 8000;

// Security middleware
app.use(helmet());

// CORS middleware - Allow frontend on port 8080
app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Gateway: ${req.method} ${req.path}`);
    next();
});

// Auth Service proxy
app.use('/auth', createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
    pathRewrite: {
        '^/auth': '', // Remove /auth prefix when forwarding
    },
    onError: (err, req, res) => {
        console.error('Auth service proxy error:', err.message);
        res.status(502).json({ 
            error: 'Bad Gateway',
            message: 'Auth service unavailable'
        });
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying ${req.method} ${req.url} to Auth Service`);
    }
}));

// Analytics Service proxy
app.use('/analytics', createProxyMiddleware({
    target: 'http://localhost:3005',
    changeOrigin: true,
    pathRewrite: {
        '^/analytics': '', // Remove /analytics prefix when forwarding
    },
    onError: (err, req, res) => {
        console.error('Analytics service proxy error:', err.message);
        res.status(502).json({ 
            error: 'Bad Gateway',
            message: 'Analytics service unavailable'
        });
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying ${req.method} ${req.url} to Analytics Service`);
    }
}));

// Scheduler Service proxy
app.use('/schedule', createProxyMiddleware({
    target: 'http://localhost:3004',
    changeOrigin: true,
    pathRewrite: {
        '^/schedule': '', // Remove /schedule prefix when forwarding
    },
    onError: (err, req, res) => {
        console.error('Scheduler service proxy error:', err.message);
        res.status(502).json({ 
            error: 'Bad Gateway',
            message: 'Scheduler service unavailable'
        });
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying ${req.method} ${req.url} to Scheduler Service`);
    }
}));

// Notifications Service proxy
app.use('/notifications', createProxyMiddleware({
    target: 'http://localhost:3006',
    changeOrigin: true,
    pathRewrite: {
        '^/notifications': '', // Remove /notifications prefix when forwarding
    },
    onError: (err, req, res) => {
        console.error('Notifications service proxy error:', err.message);
        res.status(502).json({ 
            error: 'Bad Gateway',
            message: 'Notifications service unavailable'
        });
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying ${req.method} ${req.url} to Notifications Service`);
    }
}));

// Ingestion Service proxy
app.use('/upload', createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: {
        '^/upload': '/api/documents/upload', // Rewrite to correct endpoint
    },
    onError: (err, req, res) => {
        console.error('Ingestion service proxy error:', err.message);
        res.status(502).json({ 
            error: 'Bad Gateway',
            message: 'Ingestion service unavailable'
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
        status: 'running',
        endpoints: {
            health: '/health',
            auth: '/auth/*',
            upload: '/upload',
            analytics: '/analytics/*',
            schedule: '/schedule/*',
            notifications: '/notifications/*'
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Gateway error:', error);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Something went wrong in the API Gateway'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Gateway listening on ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Auth proxy: http://localhost:${PORT}/auth/* -> http://localhost:3000`);
    console.log(`Upload proxy: http://localhost:${PORT}/upload -> http://localhost:3002`);
    console.log(`Analytics proxy: http://localhost:${PORT}/analytics/* -> http://localhost:3005`);
    console.log(`Schedule proxy: http://localhost:${PORT}/schedule/* -> http://localhost:3004`);
    console.log(`Notifications proxy: http://localhost:${PORT}/notifications/* -> http://localhost:3006`);
}); 