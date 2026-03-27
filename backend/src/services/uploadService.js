// backend/src/services/uploadService.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2Config } from '../utils/envConfig.js';

// Cloudflare R2 Client Setup
const s3Client = new S3Client({
  region: 'auto',
  credentials: {
    accessKeyId: r2Config.accessKeyId,
    secretAccessKey: r2Config.secretAccessKey
  },
  endpoint: `https://${r2Config.accountId}.r2.cloudflarestorage.com`
});

/**
 * Upload thumbnail to Cloudflare R2
 * Note: If using ImageKit, replace implementation accordingly
 */
export const uploadThumbnail = async (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  const fileName = `thumbnails/${Date.now()}-${file.originalname}`;

  // Upload to Cloudflare R2
  const command = new PutObjectCommand({
    Bucket: r2Config.bucket,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  // Construct public URL
  const publicUrl = `${r2Config.publicUrl}/${fileName}`;

  return {
    url: publicUrl,
    path: fileName
  };
};

/**
 * Delete an object from Cloudflare R2
 * @param {string} key - Object key inside the bucket (e.g., videos/123-file.mp4)
 */
export const deleteFromR2 = async (key) => {
  if (!key) {
    console.warn('⚠️  No R2 key provided for deletion');
    return false;
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: r2Config.bucket,
      Key: key,
    });

    await s3Client.send(command);
    console.log(`🗑️  Deleted R2 object: ${key}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to delete R2 object:', error.message);
    return false;
  }
};

/**
 * Upload video to Cloudflare R2
 */
export const uploadVideo = async (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  const fileName = `videos/${Date.now()}-${file.originalname}`;

  // Upload to Cloudflare R2
  const command = new PutObjectCommand({
    Bucket: r2Config.bucket,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  // Construct public URL
  const publicUrl = `${r2Config.publicUrl}/${fileName}`;

  return {
    url: publicUrl,
    fileName: fileName,
    size: file.size,
  };
};

export default {
  uploadThumbnail,
  uploadVideo,
};
