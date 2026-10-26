const env = require('../config/env');
const logger = require('../utils/logger');
const ApiError = require('../utils/apiError');

/**
 * Centralized Express Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log error for server observability
  if (err.statusCode && err.statusCode < 500) {
    logger.warn(`Operational warning (${err.statusCode}): ${err.message} [${req.method} ${req.originalUrl}]`);
  } else {
    logger.error(`Server error: ${err.message}`, err.stack);
  }

  // Handle JSON parsing syntax error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = ApiError.badRequest('Invalid JSON payload in request body');
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Invalid resource identifier format: ${err.value}`;
    error = ApiError.badRequest(message);
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const validationErrors = Object.values(err.errors || {}).map(e => ({
      field: e.path,
      message: e.message
    }));
    error = ApiError.badRequest('Validation failed', validationErrors);
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const duplicatedField = Object.keys(err.keyValue || {})[0] || 'resource';
    const message = `A record with this ${duplicatedField} already exists`;
    error = ApiError.conflict(message);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid authentication token');
  }
  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Authentication token has expired. Please log in again.');
  }

  // Handle CORS errors
  if (err.message && err.message.startsWith('Not allowed by CORS')) {
    error = new ApiError(403, err.message);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const errors = error.errors || [];

  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : undefined,
    stack: env.isDevelopment ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
