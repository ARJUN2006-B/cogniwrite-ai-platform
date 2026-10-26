const ApiError = require('../utils/apiError');

/**
 * Middleware factory for validating request bodies against a validator function or schema
 */
const validate = (validatorFn) => {
  return (req, res, next) => {
    try {
      const errors = validatorFn(req.body);
      if (errors && errors.length > 0) {
        return next(ApiError.badRequest('Validation error', errors));
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = validate;
