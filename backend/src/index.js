import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { Server as SocketIOServer } from 'socket.io';

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
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Adjust as needed
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", env.FRONTEND_URL],
      frameSrc: ["'none'"], // Prevent clickjacking
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
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

console.log('✅ Security middleware configured with helmet');

// ==============================================
// CORS CONFIGURATION (MUST BE BEFORE RATE LIMITING)
// ==============================================
// CORS must be applied before rate limiters to allow OPTIONS preflight requests

const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

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

// Apply general rate limiter to all requests (but not OPTIONS)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next(); // Skip rate limiting for preflight requests
  }
  generalLimiter(req, res, next);
});

// Apply strict rate limiter to admin endpoints (but not OPTIONS)
app.use('/api/admin', (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next(); // Skip rate limiting for preflight requests
  }
  adminLimiter(req, res, next);
});

console.log('✅ Rate limiting configured');

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
