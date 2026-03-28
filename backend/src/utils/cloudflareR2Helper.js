/**
 * Cloudflare R2 Upload Helper
 * Handles video uploads to Cloudflare R2 using AWS SDK (S3 compatible)
 */

import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  ListMultipartUploadsCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import fs from 'fs';
import path from 'path';
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
let multipartCleanupTimer = null;

const MULTIPART_PREFIX = ''; // Empty prefix covers both legacy root keys and videos/ keys
const STALE_MULTIPART_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes
const MULTIPART_CLEANUP_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

try {
  if (validateR2Config()) {
    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      forcePathStyle: true,
      credentials: {
        accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      },
      signatureVersion: 'v4', // Explicit signature version
      // Extended timeouts for large file uploads (150MB+)
      requestTimeout: 300000, // 5 minutes
      connectTimeout: 10000, // 10 seconds
      httpOptions: {
        timeout: 300000, // 5 minutes for socket timeout
      },
      // Disable retries here - we'll handle them manually
      maxAttempts: 1,
    });
    isR2Ready = true;
    console.log('✅ S3Client (R2) initialized successfully with extended timeouts for large uploads');
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
 * List all ongoing multipart uploads for a prefix.
 */
const listAllMultipartUploads = async ({ prefix = MULTIPART_PREFIX } = {}) => {
  const uploads = [];
  let keyMarker;
  let uploadIdMarker;

  while (true) {
    const response = await r2Client.send(
      new ListMultipartUploadsCommand({
        Bucket: env.CLOUDFLARE_R2_BUCKET,
        Prefix: prefix,
        KeyMarker: keyMarker,
        UploadIdMarker: uploadIdMarker,
      }),
    );

    if (Array.isArray(response.Uploads) && response.Uploads.length > 0) {
      uploads.push(...response.Uploads);
    }

    if (!response.IsTruncated) {
      break;
    }

    keyMarker = response.NextKeyMarker;
    uploadIdMarker = response.NextUploadIdMarker;
  }

  return uploads;
};

/**
 * Abort stale multipart uploads left behind by cancelled/crashed sessions.
 */
export const cleanupStaleMultipartUploads = async ({
  maxAgeMs = STALE_MULTIPART_MAX_AGE_MS,
  prefix = MULTIPART_PREFIX,
} = {}) => {
  if (!r2Client || !isR2Ready) {
    return { checked: 0, aborted: 0, stale: 0 };
  }

  try {
    const uploads = await listAllMultipartUploads({ prefix });
    if (uploads.length === 0) {
      return { checked: 0, aborted: 0, stale: 0 };
    }

    const now = Date.now();
    const staleUploads = uploads.filter((upload) => {
      const initiatedAt = new Date(upload.Initiated || 0).getTime();
      if (!initiatedAt || Number.isNaN(initiatedAt)) return true;
      return now - initiatedAt >= maxAgeMs;
    });

    let aborted = 0;
    for (const upload of staleUploads) {
      if (!upload.Key || !upload.UploadId) continue;
      try {
        await r2Client.send(
          new AbortMultipartUploadCommand({
            Bucket: env.CLOUDFLARE_R2_BUCKET,
            Key: upload.Key,
            UploadId: upload.UploadId,
          }),
        );
        aborted += 1;
        console.log(`🧹 Aborted stale multipart upload: ${upload.Key} (${upload.UploadId})`);
      } catch (abortError) {
        console.warn(
          `⚠️  Failed to abort multipart upload ${upload.Key} (${upload.UploadId}):`,
          abortError.message,
        );
      }
    }

    return {
      checked: uploads.length,
      stale: staleUploads.length,
      aborted,
    };
  } catch (error) {
    console.warn('⚠️  Multipart cleanup skipped:', error.message);
    return { checked: 0, aborted: 0, stale: 0 };
  }
};

/**
 * Retry logic for uploads with exponential backoff
 * Handles transient failures for large file uploads
 */
async function uploadWithRetry(uploadParams, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Attempting upload (attempt ${attempt}/${maxRetries})...`);
      const command = new PutObjectCommand(uploadParams);
      const response = await r2Client.send(command);
      console.log(`✅ Upload successful on attempt ${attempt}`);
      return response;
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      
      // Log the error
      console.error(`❌ Upload attempt ${attempt} failed:`, {
        message: error.message,
        code: error.code,
        statusCode: error.$metadata?.httpStatusCode,
        retryable: !isLastAttempt,
      });

      // Don't retry on certain errors (e.g., auth, not found)
      if (error.code === 'NoSuchBucket' || error.code === 'Forbidden' || error.code === 'InvalidAccessKeyId') {
        console.error('🚫 Non-retryable error detected. Aborting.');
        throw error;
      }

      // If it's the last attempt, throw the error
      if (isLastAttempt) {
        throw new Error(`Upload failed after ${maxRetries} attempts: ${error.message}`);
      }

      // Calculate exponential backoff: 2s, 4s, 8s...
      const backoffMs = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Backing off for ${backoffMs}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }
}

/**
 * Export the retry function for external use
 */
export { uploadWithRetry };

/**
 * Build a managed multipart uploader instance (fresh stream per attempt)
 */
const buildMultipartUploader = ({ key, filePath, contentType }) => {
  const bodyStream = fs.createReadStream(filePath, { highWaterMark: 8 * 1024 * 1024 });

  return new Upload({
    client: r2Client,
    params: {
      Bucket: env.CLOUDFLARE_R2_BUCKET,
      Key: key,
      Body: bodyStream,
      ContentType: contentType,
    },
    queueSize: 3, // parallel parts
    partSize: 8 * 1024 * 1024, // 8MB parts to reduce per-connection load
    leavePartsOnError: false,
  });
};

class UploadCancelledError extends Error {
  constructor(message = 'Upload cancelled by user') {
    super(message);
    this.name = 'UploadCancelledError';
    this.code = 'UPLOAD_CANCELLED';
  }
}

const isAbortLikeError = (error) => {
  if (!error) return false;
  const message = String(error.message || '').toLowerCase();
  const name = String(error.name || '').toLowerCase();
  const code = String(error.code || '').toLowerCase();
  return (
    name.includes('abort')
    || code.includes('abort')
    || message.includes('aborted')
    || message.includes('cancelled')
  );
};

/**
 * Upload with retries wrapping multipart uploader (handles ECONNRESET)
 */
const uploadMultipartWithRetry = async ({
  key,
  filePath,
  contentType,
  maxRetries = 3,
  onProgress,
  onUploaderReady,
  isCancelled,
}) => {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (isCancelled?.()) {
        throw new UploadCancelledError();
      }

      console.log(`📤 Multipart upload attempt ${attempt}/${maxRetries} for ${key}`);
      const uploader = buildMultipartUploader({ key, filePath, contentType });
      onUploaderReady?.(uploader);

      uploader.on('httpUploadProgress', (progress) => {
        if (!progress || !progress.loaded) return;
        const pct = progress.total
          ? Math.min(98, Math.round((progress.loaded / progress.total) * 100))
          : undefined;

        if (progress.total) {
          onProgress?.({
            loaded: progress.loaded,
            total: progress.total,
            percent: Math.min(100, Math.round((progress.loaded / progress.total) * 100)),
          });
        }

        if (pct) {
          console.log(`⏫ R2 multipart progress: ${pct}% (${progress.loaded}/${progress.total} bytes)`);
        }
      });

      const response = await uploader.done();
      onUploaderReady?.(null);
      return response;
    } catch (error) {
      onUploaderReady?.(null);
      if (isCancelled?.() || isAbortLikeError(error)) {
        throw new UploadCancelledError();
      }

      lastError = error;
      const isLast = attempt === maxRetries;
      console.error(`❌ Multipart attempt ${attempt} failed:`, {
        message: error.message,
        code: error.code,
        statusCode: error.$metadata?.httpStatusCode,
        retryable: !isLast,
      });

      if (isLast) break;

      const backoffMs = Math.min(15000, Math.pow(2, attempt) * 1000); // 2s,4s,8s, capped 15s
      console.log(`⏳ Backing off for ${backoffMs}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  throw lastError;
};

/**
 * Upload video file to Cloudflare R2 (multipart, streaming)
 * @param {Object} options
 * @param {string} options.filePath - Absolute path to the file on disk
 * @param {Readable} [options.fileStream] - Optional pre-created stream
 * @param {string} options.fileName - Original file name
 * @param {string} options.videoTitle - Video title (used for storing as file name)
 * @param {number} [options.contentLength] - Optional file size in bytes
 * @returns {Promise<Object>} - { url, key, fileSize }
 */
export const uploadVideoToCloudflare = async ({
  filePath,
  fileStream,
  fileName,
  videoTitle,
  contentLength,
  onProgress,
  onUploaderReady,
  isCancelled,
}) => {
  try {
    if (!r2Client || !isR2Ready) {
      throw new Error('R2 client is not initialized. Check your Cloudflare R2 credentials.');
    }

    const resolvedPath = filePath ? path.resolve(filePath) : null;
    const hasStream = Boolean(fileStream);

    if (!hasStream && !resolvedPath) {
      throw new Error('No file stream or path provided for upload');
    }

    // Derive file size for logging
    const fileSizeBytes = contentLength || (resolvedPath ? fs.statSync(resolvedPath).size : undefined);
    if (!fileSizeBytes || fileSizeBytes === 0) {
      throw new Error('File size could not be determined or is zero');
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

    const sizeMB = (fileSizeBytes / 1024 / 1024).toFixed(2);
    console.log(`📤 Uploading video to R2: ${key} (${sizeMB}MB)`);
    console.log(`   Bucket: ${env.CLOUDFLARE_R2_BUCKET}`);

    // Multipart upload with retries (fresh stream per attempt)
    const response = await uploadMultipartWithRetry({
      key,
      filePath: resolvedPath,
      contentType: getContentType(fileName),
      onProgress,
      onUploaderReady,
      isCancelled,
    });

    console.log('✅ R2 Upload Response:', {
      ETag: response.ETag,
      VersionId: response.VersionId || 'N/A',
    });

    // Construct public URL
    const videoUrl = `${env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;

    console.log(`✅ Video uploaded successfully: ${videoUrl}`);

    return {
      url: videoUrl,
      key: key,
      fileSize: fileSizeBytes,
      fileName: key,
    };
  } catch (error) {
    if (error?.code === 'UPLOAD_CANCELLED') {
      throw error;
    }

    const normalizedCode = error.code || error.Code || error.name || 'R2_UPLOAD_ERROR';
    let friendlyMessage = 'Cloud storage upload failed. Please try again.';

    if (normalizedCode === 'ECONNRESET') {
      friendlyMessage = 'Upload connection was interrupted while sending to cloud storage. Please retry.';
    } else if (normalizedCode === 'ENOTFOUND') {
      friendlyMessage = 'Cloud storage endpoint could not be resolved. Please verify network and R2 configuration.';
    } else if (normalizedCode === 'TimeoutError') {
      friendlyMessage = 'Upload timed out while contacting cloud storage. Please retry.';
    }

    console.error('❌ R2 video upload error:', error.message);
    console.error('   Error details:', {
      code: normalizedCode,
      statusCode: error.$metadata?.httpStatusCode,
      message: error.message,
    });

    const wrappedError = new Error(friendlyMessage);
    wrappedError.code = normalizedCode;
    wrappedError.statusCode = error.$metadata?.httpStatusCode || (normalizedCode === 'ECONNRESET' ? 503 : 500);
    wrappedError.details = error.message;
    throw wrappedError;
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

  if (isR2Ready) {
    const summary = await cleanupStaleMultipartUploads();
    console.log(
      `🧹 R2 startup cleanup: aborted ${summary.aborted}/${summary.stale} stale multipart uploads (checked ${summary.checked})`,
    );

    if (!multipartCleanupTimer) {
      multipartCleanupTimer = setInterval(async () => {
        const stats = await cleanupStaleMultipartUploads();
        if (stats.aborted > 0) {
          console.log(
            `🧹 R2 periodic cleanup: aborted ${stats.aborted}/${stats.stale} stale multipart uploads (checked ${stats.checked})`,
          );
        }
      }, MULTIPART_CLEANUP_INTERVAL_MS);

      multipartCleanupTimer.unref?.();
    }
  }

  return isR2Ready;
};

export default {
  uploadVideoToCloudflare,
  testR2Connection,
  cleanupStaleMultipartUploads,
  initializeR2,
};
