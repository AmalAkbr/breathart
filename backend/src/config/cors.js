// backend/src/config/cors.js
/**
 * CORS Configuration
 * Handles Cross-Origin Resource Sharing for development and production
 */

import { env } from '../utils/envConfig.js';

/**
 * Get allowed origins based on environment
 * Development: Allows localhost variations
 * Production: Strict origin checking with environment variable
 */
export const getAllowedOrigins = () => {
  const baseOrigins = [env.FRONTEND_URL];

  // In development, allow all localhost variations
  if (env.isDev) {
    return [
      ...baseOrigins,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5000',
      'http://127.0.0.1:5000',
    ];
  }

  // In production, ONLY use FRONTEND_URL from environment
  return baseOrigins;
};

/**
 * CORS configuration object
 */
export const corsConfig = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      if (env.isDev) {
        console.warn(`⚠️  CORS: Origin not in allowed list: ${origin}`);
      } else {
        console.error(`❌ CORS: Blocked origin: ${origin}`);
      }
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'X-Requested-With',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Number'], // Headers available to frontend
  optionsSuccessStatus: 200, // For compatibility with older browsers (IE11)
  maxAge: 86400, // Cache preflight for 24 hours
};

/**
 * Debugging helper - log CORS configuration
 */
export const logCORSConfig = () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║          CORS Configuration                            ║
╠════════════════════════════════════════════════════════╣
║  Environment: ${env.isProd ? 'PRODUCTION' : 'DEVELOPMENT'.padEnd(47)}║
║  Allowed Origins:                                      ║
${getAllowedOrigins()
  .map((origin) => `║    • ${origin}`.padEnd(58) + '║')
  .join('\n')}
║  Credentials: ${corsConfig.credentials ? 'Enabled' : 'Disabled'.padEnd(46)}║
║  Methods: ${corsConfig.methods.join(', ').padEnd(49)}║
╚════════════════════════════════════════════════════════╝
  `);
};

export default corsConfig;
