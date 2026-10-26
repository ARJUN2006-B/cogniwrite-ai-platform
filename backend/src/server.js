const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const logger = require('./utils/logger');

let server;

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Start HTTP Server
  server = app.listen(env.PORT, () => {
    logger.info(`CogniWrite Backend Server running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
    logger.info(`Health check available at: http://localhost:${env.PORT}/api/health`);
    logger.info(`Allowed CORS origins: ${env.CORS_ORIGIN.join(', ')}`);
  });

  // Handle graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`Received ${signal}. Gracefully shutting down CogniWrite server...`);
    if (server) {
      server.close(async () => {
        logger.info('HTTP server closed');
        await disconnectDB();
        process.exit(0);
      });
    } else {
      await disconnectDB();
      process.exit(0);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection at:', promise);
    logger.error('Reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });
};

startServer();
