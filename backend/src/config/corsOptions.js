const env = require('./env');
const logger = require('../utils/logger');

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) {
      return callback(null, true);
    }

    if (env.CORS_ORIGIN.indexOf(origin) !== -1 || env.CORS_ORIGIN.includes('*')) {
      callback(null, true);
    } else {
      logger.warn(`Blocked by CORS policy: Origin '${origin}' is not allowed`);
      callback(new Error(`Not allowed by CORS: Origin ${origin} is not in allowed origins`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
};

module.exports = corsOptions;
