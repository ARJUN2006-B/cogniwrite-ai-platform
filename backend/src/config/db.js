const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

let isConnected = false;

/**
 * Connect to MongoDB with robust error reporting and lifecycle event handlers
 */
const connectDB = async () => {
  if (isConnected) {
    logger.debug('Using existing MongoDB connection');
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    });

    isConnected = conn.connection.readyState === 1;
    logger.info(`MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);

    // Register event listeners
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB runtime connection error:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully');
      isConnected = true;
    });

    return conn.connection;
  } catch (error) {
    logger.error('CRITICAL: MongoDB connection failed!');
    logger.error(`Connection String: ${env.MONGO_URI}`);
    logger.error(`Error details: ${error.message}`);
    logger.info('Troubleshooting:');
    logger.info(' 1. Ensure the MongoDB service is running (e.g. `Get-Service MongoDB` or `mongod`).');
    logger.info(' 2. Verify network connectivity to localhost:27017.');
    logger.info(' 3. Check MONGO_URI in your backend/.env configuration file.');
    
    // In production or test, handle gracefully without crashing immediately if in test
    if (env.isProduction) {
      process.exit(1);
    }
    return null;
  }
};

/**
 * Disconnect from MongoDB (useful during testing or graceful shutdown)
 */
const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected cleanly');
  }
};

/**
 * Check MongoDB connection status
 */
const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = {
  connectDB,
  disconnectDB,
  isDbConnected
};
