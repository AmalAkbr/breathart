import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { env } from '../utils/envConfig.js';

/**
 * JWT Authentication Middleware
 */
export const authenticateToken = (req, res, next) => {
  try {
    // Get token from Bearer header or cookies
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1] || req.cookies?.authToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required'
      });
    }

    // Verify token
    jwt.verify(token, env.JWT_SECRET, (error, decoded) => {
      if (error) {
        console.error('[AUTH MIDDLEWARE] Token verification failed:', error.message);
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired token',
          error: error.message
        });
      }

      // Attach user to request
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('[AUTH MIDDLEWARE] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource'
      });
    }

    next();
  };
};

/**
 * Validation middleware factory
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body, { abortEarly: false });

      if (error) {
        const message = error.details.map(err => err.message).join(', ');
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: message
        });
      }

      req.validatedData = value;
      next();
    } catch (err) {
      console.error('[VALIDATION] Error:', err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: err.message
      });
    }
  };
};

/**
 * Request validation schemas
 */
export const validationSchemas = {
  signup: Joi.object({
    fullName: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'Full name is required',
      'string.min': 'Full name must be at least 2 characters',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'string.empty': 'Email is required',
    }),
    password: Joi.string().min(8).max(128).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
    }),
    confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
      'any.only': 'Passwords must match',
      'string.empty': 'Password confirmation is required',
    }),
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'string.empty': 'Email is required',
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required',
    }),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'string.empty': 'Email is required',
    }),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      'string.empty': 'Reset token is required',
    }),
    newPassword: Joi.string().min(8).max(128).required().messages({
      'string.empty': 'New password is required',
      'string.min': 'Password must be at least 8 characters',
    }),
    confirmPassword: Joi.string().required().valid(Joi.ref('newPassword')).messages({
      'any.only': 'Passwords must match',
      'string.empty': 'Password confirmation is required',
    }),
  }),

  uploadVideo: Joi.object({
    title: Joi.string().min(3).max(200).required().messages({
      'string.empty': 'Video title is required',
      'string.min': 'Title must be at least 3 characters',
    }),
    description: Joi.string().max(1000),
    category: Joi.string().valid('course', 'tutorial', 'webinar', 'other').default('course'),
    duration: Joi.number().default(0),
    tags: Joi.array().items(Joi.string()),
  }),
};

/**
 * Error handling middleware
 */
export const errorHandler = (error, req, res, next) => {
  console.error('❌ Error:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: messages,
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Multer errors
  if (error.name === 'MulterError') {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File too large'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({
        success: false,
        message: 'Too many files'
      });
    }
  }

  // Default error
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(env.isDev && { stack: error.stack })
  });
};

/**
 * 404 handler
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
};

/**
 * Protect Immutable Fields Middleware
 * Prevents users from modifying immutable fields: email, role, isEmailVerified
 * These fields can only be modified by admin or system operations
 */
export const protectImmutableFields = (req, res, next) => {
  const immutableFields = ['email', 'role', 'isEmailVerified'];
  const attemptedChanges = [];

  // Check if request body attempts to modify immutable fields
  if (req.body) {
    immutableFields.forEach(field => {
      if (req.body.hasOwnProperty(field)) {
        attemptedChanges.push(field);
      }
    });
  }

  // If attempting to modify immutable fields, reject
  if (attemptedChanges.length > 0) {
    console.warn(`[SECURITY] User ${req.user?.email} attempted to modify immutable fields: ${attemptedChanges.join(', ')}`);
    return res.status(403).json({
      success: false,
      message: 'Cannot modify protected fields: ' + attemptedChanges.join(', '),
      immutableFields: attemptedChanges
    });
  }

  next();
};
