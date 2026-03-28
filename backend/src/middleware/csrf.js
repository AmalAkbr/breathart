// backend/src/middleware/csrf.js
/**
 * CSRF Protection Middleware
 * Prevents Cross-Site Request Forgery attacks
 */

import crypto from 'crypto';

/**
 * Generate CSRF token
 */
export const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * CSRF Token Middleware
 * Adds CSRF token to session and validates on state-changing requests
 */
export const csrfProtection = (req, res, next) => {
  // Set CSRF token on first visit or if missing
  if (!req.session?.csrfToken) {
    if (!req.session) {
      req.session = {};
    }
    req.session.csrfToken = generateCSRFToken();
  }

  // Add token to request for use in forms/responses
  req.csrfToken = () => req.session.csrfToken;

  // For GET requests, just add token to locals
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // For state-changing requests (POST, PUT, DELETE), validate token
  const token = req.headers['x-csrf-token'] || 
                req.body?._csrf || 
                req.query?._csrf;

  if (!token || token !== req.session?.csrfToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token validation failed',
      error: 'Invalid or missing CSRF token'
    });
  }

  next();
};

/**
 * Alternative: Double Submit Cookie Pattern
 * More suitable for API-only applications (no sessions)
 */
export const doubleSubmitCookie = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    // Generate and set CSRF token cookie
    const token = generateCSRFToken();
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false, // Must be readable by JS
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    return next();
  }

  // For state-changing requests, validate token
  const token = req.headers['x-csrf-token'] || 
                req.body?._csrf;
  const cookieToken = req.cookies?.['XSRF-TOKEN'];

  if (!token || !cookieToken || token !== cookieToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token validation failed',
      error: 'Token mismatch'
    });
  }

  next();
};
