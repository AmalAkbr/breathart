import express from 'express';
import {
  signup,
  login,
  verifyEmail,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  resendVerificationEmail,
  getProfile,
  getExamNotifications,
  logout,
} from '../controllers/authController.js';
import {
  authenticateToken,
  validateRequest,
  validationSchemas,
} from '../middleware/auth.js';
import {
  authLimiter,
  emailVerificationLimiter,
  passwordResetLimiter,
} from '../middleware/rateLimit.js';

const router = express.Router();

/**
 * Public Routes
 */

// POST /api/auth/signup (Rate limited: 5 attempts per 15 min)
router.post(
  '/signup',
  authLimiter,
  validateRequest(validationSchemas.signup),
  signup
);

// POST /api/auth/login (Rate limited: 5 attempts per 15 min)
router.post(
  '/login',
  authLimiter,
  validateRequest(validationSchemas.login),
  login
);

// POST /api/auth/verify-email (Rate limited: 3 attempts per hour)
router.post(
  '/verify-email',
  emailVerificationLimiter,
  verifyEmail
);

// POST /api/auth/forgot-password (Rate limited: 3 attempts per 30 min)
router.post(
  '/forgot-password',
  passwordResetLimiter,
  validateRequest(validationSchemas.forgotPassword),
  forgotPassword
);

// POST /api/auth/verify-reset-token (Rate limited: 3 attempts per 30 min)
router.post(
  '/verify-reset-token',
  passwordResetLimiter,
  verifyResetToken
);

// POST /api/auth/reset-password (Rate limited: 3 attempts per 30 min)
router.post(
  '/reset-password',
  passwordResetLimiter,
  validateRequest(validationSchemas.resetPassword),
  resetPassword
);

// POST /api/auth/resend-verification (Rate limited: 3 attempts per hour)
router.post(
  '/resend-verification',
  emailVerificationLimiter,
  validateRequest(validationSchemas.forgotPassword),
  resendVerificationEmail
);

/**
 * Protected Routes (Require Authentication)
 */

// GET /api/auth/profile
router.get('/profile', authenticateToken, getProfile);

// GET /api/auth/exam-notifications
router.get('/exam-notifications', authenticateToken, getExamNotifications);

// POST /api/auth/logout
router.post('/logout', authenticateToken, logout);

export default router;
