// backend/src/services/cleanupService.js
/**
 * Cleanup Service
 * Runs scheduled jobs to clean up temporary and old files
 * Triggered by cron every 24 hours as per environment config
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../utils/envConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_DIR = path.join(__dirname, '../../temp');
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

/**
 * Get file age in milliseconds
 */
const getFileAge = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return Date.now() - stats.mtimeMs;
  } catch (error) {
    return 0;
  }
};

/**
 * Convert hours to milliseconds
 */
const hoursToMs = (hours) => hours * 60 * 60 * 1000;

/**
 * Clean up temp directory
 * Removes files older than TEMP_RETENTION_HOURS (default: 24 hours)
 */
export const cleanupTempDir = () => {
  const retentionHours = parseInt(env.TEMP_RETENTION_HOURS || '24', 10);
  const retentionMs = hoursToMs(retentionHours);

  try {
    if (!fs.existsSync(TEMP_DIR)) {
      console.log(`⚠️  Temp directory not found: ${TEMP_DIR}`);
      return { cleaned: 0, failed: 0, totalSize: 0 };
    }

    const files = fs.readdirSync(TEMP_DIR);
    let cleaned = 0;
    let failed = 0;
    let totalSize = 0;

    files.forEach((file) => {
      const filePath = path.join(TEMP_DIR, file);
      const fileAge = getFileAge(filePath);

      if (fileAge > retentionMs) {
        try {
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
          fs.unlinkSync(filePath);
          cleaned++;
          console.log(`🗑️  Removed temp file: ${file} (age: ${(fileAge / 1000 / 60 / 60).toFixed(1)}h)`);
        } catch (error) {
          failed++;
          console.error(`❌ Failed to remove: ${file} - ${error.message}`);
        }
      }
    });

    return {
      cleaned,
      failed,
      totalSize,
      directory: TEMP_DIR,
      retentionHours
    };
  } catch (error) {
    console.error(`❌ Cleanup temp directory error: ${error.message}`);
    return { cleaned: 0, failed: 0, totalSize: 0, error: error.message };
  }
};

/**
 * Clean up upload directory
 * Removes files older than UPLOAD_RETENTION_HOURS (default: 72 hours / 3 days)
 */
export const cleanupUploadDir = () => {
  const retentionHours = parseInt(env.UPLOAD_RETENTION_HOURS || '72', 10);
  const retentionMs = hoursToMs(retentionHours);

  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      console.log(`⚠️  Upload directory not found: ${UPLOAD_DIR}`);
      return { cleaned: 0, failed: 0, totalSize: 0 };
    }

    const files = fs.readdirSync(UPLOAD_DIR);
    let cleaned = 0;
    let failed = 0;
    let totalSize = 0;

    files.forEach((file) => {
      const filePath = path.join(UPLOAD_DIR, file);
      const fileAge = getFileAge(filePath);

      if (fileAge > retentionMs) {
        try {
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
          fs.unlinkSync(filePath);
          cleaned++;
          console.log(`🗑️  Removed upload file: ${file} (age: ${(fileAge / 1000 / 60 / 60).toFixed(1)}h)`);
        } catch (error) {
          failed++;
          console.error(`❌ Failed to remove: ${file} - ${error.message}`);
        }
      }
    });

    return {
      cleaned,
      failed,
      totalSize,
      directory: UPLOAD_DIR,
      retentionHours
    };
  } catch (error) {
    console.error(`❌ Cleanup upload directory error: ${error.message}`);
    return { cleaned: 0, failed: 0, totalSize: 0, error: error.message };
  }
};

/**
 * Run complete cleanup (both temp and upload folders)
 * Called by cron job every 24 hours
 */
export const runCleanup = async () => {
  console.log(`
╔════════════════════════════════════════════╗
║  🧹 Starting Cleanup Job (${new Date().toISOString()})
╚════════════════════════════════════════════╝
  `);

  const tempResult = cleanupTempDir();
  const uploadResult = cleanupUploadDir();

  const summary = {
    timestamp: new Date().toISOString(),
    temp: tempResult,
    upload: uploadResult,
    totalCleaned: (tempResult.cleaned || 0) + (uploadResult.cleaned || 0),
    totalFailed: (tempResult.failed || 0) + (uploadResult.failed || 0),
    totalSizeFreed: ((tempResult.totalSize || 0) + (uploadResult.totalSize || 0)) / 1024 / 1024 // MB
  };

  console.log(`
╔════════════════════════════════════════════╗
║  ✅ Cleanup Job Complete
║  📊 Temp files cleaned: ${tempResult.cleaned}
║  📊 Upload files cleaned: ${uploadResult.cleaned}
║  💾 Total space freed: ${summary.totalSizeFreed.toFixed(2)}MB
╚════════════════════════════════════════════╝
  `);

  return summary;
};

/**
 * Get directory stats
 */
export const getDirStats = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      return { exists: false, files: 0, size: 0 };
    }

    const files = fs.readdirSync(dirPath);
    let totalSize = 0;

    files.forEach((file) => {
      try {
        const stats = fs.statSync(path.join(dirPath, file));
        totalSize += stats.size;
      } catch (error) {
        // Skip files that can't be read
      }
    });

    return {
      exists: true,
      files: files.length,
      size: totalSize,
      sizeInMB: (totalSize / 1024 / 1024).toFixed(2)
    };
  } catch (error) {
    return { exists: false, error: error.message };
  }
};

export default {
  cleanupTempDir,
  cleanupUploadDir,
  runCleanup,
  getDirStats
};
