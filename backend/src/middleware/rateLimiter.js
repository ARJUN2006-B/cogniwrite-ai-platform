const ApiError = require('../utils/apiError');

/**
 * In-memory sliding window rate limiter
 * Protects auth and AI endpoints without requiring external Redis in dev/portfolio mode
 */
const createRateLimiter = ({ windowMs = 60000, max = 30, message = 'Too many requests. Please slow down.' }) => {
  const requests = new Map();

  return (req, res, next) => {
    // Get client IP address
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    const clientData = requests.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + windowMs;
    } else {
      clientData.count += 1;
    }

    requests.set(ip, clientData);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - clientData.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(clientData.resetTime / 1000));

    if (clientData.count > max) {
      return next(new ApiError(429, message));
    }

    next();
  };
};

module.exports = {
  createRateLimiter,
  aiRateLimiter: createRateLimiter({ windowMs: 60000, max: 40, message: 'AI rate limit exceeded. Please wait a minute.' }),
  authRateLimiter: createRateLimiter({ windowMs: 60000, max: 20, message: 'Too many authentication attempts. Please try again shortly.' })
};
