// backend/src/middleware/rateLimit.js
/**
 * Rate Limiting Middleware
 * Protects against brute force attacks, DDoS, and abuse
 */

import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter: 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks and static assets
    if (req.path === '/api/health') return true;
    if (req.path.startsWith('/assets')) return true;
    return false;
  }
});

/**
 * Strict auth limiter: 5 requests per 15 minutes (login, signup)
 * Prevents brute force password attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many login/signup attempts, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  keyGenerator: (req, res) => {
    // Rate limit by IP + email combination for login/signup
    return `${req.ip}-${req.body?.email || 'unknown'}`;
  }
});

/**
 * Email verification limiter: 3 requests per hour
 * Prevents email flooding
 */
export const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: 'Too many verification attempts. Please try again in 1 hour.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return `${req.ip}-${req.body?.email || 'unknown'}`;
  }
});

/**
 * Password reset limiter: 3 requests per 30 minutes
 * Prevents brute forcing password reset tokens
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 3, // 3 attempts per 30 minutes
  message: 'Too many password reset attempts. Please try again in 30 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return `${req.ip}-${req.body?.email || 'unknown'}`;
  }
});

/**
 * File upload limiter: 10 uploads per hour
 * Prevents storage abuse
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: 'Too many file uploads. Please try again in 1 hour.',
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Admin API limiter: 1000 requests per 15 minutes
 * Allows reasonable admin operations while preventing abuse
 */
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes
  message: 'Admin API rate limit exceeded.',
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Strict endpoint limiter: 10 requests per minute
 * For highly sensitive operations
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many requests to this endpoint, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
