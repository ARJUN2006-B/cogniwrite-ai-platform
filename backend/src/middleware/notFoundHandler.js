const ApiError = require('../utils/apiError');

/**
 * Middleware to handle routes that are not found (404)
 */
const notFoundHandler = (req, res, next) => {
  const error = ApiError.notFound(`Cannot find route: ${req.method} ${req.originalUrl}`);
  next(error);
};

module.exports = notFoundHandler;
