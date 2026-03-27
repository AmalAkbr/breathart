import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

// Import config
import env from './utils/envConfig.js';

// Import routes
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import videoRoutes from './routes/videos.js';
import adminRoutes from './routes/admin.js';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/auth.js';

// Import cron job service
import { initCleanupCron } from './services/cropJobService.js';

const app = express();

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
// SECURITY MIDDLEWARE
// ==============================================

app.use(helmet());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

console.log('✅ Security middleware configured');

// ==============================================
// CORS CONFIGURATION
// ==============================================

const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

console.log('✅ CORS configured');

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

const server = app.listen(env.PORT, () => {
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

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⏹️  Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;
