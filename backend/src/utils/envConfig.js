/**
 * Environment Configuration
 * Centralized access to validated environment variables
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateEnv, printEnvStatus } from './validateEnv.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root (one level up from src, two up from utils)
const envPath = path.join(__dirname, '../../.env');
console.log(`📋 Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

// Validate and load env vars
const env = validateEnv();
printEnvStatus(env);

// Export env directly for convenience
export { env };

// Export organized config objects
export const serverConfig = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  corsOrigin: env.CORS_ORIGIN,
  frontendUrl: env.FRONTEND_URL,
  backendApiUrl: env.BACKEND_API_URL || `http://localhost:${env.PORT}/api`,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isDev: env.NODE_ENV === 'development'
};

export const mongoConfig = {
  uri: env.MONGODB_URI,
  dbName: env.MONGODB_DB_NAME || 'breathart'
};

export const jwtConfig = {
  secret: env.JWT_SECRET,
  expireIn: env.JWT_EXPIRE || '7d',
  refreshExpireIn: env.REFRESH_TOKEN_EXPIRE || '30d'
};

export const r2Config = {
  bucket: env.CLOUDFLARE_R2_BUCKET,
  accountId: env.CLOUDFLARE_R2_ACCOUNT_ID,
  accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
  secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  publicUrl: env.CLOUDFLARE_R2_PUBLIC_URL || `https://${env.CLOUDFLARE_R2_BUCKET}.r2.dev`
};

export const emailConfig = {
  service: env.EMAIL_SERVICE,
  user: env.EMAIL_USER,
  password: env.EMAIL_PASSWORD,
  from: env.EMAIL_FROM || env.EMAIL_USER,
  supportEmail: env.SUPPORT_EMAIL
};

export const imagekitConfig = {
  publicKey: env.IMAGEKIT_PUBLIC_KEY,
  privateKey: env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: env.IMAGEKIT_URL_ENDPOINT
};

export const frontendConfig = {
  url: env.FRONTEND_URL || 'http://localhost:5174'
};

export const cronConfig = {
  enabled: env.ENABLE_CLEANUP_CRON !== 'false',
  schedule: env.CLEANUP_CRON_SCHEDULE || '0 2 * * *',
  tempRetentionHours: parseInt(env.TEMP_RETENTION_HOURS || '24', 10),
  uploadRetentionHours: parseInt(env.UPLOAD_RETENTION_HOURS || '72', 10)
};

// Default export - the validated env object for direct property access
export default env;
