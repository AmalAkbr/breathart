// backend/src/middleware/rateLimit.js
/**
 * Rate Limiting Middleware
 * Protects against brute force attacks, DDoS, and abuse
 */

import rateLimit from 'express-rate-limit';

const toRetryAfterSeconds = (req, fallbackSeconds) => {
  const resetTime = req.rateLimit?.resetTime;
  if (resetTime instanceof Date) {
    return Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000));
  }
  const reset = Number(req.rateLimit?.resetTime);
  if (!Number.isNaN(reset) && reset > 0) {
    return Math.max(1, Math.ceil(reset));
  }
  return fallbackSeconds;
};

const buildRateLimitHandler = (defaultMessage, fallbackSeconds) => {
  return (req, res) => {
    const retryAfterSec = toRetryAfterSeconds(req, fallbackSeconds);
    res.set('Retry-After', String(retryAfterSec));
    res.status(429).json({
      success: false,
      message: `${defaultMessage} Try again in ${retryAfterSec} seconds.`,
      retryAfterSec,
      error: 'RATE_LIMITED'
    });
  };
};

/**
 * General API rate limiter: 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  handler: buildRateLimitHandler('Too many requests from this IP.', 15 * 60),
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
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 attempts per 5 minutes
  handler: buildRateLimitHandler('Too many login/signup attempts.', 5 * 60),
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
  handler: buildRateLimitHandler('Too many verification attempts.', 60 * 60),
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
  handler: buildRateLimitHandler('Too many password reset attempts.', 30 * 60),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return `${req.ip}-${req.body?.email || 'unknown'}`;
  }
});

/**
 * File upload limiter: 20 uploads per 2 minutes
 * Tuned for admin bulk uploads while still protecting server resources
 */
export const uploadLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 20,
  handler: buildRateLimitHandler('Upload limit reached (20 uploads per 2 minutes).', 2 * 60),
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Admin API limiter: 1000 requests per 15 minutes
 * Allows reasonable admin operations while preventing abuse
 */
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes
  handler: buildRateLimitHandler('Admin API rate limit exceeded.', 15 * 60),
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
  handler: buildRateLimitHandler('Too many requests to this endpoint.', 60),
  standardHeaders: true,
  legacyHeaders: false
});
