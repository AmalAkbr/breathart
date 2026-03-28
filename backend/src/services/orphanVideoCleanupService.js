import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { Video } from '../models/Video.js';
import { deleteFromR2 } from './uploadService.js';
import { env, r2Config } from '../utils/envConfig.js';

const videoExtensions = new Set(['mp4', 'webm', 'avi', 'mov', 'mkv', 'm4v']);

const isR2Configured = () => {
  return Boolean(
    r2Config.bucket
    && r2Config.accountId
    && r2Config.accessKeyId
    && r2Config.secretAccessKey,
  );
};

const r2Client = isR2Configured()
  ? new S3Client({
      region: 'auto',
      credentials: {
        accessKeyId: r2Config.accessKeyId,
        secretAccessKey: r2Config.secretAccessKey,
      },
      endpoint: `https://${r2Config.accountId}.r2.cloudflarestorage.com`,
    })
  : null;

const normalizeKey = (key = '') => String(key).replace(/^\/+/, '').trim();

const extractR2KeyFromUrl = (url = '') => {
  if (!url || !r2Config.publicUrl) return '';
  const normalizedUrl = String(url).trim();
  const normalizedPrefix = String(r2Config.publicUrl).replace(/\/$/, '');
  if (!normalizedUrl.startsWith(normalizedPrefix)) return '';
  return normalizeKey(normalizedUrl.substring(normalizedPrefix.length));
};

const isLikelyVideoObject = (key = '') => {
  const normalized = normalizeKey(key).toLowerCase();
  if (!normalized) return false;

  if (normalized.startsWith('videos/')) {
    return true;
  }

  const ext = normalized.split('.').pop();
  return videoExtensions.has(ext);
};

const getDbVideoKeys = async () => {
  const records = await Video.find({}, 'videoKey videoUrl').lean();
  const keySet = new Set();

  for (const record of records) {
    if (record?.videoKey) {
      keySet.add(normalizeKey(record.videoKey));
    }

    if (record?.videoUrl) {
      const keyFromUrl = extractR2KeyFromUrl(record.videoUrl);
      if (keyFromUrl) {
        keySet.add(keyFromUrl);
      }
    }
  }

  return keySet;
};

const listR2VideoKeys = async () => {
  if (!r2Client) {
    return [];
  }

  const keys = [];
  let continuationToken;

  while (true) {
    const response = await r2Client.send(
      new ListObjectsV2Command({
        Bucket: r2Config.bucket,
        ContinuationToken: continuationToken,
      }),
    );

    for (const object of response.Contents || []) {
      const key = normalizeKey(object?.Key || '');
      if (key && isLikelyVideoObject(key)) {
        keys.push(key);
      }
    }

    if (!response.IsTruncated) {
      break;
    }

    continuationToken = response.NextContinuationToken;
  }

  return keys;
};

export const runOrphanVideoCleanup = async () => {
  const now = new Date().toISOString();
  console.log(`\n🧼 [Orphan Video Cleanup] Started at ${now}`);

  if (!isR2Configured()) {
    console.log('⏭️  [Orphan Video Cleanup] Skipped: R2 is not configured');
    return {
      checked: 0,
      dbVideoEntries: 0,
      orphanCount: 0,
      deletedCount: 0,
      failedCount: 0,
      skipped: true,
    };
  }

  try {
    const [dbVideoKeys, r2VideoKeys] = await Promise.all([
      getDbVideoKeys(),
      listR2VideoKeys(),
    ]);

    const orphanKeys = r2VideoKeys.filter((key) => !dbVideoKeys.has(key));

    let deletedCount = 0;
    let failedCount = 0;

    for (const orphanKey of orphanKeys) {
      const deleted = await deleteFromR2(orphanKey);
      if (deleted) {
        deletedCount += 1;
        console.log(`🗑️  [Orphan Video Cleanup] Deleted orphan: ${orphanKey}`);
      } else {
        failedCount += 1;
        console.warn(`⚠️  [Orphan Video Cleanup] Failed to delete: ${orphanKey}`);
      }
    }

    const summary = {
      checked: r2VideoKeys.length,
      dbVideoEntries: dbVideoKeys.size,
      orphanCount: orphanKeys.length,
      deletedCount,
      failedCount,
      skipped: false,
    };

    console.log(
      `✅ [Orphan Video Cleanup] Done. Checked: ${summary.checked}, DB refs: ${summary.dbVideoEntries}, Orphans: ${summary.orphanCount}, Deleted: ${summary.deletedCount}, Failed: ${summary.failedCount}`,
    );

    return summary;
  } catch (error) {
    console.error(`❌ [Orphan Video Cleanup] Error: ${error.message}`);
    return {
      checked: 0,
      dbVideoEntries: 0,
      orphanCount: 0,
      deletedCount: 0,
      failedCount: 1,
      skipped: false,
      error: error.message,
    };
  }
};

export const getOrphanVideoCleanupSchedule = () => {
  return env.ORPHAN_VIDEO_CLEANUP_CRON_SCHEDULE || '0 */12 * * *';
};

export default {
  runOrphanVideoCleanup,
  getOrphanVideoCleanupSchedule,
};
