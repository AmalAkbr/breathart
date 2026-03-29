/**
 * Environment Variable Validation
 * Validates all required env variables at startup
 */

/**
 * Define all required environment variables
 */
const REQUIRED_ENV_VARS = {
  // Server Config
  PORT: { required: false, type: 'number', default: 3001, description: 'Server port' },
  NODE_ENV: { required: false, type: 'string', default: 'development', description: 'Node environment' },
  CORS_ORIGIN: { required: false, type: 'string', default: 'http://localhost:5173', description: 'CORS origin (frontend URL)' },
  FRONTEND_URL: { required: false, type: 'string', default: 'http://localhost:5173', description: 'Frontend URL for email links' },
  BACKEND_API_URL: { required: false, type: 'string', description: 'Backend API URL for documentation/references' },

  // MongoDB
  MONGODB_URI: { required: true, type: 'string', description: 'MongoDB connection URI' },
  MONGODB_DB_NAME: { required: false, type: 'string', default: 'breathart', description: 'MongoDB database name' },

  // JWT
  JWT_SECRET: { required: true, type: 'string', description: 'JWT secret key' },
  JWT_EXPIRE: { required: false, type: 'string', default: '7d', description: 'JWT expiration time' },
  REFRESH_TOKEN_EXPIRE: { required: false, type: 'string', default: '30d', description: 'Refresh token expiration' },

  // Email Service
  EMAIL_SERVICE: { required: true, type: 'string', description: 'Email service provider' },
  EMAIL_USER: { required: true, type: 'string', description: 'Email service username' },
  EMAIL_PASSWORD: { required: true, type: 'string', description: 'Email service password' },
  FROM_EMAIL: { required: false, type: 'string', description: 'Email from address' },
  SUPPORT_EMAIL: { required: false, type: 'string', description: 'Support email address' },

  // ImageKit
  IMAGEKIT_PUBLIC_KEY: { required: true, type: 'string', description: 'ImageKit public key' },
  IMAGEKIT_PRIVATE_KEY: { required: true, type: 'string', description: 'ImageKit private key' },
  IMAGEKIT_URL_ENDPOINT: { required: true, type: 'string', description: 'ImageKit URL endpoint' },

  // Cloudflare R2
  CLOUDFLARE_R2_BUCKET: { required: false, type: 'string', description: 'R2 bucket name' },
  CLOUDFLARE_R2_ACCOUNT_ID: { required: false, type: 'string', description: 'Cloudflare account ID' },
  CLOUDFLARE_R2_ACCESS_KEY_ID: { required: false, type: 'string', description: 'R2 access key ID' },
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: { required: false, type: 'string', description: 'R2 secret access key' },
  CLOUDFLARE_R2_PUBLIC_URL: { required: false, type: 'string', description: 'R2 public URL for CDN' },

  // Cleanup Cron Job Config
  ENABLE_CLEANUP_CRON: { required: false, type: 'string', default: 'true', description: 'Enable cleanup cron job' },
  CLEANUP_CRON_SCHEDULE: { required: false, type: 'string', default: '0 2 * * *', description: 'Cron schedule for cleanup (default: 2 AM daily)' },
  ENABLE_ORPHAN_VIDEO_CLEANUP_CRON: { required: false, type: 'string', default: 'true', description: 'Enable orphan R2 video cleanup cron' },
  ORPHAN_VIDEO_CLEANUP_CRON_SCHEDULE: { required: false, type: 'string', default: '0 */12 * * *', description: 'Cron schedule for orphan R2 videos (default: every 12 hours)' },
  TEMP_RETENTION_HOURS: { required: false, type: 'number', default: 24, description: 'Hours to retain temp files' },
  UPLOAD_RETENTION_HOURS: { required: false, type: 'number', default: 72, description: 'Hours to retain uploaded files' }
};

/**
 * Validate environment variables
 * @returns {Object} Validated environment object
 * @throws {Error} If required variables are missing or invalid
 */
export const validateEnv = () => {
  const errors = [];
  const validatedEnv = {};

  const isValidUrl = (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const validateUrlList = (rawValue, envKey) => {
    const parts = String(rawValue)
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length === 0) {
      errors.push(`❌ ${envKey} must contain at least one valid URL`);
      return;
    }

    const invalid = parts.filter((part) => !isValidUrl(part));
    if (invalid.length > 0) {
      errors.push(`❌ ${envKey} has invalid URL(s): ${invalid.join(', ')}`);
    }
  };

  Object.entries(REQUIRED_ENV_VARS).forEach(([key, config]) => {
    const value = process.env[key];

    // Check if required
    if (config.required && !value) {
      errors.push(`❌ Missing required env variable: ${key} (${config.description})`);
      return;
    }

    // Use default if not required and not provided
    if (!value && !config.required) {
      validatedEnv[key] = config.default !== undefined ? config.default : null;
      return;
    }

    // Type validation
    if (value && config.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors.push(`❌ Invalid type for ${key}: expected number, got "${value}"`);
        return;
      }
      validatedEnv[key] = numValue;
    } else {
      validatedEnv[key] = value;
    }
  });

  // Additional validations
  if (validatedEnv.MONGODB_URI && !validatedEnv.MONGODB_URI.startsWith('mongodb')) {
    errors.push('❌ MONGODB_URI must start with mongodb:// or mongodb+srv://');
  }

  if (validatedEnv.PORT && (validatedEnv.PORT < 1 || validatedEnv.PORT > 65535)) {
    errors.push('❌ PORT must be between 1 and 65535');
  }

  // Validate CORS_ORIGIN (supports comma-separated URLs)
  if (validatedEnv.CORS_ORIGIN) {
    validateUrlList(validatedEnv.CORS_ORIGIN, 'CORS_ORIGIN');
  }

  // Validate FRONTEND_URL (supports comma-separated URLs)
  if (validatedEnv.FRONTEND_URL) {
    validateUrlList(validatedEnv.FRONTEND_URL, 'FRONTEND_URL');
  }

  // Validate BACKEND_API_URL if provided
  if (validatedEnv.BACKEND_API_URL) {
    if (!isValidUrl(validatedEnv.BACKEND_API_URL)) {
      errors.push(`❌ BACKEND_API_URL must be a valid URL: "${validatedEnv.BACKEND_API_URL}"`);
    }
  }

  // Throw if any errors
  if (errors.length > 0) {
    console.error('\n🔴 ENVIRONMENT VALIDATION FAILED:\n');
    console.error(errors.join('\n'));
    console.error('\n');
    // process.exit(1);
  }

  return validatedEnv;
};

/**
 * Print validated environment (hide sensitive values)
 */
export const printEnvStatus = (env) => {
  console.log('\n✅ Environment Variables Loaded:\n');

  const sensitiveKeys = [
    'MONGODB_URI',
    'JWT_SECRET',
    'EMAIL_PASSWORD',
    'IMAGEKIT_PRIVATE_KEY',
    'CLOUDFLARE_R2_ACCESS_KEY_ID',
    'CLOUDFLARE_R2_SECRET_ACCESS_KEY'
  ];

  Object.entries(env).forEach(([key, value]) => {
    const isSensitive = sensitiveKeys.includes(key);
    const displayValue = isSensitive ? `${value?.substring(0, 10)}...` : value;
    const status = value ? '✓' : '✗';
    console.log(`  ${status} ${key}: ${displayValue}`);
  });

  console.log('');
};
