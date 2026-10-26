/**
 * Validation rules for authentication endpoints
 */
const validateRegister = (data) => {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!data.email || !emailRegex.test(data.email.trim())) {
    errors.push({ field: 'email', message: 'A valid email address is required' });
  }

  if (!data.password || typeof data.password !== 'string' || data.password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
  }

  return errors;
};

const validateLogin = (data) => {
  const errors = [];

  if (!data.email || typeof data.email !== 'string' || !data.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  }

  if (!data.password || typeof data.password !== 'string' || !data.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return errors;
};

module.exports = {
  validateRegister,
  validateLogin
};
