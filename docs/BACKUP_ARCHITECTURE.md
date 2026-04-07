# Backup System Architecture

## 📐 Overview

The backup system uses:
- **Node.js `child_process`** to shell out to `mongoexport` and `gzip`
- **node-cron** for scheduling (already in your package.json)
- **rclone** for cloud uploads (external tool)
- **Environment variables** for configuration

```
┌─────────────────────────────────────────────┐
│  Backend Startup (index.js)                 │
├─────────────────────────────────────────────┤
│  1. MongoDB connects                        │
│  2. Express middleware initialized          │
│  3. Routes loaded                           │
│  4. Cleanup cron started                    │
│  5. Backup scheduler started ← NEW          │
│     └─ Watches for cron time                │
│     └─ On trigger: runs backup routine      │
└─────────────────────────────────────────────┘
         │
         └──> Every day at 2 AM (configurable)
                    │
         ┌──────────┴──────────┐
         ▼                       ▼
    ┌─────────┐           ┌──────────┐
    │mongoexport    │           │  gzip     │
    │ (export)      │           │ (compress)│
    └────┬────┘           └───┬─────┘
         │                     │
         └──────────┬──────────┘
                    │
              ┌─────▼─────┐
              │ rclone    │
              │ (upload)  │
              └─────┬─────┘
                    │
              Google Drive
              /mongo-backups/
```

---

## 🔄 Backup Flow

### 1. Scheduler Initialization (on app startup)

```
backupService.scheduleBackups()
    │
    ├─ Read BACKUP_ENABLED from env
    │    │
    │    ├─ If false: skip (disabled)
    │    └─ If true: proceed
    │
    ├─ Read BACKUP_SCHEDULE from env (cron format)
    │    └ Default: "0 2 * * *" (daily 2 AM)
    │
    └─ Set up cron job with node-cron
         └─ Watch for next scheduled time
```

### 2. Backup Execution (at scheduled time)

```
performFullBackup()
    │
    ├─ Ensure backup directory exists (temp/backups/)
    │
    ├─ For each collection in BACKUP_COLLECTIONS:
    │    │
    │    ├─ exportCollection(collection)
    │    │    │
    │    │    ├─ Run: mongoexport --uri ... --collection ...
    │    │    │        └─ Creates: backup-users-2024-01-15_02-00-00.json
    │    │    │
    │    │    ├─ Run: gzip backup-users-2024-01-15_02-00-00.json
    │    │    │        └─ Creates: backup-users-2024-01-15_02-00-00.json.gz
    │    │    │        └─ Deletes: backup-users-2024-01-15_02-00-00.json
    │    │    │
    │    │    └─ Return filepath
    │    │
    │    └─ uploadToGDrive(filepath)
    │         │
    │         ├─ Check RCLONE_GDRIVE_REMOTE configured
    │         │
    │         └─ Run: rclone copy file.json.gz gdrive:/mongo-backups/...
    │              └─ Uploads to Google Drive
    │
    ├─ cleanOldBackups()
    │    │
    │    ├─ Read BACKUP_RETENTION_DAYS (default: 7)
    │    │
    │    └─ Delete .gz files older than 7 days from temp/backups/
    │
    └─ Log success/failure
```

---

## 📁 File Locations

### On VPS (local filesystem)

```
/path/to/backend/
├── temp/
│   └── backups/
│       ├── backup-users-2024-01-15_02-00-00.json.gz  (deleted after 7 days)
│       ├── backup-exams-2024-01-15_02-00-00.json.gz
│       ├── backup-videos-2024-01-15_02-00-00.json.gz
│       └── backup-exam-participants-2024-01-15_02-00-00.json.gz
```

### In Google Drive

```
My Drive / mongo-backups/
├── 2024-01-15/
│   ├── backup-users-2024-01-15_02-00-00.json.gz
│   ├── backup-exams-2024-01-15_02-00-00.json.gz
│   ├── backup-videos-2024-01-15_02-00-00.json.gz
│   └── backup-exam-participants-2024-01-15_02-00-00.json.gz
├── 2024-01-16/
│   └── (next day's backups)
```

### rclone config

```
$HOME/.config/rclone/rclone.conf
├─ [gdrive]
   ├─ type = drive
   ├─ token = {...}  ← OAuth token from Google
   └─ ...
```

---

## 🌳 Service Implementation

### File: `backend/src/services/backupService.js`

**Exports:**
- `scheduleBackups()` — Initialize cron scheduler at startup
- `performFullBackup()` — Execute full backup routine
- `triggerBackup()` — Manually trigger (for admin endpoints)
- `exportCollection()` — Export single collection
- `uploadToGDrive()` — Upload file via rclone
- `cleanOldBackups()` — Delete old local backups

**Error Handling:**
- Individual collections fail independently
- If one collection export fails, others continue
- Uploads are attempted even if some exports fail
- Errors logged but don't crash the app

**Async/Await:**
- All operations are non-blocking
- Express app continues serving requests during backup
- Backups tagged with "node-cron" internally by node-cron

---

## 🛠️ Configuration

### Environment Variables

```env
BACKUP_ENABLED=true|false          # Master switch
BACKUP_SCHEDULE="0 2 * * *"        # Cron expression
BACKUP_DB_NAME="breathart"         # MongoDB database name
BACKUP_COLLECTIONS="users,..."     # Comma-separated collection names
BACKUP_RETENTION_DAYS=7            # Days to keep local backups
RCLONE_GDRIVE_REMOTE="gdrive"      # rclone remote name
```

### Cron Format (UNIX cron)

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
│ │ │ │ │
0 2 * * *     ← Run at 2:00 AM every day
0 */6 * * *   ← Run every 6 hours (0, 6, 12, 18)
30 2 1 * *    ← Run at 2:30 AM on 1st of month
0 0 * * 1     ← Run at midnight every Monday
```

---

## 📊 Command Examples

### mongoexport creates JSON

```bash
mongoexport \
  --uri "mongodb+srv://user:pass@cluster.mongodb.net/breathart" \
  --db breathart \
  --collection users \
  --jsonArray \
  --out backup-users.json

# Output: backup-users.json (raw)
# Size: ~50 MB for 100k users
```

### gzip compresses

```bash
gzip -f backup-users.json

# Creates: backup-users.json.gz
# Deletes: backup-users.json (original)
# Size: ~5 MB (10x compression typical)
```

### rclone uploads

```bash
rclone copy backup-users.json.gz gdrive:/mongo-backups/2024-01-15/

# Uploads to Google Drive
# Respects rclone config at ~/.config/rclone/rclone.conf
```

---

## 🔌 Admin Endpoint (Optional)

If implemented in `backend/src/routes/admin.js`:

```javascript
router.post('/backup/trigger', adminMiddleware, async (req, res) => {
  try {
    const result = await backupService.triggerBackup();
    res.json({
      success: true,
      message: 'Backup completed',
      uploads: result.uploads  // Array of uploaded filenames
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

**Usage:**
```bash
curl -X POST http://localhost:3000/api/admin/backup/trigger \
  -H "Authorization: Bearer TOKEN"
```

---

## 🚨 Error Scenarios

| Scenario | Behavior |
|----------|----------|
| BACKUP_ENABLED=false | Scheduler logs "📭 Backups disabled" and exits |
| mongoexport fails | Logs error, continues to next collection |
| gzip fails | Logs error, skips upload for that file |
| rclone not installed | child_process throws error, logged |
| rclone token expired | Upload fails, logged (re-auth needed) |
| Disk full | gzip fails, logged |
| Google Drive quota exceeded | rclone fails, logged |
| Large collection (>1GB) | Takes longer, but completes (async) |

---

## 📈 Performance

### Typical Timing

```
Small DB (100K docs):
  ├─ mongoexport: ~5 seconds
  ├─ gzip: ~1 second
  ├─ rclone upload: ~10 seconds
  └─ Total: ~15 seconds per collection × 4 = 1 minute

Large DB (1M docs):
  ├─ mongoexport: ~30 seconds
  ├─ gzip: ~5 seconds
  ├─ rclone upload: ~30 seconds
  └─ Total: ~3-5 minutes per collection
```

### Resource Usage

- CPU: Moderate (during compression)
- Memory: Low (~50 MB)
- Network: Depends on connection
- Disk: Temporary (cleaned after 7 days)

---

## 🔐 Security Considerations

1. **Credentials:** rclone config file has sensitive token
   - Location: `~/.config/rclone/rclone.conf`
   - Permissions: Should be `600` (read-only)
   - Backup this file if moving servers

2. **Network:** Uploads go over HTTPS (rclone default)

3. **Storage:** Google Drive encryption at rest

4. **Access:** Anyone with backend access can trigger backups
   - Use middleware to restrict to admins

5. **Restore:** No automatic restore — manual process needed
   - Download from Google Drive
   - Decompress: `gunzip backup-users.json.gz`
   - Import: `mongoimport --db breathart --collection users backup-users.json`

---

## 🧪 Testing

### Test Export Locally

```bash
# On VPS, manually run mongoexport
mongoexport \
  --uri "$MONGODB_URI" \
  --db breathart \
  --collection users \
  --jsonArray \
  --out test.json

# Check size
ls -lh test.json

# Test gzip
gzip -f test.json
ls -lh test.json.gz
```

### Test rclone Upload

```bash
# Touch a test file
echo "test" > test.txt

# Upload to Google Drive
rclone copy test.txt gdrive:/mongo-backups/test.txt

# Verify
rclone ls gdrive:/mongo-backups/
```

### Test Full Backup (Manual Trigger)

```bash
# In Node REPL or as curl request
import { backupService } from './services/index.js';
const result = await backupService.performFullBackup();
console.log(result);
```

---

## 🔄 Restoration Process

When you need to restore from backup:

```bash
# 1. Download from Google Drive
rclone copy gdrive:/mongo-backups/2024-01-15/backup-users.json.gz .

# 2. Decompress
gunzip backup-users.json.gz

# 3. Import to MongoDB
mongoimport \
  --uri "mongodb+srv://user:pass@cluster.mongodb.net/breathart" \
  --db breathart \
  --collection users \
  --jsonArray \
  --file backup-users.json
```

---

## 📚 Related Files

- `backend/src/services/backupService.js` — Main service
- `backend/src/config/env.js` — Configuration variables  
- `backend/src/index.js` — Initialization
- `docs/BACKUP_SETUP_GUIDE.md` — Full setup guide
- `docs/VPS_BACKUP_DEPLOYMENT.md` — Deployment instructions
- `.env.backup.example` — Environment template

---

## 🎯 Future Enhancements

1. **Incremental backups** — Only export changed docs
2. **Differential snapshots** — Track delta from last backup
3. **Compression options** — .tar.gz, .zip, etc.
4. **Custom filter** — Backup only recent documents
5. **Parallel exports** — Multiple collections simultaneously
6. **Metrics/monitoring** — Backup duration, size trends
7. **Retention policies** — Auto-delete older backups from cloud
8. **Restore automation** — One-click restore from admin UI
