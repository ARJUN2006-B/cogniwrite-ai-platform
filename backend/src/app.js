const express = require('express');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const apiRoutes = require('./routes');
const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Security and CORS
app.use(cors(corsOptions));

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.debug(`${req.method} ${req.originalUrl} [${res.statusCode}] - ${duration}ms`);
  });
  next();
});

// Mount modular API routes under /api
app.use('/api', apiRoutes);

// Root route for API welcome / service information
app.get('/', (req, res) => {
  res.json({
    name: 'CogniWrite API',
    description: 'AI-Powered Publishing & Knowledge-Sharing Platform API',
    version: '1.0.0',
    docs: '/api/health'
  });
});

// Centralized Not Found handler for undefined endpoints
app.use(notFoundHandler);

// Centralized Error handler
app.use(errorHandler);

module.exports = app;
