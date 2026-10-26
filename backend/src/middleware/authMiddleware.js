const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/apiError');
const User = require('../models/User');

/**
 * JWT Authentication Middleware
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(ApiError.unauthorized('Authentication required: Bearer token missing'));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(ApiError.unauthorized('Authentication token missing'));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    // Attach decoded user info; optionally fetch fresh record from DB if needed
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(ApiError.unauthorized('The user belonging to this token no longer exists'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware: attaches user if token is present, does not fail if not
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
        }
      }
    }
    next();
  } catch {
    // Silently continue without user
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth
};
