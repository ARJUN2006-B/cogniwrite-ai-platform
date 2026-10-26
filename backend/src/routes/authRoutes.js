const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  getPublicProfile,
  toggleFollow,
  getBookmarks,
  toggleBookmark
} = require('../controllers/authController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateRequest');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const { authRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authRateLimiter, validate(validateRegister), register);
router.post('/login', authRateLimiter, validate(validateLogin), login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

// Bookmarks routes
router.get('/bookmarks', authenticate, getBookmarks);
router.post('/bookmarks/:id', authenticate, toggleBookmark);

// User profile & follow routes
router.get('/users/:id', optionalAuth, getPublicProfile);
router.post('/users/:id/follow', authenticate, toggleFollow);

module.exports = router;
