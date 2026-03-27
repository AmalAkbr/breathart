// backend/src/helpers/errorHandler.js
import { MESSAGES, HTTP_STATUS } from '../constants/index.js';

/**
 * Create standardized error response
 */
export const createErrorResponse = (statusCode, message, details = null) => {
  return {
    statusCode,
    message,
    ...(details && { details }),
    timestamp: new Date().toISOString(),
  };
};

/**
 * Handle async errors in routes
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Parse MongoDB database errors
 */
export const parseMongoError = (error) => {
  if (error.code === 11000) {
    return { message: 'Resource already exists', statusCode: HTTP_STATUS.CONFLICT };
  }
  if (error.name === 'ValidationError') {
    return { message: 'Invalid data format', statusCode: HTTP_STATUS.BAD_REQUEST };
  }
  return { message: MESSAGES.ERROR.DATABASE_ERROR, statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR };
};

/**
 * Log error with timestamp
 */
export const logError = (context, error) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ${context}:`, error.message);
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', error.stack);
  }
};

export default {
  createErrorResponse,
  asyncHandler,
  parseMongoError,
  logError,
};
