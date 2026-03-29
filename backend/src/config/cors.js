// backend/src/config/cors.js
/**
 * CORS Configuration
 * Handles Cross-Origin Resource Sharing for development and production
 */

import env from '../utils/envConfig.js';

/**
 * Get allowed origins based on environment
 * Development: Allows localhost variations
 * Production: Strict origin checking with environment variable
 */
export const getAllowedOrigins = () => {
  const devOrigins = env.NODE_ENV === 'development'
    ? ['http://localhost:5173', 'http://127.0.0.1:5173']
    : ['http://127.0.0.1:8080'];

  // FRONTEND_URL and CORS_ORIGIN can be comma-separated
  const envOrigins = [
    ...(env.FRONTEND_URL?.split(',') || []),
    ...(env.CORS_ORIGIN?.split(',') || []),
  ];

  return Array.from(new Set([
    ...envOrigins,
    ...devOrigins,
  ].map((origin) => origin.trim()).filter(Boolean)));
};

/**
 * CORS configuration object
 */
export const corsConfig = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    const isAllowed = !origin || allowedOrigins.includes(origin);
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked origin: ${origin}`);
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  optionsSuccessStatus: 200,
};

export default corsConfig;
