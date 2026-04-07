// backend/src/services/backupService.js
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import { env } from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execPromise = promisify(exec);

const BACKUP_DIR = path.join(__dirname, '../../temp/backups');
const TIMESTAMP_FORMAT = 'YYYY-MM-DD[T]HH:mm:ss';

/**
 * Ensure backup directory exists
 */
const ensureBackupDir = () => {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
};

/**
 * Generate timestamped filename
 */
const getBackupFilename = (collection) => {
  const timestamp = new Date().toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .split('Z')[0];
  return `backup-${collection}-${timestamp}.json`;
};

/**
 * Export MongoDB collection as JSON via mongoexport
 */
const exportCollection = async (dbUrl, database, collection) => {
  try {
    ensureBackupDir();
    
    const filename = getBackupFilename(collection);
    const filepath = path.join(BACKUP_DIR, filename);

    // Parse MongoDB connection string to extract credentials if needed
    const command = `mongoexport \
      --uri "${dbUrl}" \
      --db ${database} \
      --collection ${collection} \
      --jsonArray \
      --out "${filepath}"`;

    console.log(`📦 Exporting ${database}.${collection}...`);
    await execPromise(command);

    // Compress the file
    const gzipCommand = `gzip -f "${filepath}"`;
    await execPromise(gzipCommand);

    const compressedPath = `${filepath}.gz`;
    const fileStats = fs.statSync(compressedPath);
    console.log(`✅ Exported: ${filename}.gz (${(fileStats.size / 1024 / 1024).toFixed(2)} MB)`);

    return compressedPath;
  } catch (error) {
    console.error(`❌ Export failed for ${collection}:`, error.message);
    throw error;
  }
};

/**
 * Upload backup to Google Drive via rclone
 */
const uploadToGDrive = async (filePath, remotePath) => {
  try {
    if (!env.RCLONE_GDRIVE_REMOTE) {
      throw new Error('RCLONE_GDRIVE_REMOTE not configured');
    }

    const command = `rclone copy "${filePath}" ${env.RCLONE_GDRIVE_REMOTE}:${remotePath}`;
    
    console.log(`☁️  Uploading to Google Drive...`);
    await execPromise(command);

    console.log(`✅ Uploaded to Google Drive: ${remotePath}`);
  } catch (error) {
    console.error(`❌ Upload failed:`, error.message);
    throw error;
  }
};

/**
 * Clean old backups (keep last N days)
 */
const cleanOldBackups = async (daysToKeep = 7) => {
  try {
    ensureBackupDir();

    const now = Date.now();
    const files = fs.readdirSync(BACKUP_DIR);

    for (const file of files) {
      const filepath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filepath);
      const ageInDays = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24);

      if (ageInDays > daysToKeep) {
        fs.unlinkSync(filepath);
        console.log(`🗑️  Deleted old backup: ${file}`);
      }
    }
  } catch (error) {
    console.error(`⚠️  Cleanup failed:`, error.message);
  }
};

/**
 * Perform full backup: export all collections and upload to Google Drive
 */
export const performFullBackup = async () => {
  try {
    if (!env.BACKUP_ENABLED) {
      console.log('📭 Backups disabled - skipping');
      return;
    }

    console.log(`\n🔄 Starting backup routine at ${new Date().toISOString()}`);

    const collectionsToBackup = (env.BACKUP_COLLECTIONS || 'users,exams,videos,exam-participants')
      .split(',')
      .map(c => c.trim());

    const uploads = [];

    // Export all collections
    for (const collection of collectionsToBackup) {
      try {
        const filePath = await exportCollection(
          env.MONGODB_URI,
          env.BACKUP_DB_NAME || 'breathart',
          collection
        );

        // Upload to Google Drive
        if (env.RCLONE_GDRIVE_REMOTE) {
          const remotePath = `mongo-backups/${new Date().toISOString().split('T')[0]}`;
          await uploadToGDrive(filePath, remotePath);
          uploads.push(path.basename(filePath));
        }
      } catch (error) {
        console.error(`Failed to backup collection: ${collection}`);
      }
    }

    // Clean old local backups
    if (env.BACKUP_RETENTION_DAYS) {
      await cleanOldBackups(parseInt(env.BACKUP_RETENTION_DAYS, 10));
    }

    console.log(`✅ Backup complete! Uploaded: ${uploads.join(', ')}\n`);
    return { success: true, uploads };
  } catch (error) {
    console.error('❌ Backup routine failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Schedule automatic backups using cron
 */
export const scheduleBackups = () => {
  if (!env.BACKUP_ENABLED) {
    console.log('📭 Automatic backups disabled');
    return;
  }

  const schedule = env.BACKUP_SCHEDULE || '0 2 * * *'; // Default: 2 AM daily

  try {
    cron.schedule(schedule, async () => {
      console.log(`⏰ Running scheduled backup (cron: ${schedule})`);
      await performFullBackup();
    });

    console.log(`✅ Backup scheduler started (cron: ${schedule})`);
  } catch (error) {
    console.error('❌ Failed to schedule backups:', error.message);
  }
};

/**
 * Trigger backup on-demand (useful for admin endpoints)
 */
export const triggerBackup = async () => {
  console.log('🚀 Backup triggered manually');
  return performFullBackup();
};

export default {
  scheduleBackups,
  performFullBackup,
  triggerBackup,
  exportCollection,
  uploadToGDrive,
  cleanOldBackups,
};
