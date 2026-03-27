import express from 'express';
import {
  signup,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendVerificationEmail,
  getProfile,
  logout,
} from '../controllers/authController.js';
import {
  authenticateToken,
  validateRequest,
  validationSchemas,
} from '../middleware/auth.js';

const router = express.Router();

/**
 * Public Routes
 */

// POST /api/auth/signup
router.post(
  '/signup',
  validateRequest(validationSchemas.signup),
  signup
);

// POST /api/auth/login
router.post(
  '/login',
  validateRequest(validationSchemas.login),
  login
);

// POST /api/auth/verify-email
router.post('/verify-email', verifyEmail);

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  validateRequest(validationSchemas.forgotPassword),
  forgotPassword
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  validateRequest(validationSchemas.resetPassword),
  resetPassword
);

// POST /api/auth/resend-verification
router.post(
  '/resend-verification',
  validateRequest(validationSchemas.forgotPassword),
  resendVerificationEmail
);

/**
 * Protected Routes (Require Authentication)
 */

// GET /api/auth/profile
router.get('/profile', authenticateToken, getProfile);

// POST /api/auth/logout
router.post('/logout', authenticateToken, logout);

export default router;
