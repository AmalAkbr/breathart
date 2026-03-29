import cors from 'cors';
import helmet from 'helmet';
import { corsConfig, getAllowedOrigins } from './cors.js';

export const configureSecurityMiddleware = (app, env) => {
  const allowedOrigins = getAllowedOrigins();

  // ==============================================
  // SECURITY MIDDLEWARE - HELMET CONFIGURATION
  // ==============================================

  // Enhanced helmet with strict CSP and security headers
  // CSP allows Google Fonts, YouTube (embed), Google Maps, and the configured frontend origin
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    'blob:',
    'data:',
    'https://*.youtube.com',
    'https://*.youtube-nocookie.com',
    'https://*.ytimg.com',
    'https://s.ytimg.com',
    'https://*.gstatic.com',
    'https://*.googleapis.com',
    'https://*.google.com'
  ];
  const scriptSrcAttr = ["'self'", "'unsafe-inline'"];
  const styleSrc = ["'self'", "'unsafe-inline'", 'blob:', 'data:', 'https://fonts.googleapis.com'];
  const fontSrc = ["'self'", 'data:', 'https://fonts.gstatic.com'];
  const connectSrc = [
    "'self'",
    'blob:',
    'data:',
    ...allowedOrigins,
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
    'blob:',
    'data:',
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
          'data:',
          'https:',
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
    crossOriginResourcePolicy: { policy: 'cross-origin' },
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

  // ==============================================
  // CORS CONFIGURATION (MUST BE BEFORE RATE LIMITING)
  // ==============================================

  console.log('Allowed Origins:', allowedOrigins);
  app.use(cors(corsConfig));

  return { allowedOrigins };
};
