"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();
const app = express();
const PORT = process.env.GATEWAY_PORT || 8000;
// Security middleware
app.use(helmet());
// CORS middleware
app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}));
// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Gateway: ${req.method} ${req.path}`);
    next();
});
// Proxy routes
// Auth Service proxy
app.use('/auth', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:3000',
    changeOrigin: true,
    pathRewrite: {
        '^/auth': '', // Remove /auth prefix when forwarding
    },
    onError: (err, req, res) => {
        console.error('Auth service proxy error:', err.message);
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
    target: process.env.INGESTION_SERVICE_URL || 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: {
        '^/upload': '/api/documents/upload', // Rewrite to correct endpoint
    },
    onError: (err, req, res) => {
        console.error('Ingestion service proxy error:', err.message);
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
// Analytics Service proxy
app.use('/analytics', createProxyMiddleware({
    target: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3005',
    changeOrigin: true,
    pathRewrite: {
        '^/analytics': '', // Remove /analytics prefix when forwarding
    },
    onError: (err, req, res) => {
        console.error('Analytics service proxy error:', err.message);
        res.status(502).json({ 
            error: 'Bad Gateway',
            message: 'Analytics service unavailable',
            timestamp: new Date().toISOString()
        });
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying ${req.method} ${req.url} to Analytics Service`);
    }
}));
// Scheduler Service proxy
app.use('/schedule', createProxyMiddleware({
    target: process.env.SCHEDULER_SERVICE_URL || 'http://localhost:3004',
    changeOrigin: true,
    pathRewrite: {
        '^/schedule': '', // Remove /schedule prefix when forwarding
    },
    onError: (err, req, res) => {
        console.error('Scheduler service proxy error:', err.message);
        res.status(502).json({ 
            error: 'Bad Gateway',
            message: 'Scheduler service unavailable',
            timestamp: new Date().toISOString()
        });
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying ${req.method} ${req.url} to Scheduler Service`);
    }
}));
// Notifications Service proxy
app.use('/notifications', createProxyMiddleware({
    target: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3006',
    changeOrigin: true,
    pathRewrite: {
        '^/notifications': '', // Remove /notifications prefix when forwarding
    },
    onError: (err, req, res) => {
        console.error('Notifications service proxy error:', err.message);
        res.status(502).json({ 
            error: 'Bad Gateway',
            message: 'Notifications service unavailable',
            timestamp: new Date().toISOString()
        });
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying ${req.method} ${req.url} to Notifications Service`);
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
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
    });
});
// Error handler
app.use((error, req, res, next) => {
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
    console.log(`Upload proxy: http://localhost:${PORT}/upload -> ${process.env.INGESTION_SERVICE_URL || 'http://localhost:3002'}`);
    console.log(`Analytics proxy: http://localhost:${PORT}/analytics/* -> ${process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3005'}`);
    console.log(`Schedule proxy: http://localhost:${PORT}/schedule/* -> ${process.env.SCHEDULER_SERVICE_URL || 'http://localhost:3004'}`);
    console.log(`Notifications proxy: http://localhost:${PORT}/notifications/* -> ${process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3006'}`);
});
module.exports = app;
