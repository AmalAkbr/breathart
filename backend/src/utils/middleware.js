/**
 * Middleware Helpers
 * Common middleware functions used across routes
 */

import jwt from 'jsonwebtoken';
import { env } from './envConfig.js';

/**
 * Verify authentication token middleware
 * Extracts and validates Bearer token from Authorization header
 */
export const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    // Verify token with JWT
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user to request for use in route handlers
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth verification error:', err);
    res.status(500).json({ error: 'Failed to verify authentication' });
  }
};

/**
 * Error handler for async route handlers
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Validate required fields in request body
 */
export const validateFields = (fields) => {
  return (req, res, next) => {
    const missing = fields.filter(field => !req.body[field]);
    
    if (missing.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missing.join(', ')}`
      });
    }
    
    next();
  };
};
