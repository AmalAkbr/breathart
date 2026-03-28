// backend/src/services/cropJobService.js
/**
 * Cron Job Service
 * Schedules cleanup jobs to run at specified intervals
 * Uses node-cron to run jobs without external dependencies
 */

import cron from 'node-cron';
import { env } from '../utils/envConfig.js';
import { runCleanup } from './cleanupService.js';
import { getOrphanVideoCleanupSchedule, runOrphanVideoCleanup } from './orphanVideoCleanupService.js';

let scheduledJob = null;
let orphanVideoScheduledJob = null;

/**
 * Parse cron schedule from environment or use default
 * Default: Every 24 hours at 2 AM
 * Format: "0 2 * * *" (minute hour day-of-month month day-of-week)
 */
const getCronSchedule = () => {
  const schedule = env.CLEANUP_CRON_SCHEDULE || '0 2 * * *';
  console.log(`⏰ Cleanup cron schedule: ${schedule}`);
  return schedule;
};

/**
 * Initialize cron job for cleanup
 */
export const initCleanupCron = () => {
  if (scheduledJob) {
    console.log('⚠️  Cron job already scheduled');
    return scheduledJob;
  }

  if (!env.ENABLE_CLEANUP_CRON || env.ENABLE_CLEANUP_CRON === 'false') {
    console.log('⏭️  Cleanup cron is disabled (ENABLE_CLEANUP_CRON=false)');
    return null;
  }

  try {
    const schedule = getCronSchedule();

    // Validate cron expression
    if (!cron.validate(schedule)) {
      throw new Error(`Invalid cron expression: ${schedule}`);
    }

    // Schedule the job
    scheduledJob = cron.schedule(schedule, async () => {
      console.log(`\n🕐 [Cron Job Triggered] Running cleanup at ${new Date().toISOString()}`);
      try {
        await runCleanup();
      } catch (error) {
        console.error(`❌ Cron job error: ${error.message}`);
      }
    });

    console.log(`
╔════════════════════════════════════════════╗
║  ✅ Cleanup Cron Job Initialized
║  📅 Schedule: ${schedule}
║  🕐 Next run: ${getNextRunTime(schedule)}
╚════════════════════════════════════════════╝
    `);

    // Configure orphan video cleanup job (every 12h by default)
    const orphanCleanupEnabled = env.ENABLE_ORPHAN_VIDEO_CLEANUP_CRON !== 'false';
    if (orphanCleanupEnabled) {
      const orphanSchedule = getOrphanVideoCleanupSchedule();

      if (!cron.validate(orphanSchedule)) {
        console.error(`❌ Invalid orphan video cleanup cron expression: ${orphanSchedule}`);
      } else {
        orphanVideoScheduledJob = cron.schedule(orphanSchedule, async () => {
          console.log(`\n🕐 [Cron Job Triggered] Running orphan video cleanup at ${new Date().toISOString()}`);
          await runOrphanVideoCleanup();
        });

        console.log(`
╔════════════════════════════════════════════╗
║  ✅ Orphan Video Cleanup Cron Initialized
║  📅 Schedule: ${orphanSchedule}
║  🕐 Next run: ${getNextRunTime(orphanSchedule)}
╚════════════════════════════════════════════╝
        `);

        // Run one startup sync so existing orphan videos are cleaned immediately.
        runOrphanVideoCleanup().catch((error) => {
          console.error(`❌ Startup orphan video cleanup error: ${error.message}`);
        });
      }
    } else {
      console.log('⏭️  Orphan video cleanup cron is disabled (ENABLE_ORPHAN_VIDEO_CLEANUP_CRON=false)');
    }

    return scheduledJob;
  } catch (error) {
    console.error(`❌ Failed to initialize cron job: ${error.message}`);
    return null;
  }
};

/**
 * Calculate next run time for cron job (approximate)
 */
const getNextRunTime = (cronExpression) => {
  try {
    // Simple parsing for "0 2 * * *" format
    const parts = cronExpression.split(' ');
    if (parts.length === 5 && parts[1] !== '*') {
      const hour = parseInt(parts[1], 10);
      const now = new Date();
      const next = new Date();
      next.setHours(hour, 0, 0, 0);

      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }

      return next.toISOString();
    }
    return 'Next run time varies by expression';
  } catch {
    return 'Unable to calculate next run time';
  }
};

/**
 * Stop the scheduled cron job
 */
export const stopCleanupCron = () => {
  if (scheduledJob) {
    scheduledJob.stop();
    scheduledJob = null;
    console.log('⏹️  Cleanup cron job stopped');
  }

  if (orphanVideoScheduledJob) {
    orphanVideoScheduledJob.stop();
    orphanVideoScheduledJob = null;
    console.log('⏹️  Orphan video cleanup cron job stopped');
  }
};

/**
 * Get current cron job status
 */
export const getCleanupCronStatus = () => {
  return {
    running: scheduledJob ? !scheduledJob.stopped : false,
    schedule: getCronSchedule(),
    enabled: env.ENABLE_CLEANUP_CRON !== 'false',
    orphanVideoCleanupRunning: orphanVideoScheduledJob ? !orphanVideoScheduledJob.stopped : false,
    orphanVideoCleanupSchedule: getOrphanVideoCleanupSchedule(),
    orphanVideoCleanupEnabled: env.ENABLE_ORPHAN_VIDEO_CLEANUP_CRON !== 'false',
    tempRetentionHours: env.TEMP_RETENTION_HOURS || '24',
    uploadRetentionHours: env.UPLOAD_RETENTION_HOURS || '72'
  };
};

export default {
  initCleanupCron,
  stopCleanupCron,
  getCleanupCronStatus
};
