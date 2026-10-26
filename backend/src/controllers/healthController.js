const env = require('../config/env');
const { isDbConnected } = require('../config/db');
const { getAIProvider } = require('../services/ai');
const ApiResponse = require('../utils/apiResponse');

/**
 * Health check controller
 * GET /api/health
 */
const getHealth = (req, res) => {
  const dbConnected = isDbConnected();
  const aiProvider = getAIProvider();

  const healthData = {
    status: dbConnected ? 'healthy' : 'degraded',
    version: '1.0.0',
    service: 'cogniwrite-api',
    environment: env.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbConnected ? 'connected' : 'disconnected',
      client: 'mongoose'
    },
    aiService: {
      provider: aiProvider.getName(),
      configured: aiProvider.isConfigured()
    },
    memoryUsage: {
      rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    }
  };

  const statusCode = dbConnected ? 200 : 503;
  return ApiResponse.success(res, healthData, 'System health report', statusCode);
};

module.exports = {
  getHealth
};
