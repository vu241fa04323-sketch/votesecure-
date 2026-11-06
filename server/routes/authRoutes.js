const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { adminLogin, voterLogin, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const {
  adminLoginRules,
  voterLoginRules,
  validate,
} = require('../middleware/validationMiddleware');

// Apply rate limiting to login endpoints to protect against brute-force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 login attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
  },
});

router.post('/admin/login', loginLimiter, adminLoginRules, validate, adminLogin);
router.post('/voter/login', loginLimiter, voterLoginRules, validate, voterLogin);
router.get('/me', authenticate, getMe);

module.exports = router;
