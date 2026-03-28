import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM filename and dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import config
import env from './utils/envConfig.js';

// Import routes
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import videoRoutes from './routes/videos.js';
import adminRoutes from './routes/admin.js';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/auth.js';
import {
  generalLimiter,
  authLimiter,
  emailVerificationLimiter,
  passwordResetLimiter,
  uploadLimiter,
  adminLimiter
} from './middleware/rateLimit.js';

// Import cron job service
import { initCleanupCron } from './services/cropJobService.js';
import { initializeUploadSocketServer } from './websocket/uploadSocketServer.js';

const app = express();
const server = http.createServer(app);

console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🚀 Breath Art Institute Backend - MongoDB                ║
║  📡 Starting Server...                                     ║
╚═══════════════════════════════════════════════════════════╝
`);

// ==============================================
// DATABASE CONNECTION
// ==============================================

try {
  await mongoose.connect(env.MONGODB_URI);
  console.log('✅ MongoDB Connected');
} catch (error) {
  console.error('❌ MongoDB Connection Failed:', error.message);
  process.exit(1);
}

// ==============================================
// SECURITY MIDDLEWARE - HELMET CONFIGURATION
// ==============================================

// Enhanced helmet with strict CSP and security headers
// CSP allows Google Fonts, YouTube (embed), Google Maps, and the configured frontend origin
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  'https://*.youtube.com',
  'https://*.youtube-nocookie.com',
  'https://*.ytimg.com',
  'https://s.ytimg.com',
  'https://*.gstatic.com',
  'https://*.googleapis.com',
  'https://*.google.com'
];
const scriptSrcAttr = ["'self'", "'unsafe-inline'"]; // prevent script-src-attr 'none' errors
const styleSrc = ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'];
const fontSrc = ["'self'", 'data:', 'https://fonts.gstatic.com'];
const connectSrc = [
  "'self'",
  env.FRONTEND_URL,
  'https://*.youtube.com',
  'https://*.youtube-nocookie.com',
  'https://*.ytimg.com',
  'https://s.ytimg.com',
  'https://*.gstatic.com',
  'https://*.googleapis.com',
  'https://*.google.com',
  'https://maps.google.com'
].filter(Boolean);
const frameSrc = [
  "'self'",
  'https://*.youtube.com',
  'https://*.youtube-nocookie.com',
  'https://*.google.com',
  'https://*.googleapis.com',
  'https://maps.google.com',
  'https://www.google.com/maps',
  'https://maps.google.com/maps'
];
const mediaSrc = [
  "'self'",
  'https:',
  'https://*.googlevideo.com',
  'https://*.youtube.com'
];

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc, // allow built inline handlers
      scriptSrcAttr, // allow on* attributes from bundled HTML
      styleSrc,
      fontSrc,
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        'https://*.ytimg.com',
        'https://s.ytimg.com',
        'https://*.gstatic.com',
        'https://*.google.com'
      ],
      connectSrc,
      frameSrc,
      mediaSrc,
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  // Disable COEP/COOP so third-party iframes (YouTube/Maps) are not blocked
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// console.log('✅ Security middleware configured with helmet');

// ==============================================
// CORS CONFIGURATION (MUST BE BEFORE RATE LIMITING)
// ==============================================
// CORS must be applied before rate limiters to allow OPTIONS preflight requests

// Allowed origins driven by env, with dev fallbacks
const devOrigins = env.NODE_ENV === 'development'
  ? ['http://localhost:5173', 'http://127.0.0.1:5173']
  : [];

const allowedOrigins = Array.from(new Set([
  env.FRONTEND_URL,
  env.CORS_ORIGIN,
  ...devOrigins,
].filter(Boolean)));

app.use(cors({
  origin: (origin, callback) => {
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
  optionsSuccessStatus: 200, // For compatibility with older browsers
}));

const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

initializeUploadSocketServer(io);

console.log('✅ CORS configured for origins:', allowedOrigins);

// ==============================================
// RATE LIMITING MIDDLEWARE
// ==============================================
// Applied AFTER CORS so preflight OPTIONS requests are never rate limited

const skipRateLimit = env.NODE_ENV === 'development';

// Apply general rate limiter to all requests (but not OPTIONS)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS' || skipRateLimit) {
    return next(); // Skip rate limiting for preflight requests and local dev
  }
  generalLimiter(req, res, next);
});

// Apply auth limiter to auth endpoints (strict limits on login/register)
app.use('/api/auth', (req, res, next) => {
  if (req.method === 'OPTIONS' || skipRateLimit) {
    return next();
  }
  authLimiter(req, res, next);
});

// Apply email verification limiter to email verification endpoints
app.use('/api/auth/verify-email', (req, res, next) => {
  if (req.method === 'OPTIONS' || skipRateLimit) {
    return next();
  }
  emailVerificationLimiter(req, res, next);
});

// Apply password reset limiter to password reset endpoints
app.use('/api/auth/reset-password', (req, res, next) => {
  if (req.method === 'OPTIONS' || skipRateLimit) {
    return next();
  }
  passwordResetLimiter(req, res, next);
});

// Apply upload limiter to upload endpoints
app.use('/api/upload', (req, res, next) => {
  if (req.method === 'OPTIONS' || skipRateLimit) {
    return next();
  }
  uploadLimiter(req, res, next);
});

// Apply strict rate limiter to admin endpoints (but not OPTIONS)
app.use('/api/admin', (req, res, next) => {
  if (req.method === 'OPTIONS' || skipRateLimit) {
    return next(); // Skip rate limiting for preflight requests and local dev
  }
  adminLimiter(req, res, next);
});

console.log('✅ Rate limiting configured:');
console.log('  ✓ Auth limiter: /api/auth');
console.log('  ✓ Email verification limiter: /api/auth/verify-email');
console.log('  ✓ Password reset limiter: /api/auth/reset-password');
console.log('  ✓ Upload limiter: /api/upload');
console.log('  ✓ Admin limiter: /api/admin');

// ==============================================
// REQUEST LOGGING
// ==============================================

app.use((req, res, next) => {
  if (env.isDev) {
    console.log(`📡 ${req.method} ${req.path}`);
  }
  next();
});

// ==============================================
// HEALTH CHECK
// ==============================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', database: 'MongoDB', timestamp: new Date() });
});

// ==============================================
// ROUTES
// ==============================================

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/admin', adminRoutes);

// ==============================================
// PRODUCTION: SERVE FRONTEND BUILD
// ==============================================

if (env.NODE_ENV === 'production') {
  // Serve static files from frontend dist folder
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));

  // Serve React app for any non-API routes (SPA routing)
  app.get(/^(?!\/api).*$/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../frontend', 'dist', 'index.html'));
  });

  console.log('✅ Production mode: Serving frontend build from dist folder');
}

// ==============================================
// ERROR HANDLING
// ==============================================

app.use(notFoundHandler);
app.use(errorHandler);

// ==============================================
// SERVER START
// ==============================================

server.listen(env.PORT, () => {
  console.log(`
✅ Server Running
📡 http://localhost:${env.PORT}
🗄️  Database: MongoDB
🌍 Environment: ${env.NODE_ENV}
🔐 CORS: ${env.FRONTEND_URL}

Ready to receive requests! 🚀
╔═══════════════════════════════════════════════════════════╗
  `);

  // Initialize Cloudflare R2
  (async () => {
    try {
      const { initializeR2 } = await import('./utils/cloudflareR2Helper.js');
      const r2Ready = await initializeR2();
      if (r2Ready) {
        console.log('✅ Cloudflare R2 ready for video uploads');
      } else {
        console.warn('⚠️  Cloudflare R2 not available - check credentials');
      }
    } catch (error) {
      console.error('⚠️  R2 initialization error:', error.message);
    }
  })();

  // Initialize cleanup cron job
  initCleanupCron();

  // Log email service status
  console.log('✅ Email service ready (main load)');
});

// Configure server timeouts for large file uploads
// Set socket timeout to 10 minutes for large files (150MB+)
server.setTimeout(600000); // 10 minutes

// Set keepAliveTimeout to prevent premature connection termination
server.keepAliveTimeout = 65000; // 65 seconds

// Set headersTimeout
server.headersTimeout = 66000; // 66 seconds (must be > keepAliveTimeout)

console.log('✅ Server timeouts configured for large file uploads');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⏹️  Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;
