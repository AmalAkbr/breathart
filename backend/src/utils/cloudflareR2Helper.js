/**
 * Cloudflare R2 Upload Helper
 * Handles video uploads to Cloudflare R2 using AWS SDK (S3 compatible)
 */

import { S3Client, PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { env } from './envConfig.js';

// Validate R2 configuration
const validateR2Config = () => {
  const errors = [];
  
  if (!env.CLOUDFLARE_R2_BUCKET) errors.push('CLOUDFLARE_R2_BUCKET');
  if (!env.CLOUDFLARE_R2_ACCOUNT_ID) errors.push('CLOUDFLARE_R2_ACCOUNT_ID');
  if (!env.CLOUDFLARE_R2_ACCESS_KEY_ID) errors.push('CLOUDFLARE_R2_ACCESS_KEY_ID');
  if (!env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) errors.push('CLOUDFLARE_R2_SECRET_ACCESS_KEY');
  if (!env.CLOUDFLARE_R2_PUBLIC_URL) errors.push('CLOUDFLARE_R2_PUBLIC_URL');

  if (errors.length > 0) {
    console.warn(`⚠️  Missing R2 configuration: ${errors.join(', ')}`);
    return false;
  }

  console.log(`✅ R2 Configuration:
    Bucket: ${env.CLOUDFLARE_R2_BUCKET}
    Account ID: ${env.CLOUDFLARE_R2_ACCOUNT_ID.substring(0, 8)}...
    Endpoint: https://${env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com
    Public URL: ${env.CLOUDFLARE_R2_PUBLIC_URL}`);

  return true;
};

// Initialize R2 client (S3 compatible)
let r2Client = null;
let isR2Ready = false;

try {
  if (validateR2Config()) {
    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      },
      signatureVersion: 'v4', // Explicit signature version
    });
    isR2Ready = true;
    console.log('✅ S3Client (R2) initialized successfully');
  }
} catch (error) {
  console.error('❌ Failed to initialize R2 client:', error.message);
  isR2Ready = false;
}

/**
 * Test R2 connectivity
 * @returns {Promise<boolean>}
 */
export const testR2Connection = async () => {
  try {
    if (!r2Client) {
      console.warn('⚠️  R2 client not initialized');
      return false;
    }

    console.log('🔍 Testing R2 connection...');

    const command = new HeadBucketCommand({
      Bucket: env.CLOUDFLARE_R2_BUCKET,
    });

    await r2Client.send(command);
    console.log('✅ R2 bucket connection successful');
    return true;
  } catch (error) {
    console.error('❌ R2 connection failed:', error.message);
    return false;
  }
};

/**
 * Upload video file to Cloudflare R2
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} fileName - Original file name
 * @param {string} videoTitle - Video title (used for storing as file name)
 * @returns {Promise<Object>} - { url, key, fileSize }
 */
export const uploadVideoToCloudflare = async (fileBuffer, fileName, videoTitle) => {
  try {
    if (!r2Client || !isR2Ready) {
      throw new Error('R2 client is not initialized. Check your Cloudflare R2 credentials.');
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error('File buffer is empty');
    }

    // Create safe filename from video title
    const sanitizedTitle = videoTitle
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .toLowerCase()
      .substring(0, 100); // max 100 chars

    // Add timestamp to avoid collisions
    const timestamp = Date.now();
    const extension = getFileExtension(fileName);
    const key = `videos/${sanitizedTitle}_${timestamp}${extension}`;

    console.log(`📤 Uploading video to R2: ${key} (${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB)`);
    console.log(`   Bucket: ${env.CLOUDFLARE_R2_BUCKET}`);

    const command = new PutObjectCommand({
      Bucket: env.CLOUDFLARE_R2_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: getContentType(fileName),
    });

    const response = await r2Client.send(command);

    console.log(`✅ R2 Upload Response:`, {
      ETag: response.ETag,
      VersionId: response.VersionId || 'N/A',
    });

    // Construct public URL
    const videoUrl = `${env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;

    console.log(`✅ Video uploaded successfully: ${videoUrl}`);

    return {
      url: videoUrl,
      key: key,
      fileSize: fileBuffer.length,
      fileName: key,
    };
  } catch (error) {
    console.error('❌ R2 video upload error:', error.message);
    console.error('   Error details:', {
      code: error.Code,
      statusCode: error.$metadata?.httpStatusCode,
      message: error.message,
    });
    throw new Error(`Failed to upload video to Cloudflare R2: ${error.message}`);
  }
};


/**
 * Get file extension from filename
 */
function getFileExtension(fileName) {
  const ext = fileName.split('.').pop();
  return ext ? `.${ext}` : '.mp4';
}

/**
 * Get content type based on file extension
 */
function getContentType(fileName) {
  const ext = fileName.toLowerCase().split('.').pop();
  const contentTypes = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
    mkv: 'video/x-matroska',
    m4v: 'video/x-m4v',
  };
  return contentTypes[ext] || 'video/mp4';
}

/**
 * Initialize R2 connection on startup
 * Used by server initialization
 */
export const initializeR2 = async () => {
  if (!isR2Ready) {
    console.warn('⚠️  R2 not ready. Attempting to initialize...');
    const connected = await testR2Connection();
    if (connected) {
      isR2Ready = true;
    }
  }
  return isR2Ready;
};

export default {
  uploadVideoToCloudflare,
  testR2Connection,
  initializeR2,
};
