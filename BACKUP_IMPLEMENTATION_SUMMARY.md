# ✅ MongoDB Backup Implementation Complete

## 🎉 What's Been Set Up

Your backend now has **production-ready automated MongoDB backups** to Google Drive.

### Files Created/Modified

#### ✨ New Service
- **`backend/src/services/backupService.js`** — Complete backup service with scheduling, export, upload, and cleanup

#### 🔧 Updated Configuration  
- **`backend/src/config/env.js`** — Added backup environment variables
- **`backend/src/services/index.js`** — Exported backup service
- **`backend/src/index.js`** — Initialized backup scheduler on startup

#### 📚 Documentation
- **`docs/BACKUP_QUICK_START.md`** — 2-minute quick start
- **`docs/BACKUP_SETUP_GUIDE.md`** — Comprehensive setup with rclone details
- **`docs/VPS_BACKUP_DEPLOYMENT.md`** — Step-by-step VPS deployment
- **`docs/BACKUP_ARCHITECTURE.md`** — Technical deep dive
- **`.env.backup.example`** — Environment variables template

---

## 🚀 Quick Start (3 Steps)

### Step 1️⃣: On Your VPS

```bash
# Install rclone
curl https://rclone.org/install.sh | sudo bash

# Set up Google Drive
rclone config
# → Choose: n (new) → gdrive → Google Drive → y (browser auth)
# → Log in with your Google account → Done
```

### Step 2️⃣: Update .env

```env
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
RCLONE_GDRIVE_REMOTE=gdrive
BACKUP_COLLECTIONS=users,exams,videos,exam-participants
BACKUP_RETENTION_DAYS=7
BACKUP_DB_NAME=breathart
```

### Step 3️⃣: Deploy

```bash
# Pull latest code (includes backupService.js)
git pull origin main

# Restart backend
npm start
# OR
docker-compose restart backend
# OR 
pm2 restart breathart-backend
```

**Done!** ✅ Backups will run automatically at 2 AM UTC daily.

---

## 🔍 Verify It's Working

### Check Logs
```bash
# Should see:
# ✅ Backup scheduler started (cron: 0 2 * * *)
```

### Check Google Drive
```bash
rclone ls gdrive:/mongo-backups/
# Should show backup files
```

---

## 📖 How It Works

```
App Startup
    ↓
Backup Scheduler Initialized
    ↓
Waits for scheduled time (default: 2 AM daily)
    ↓
Auto-triggers backup:
    ├─ Export users.json via mongoexport
    ├─ Export exams.json via mongoexport
    ├─ Compress as .gz files
    ├─ Upload to Google Drive via rclone
    └─ Clean local backups older than 7 days
    ↓
Files appear in: Google Drive / mongo-backups / 2024-01-15 / ...
```

---

## ⚙️ Configuration Reference

### Environment Variables

| Variable | Default | Example | Purpose |
|----------|---------|---------|---------|
| `BACKUP_ENABLED` | `false` | `true` | Master on/off |
| `BACKUP_SCHEDULE` | `0 2 * * *` | `0 2 * * *` | When to run (cron) |
| `BACKUP_DB_NAME` | `breathart` | `breathart` | MongoDB DB name |
| `BACKUP_COLLECTIONS` | Built-in | `users,exams` | What to export |
| `BACKUP_RETENTION_DAYS` | `7` | `14` | Keep local X days |
| `RCLONE_GDRIVE_REMOTE` | Required | `gdrive` | rclone remote name |

### Cron Schedules

```
0 2 * * *     → Daily at 2:00 AM UTC
0 */6 * * *   → Every 6 hours (0, 6, 12, 18)
0 0 * * 0     → Weekly Sunday midnight
0 0 1 * *     → Monthly on 1st
30 1 * * *    → Daily 1:30 AM
```

---

## 📁 Backup Structure

### On VPS (temporary)
```
backend/temp/backups/
├── backup-users-2024-01-15_02-00-00.json.gz
├── backup-exams-2024-01-15_02-00-00.json.gz
└── ... (deleted after 7 days)
```

### In Google Drive (permanent)
```
mongo-backups/
├── 2024-01-15/
│   ├── backup-users-*.json.gz
│   ├── backup-exams-*.json.gz
│   ├── backup-videos-*.json.gz
│   └── backup-exam-participants-*.json.gz
├── 2024-01-16/
│   └── ...
```

---

## 🎮 Manual Trigger (Optional)

If you add this endpoint to `backend/src/routes/admin.js`:

```javascript
import { backupService } from '../services/index.js';

router.post('/backup/trigger', adminMiddleware, async (req, res) => {
  const result = await backupService.triggerBackup();
  res.json(result);
});
```

Then trigger from frontend:
```bash
curl -X POST http://localhost:3000/api/admin/backup/trigger \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🔒 Security Notes

1. **rclone config** stores Google Drive token at:
   ```bash
   ~/.config/rclone/rclone.conf
   ```
   Make sure permissions are `600`:
   ```bash
   sudo chmod 600 ~/.config/rclone/rclone.conf
   ```

2. **Google Drive integration** uses OAuth:
   - You authenticate once in your browser
   - rclone stores the token locally on VPS
   - Never hardcoded in .env

3. **Backups are uploaded encrypted** over HTTPS

---

## ❌ Troubleshooting

### "mongoexport not found"
```bash
sudo apt-get install mongodb-org-tools
```

### "rclone not found"
```bash
curl https://rclone.org/install.sh | sudo bash
```

### "Backup scheduler not starting"
```bash
# Check if BACKUP_ENABLED=true in .env
echo $BACKUP_ENABLED

# Check logs
sudo journalctl -u breathart-backend | grep -i backup
```

### "Files not uploading to Google Drive"
```bash
# Re-authenticate
rclone config
# Select 'e' to edit gdrive
# Follow browser auth again
```

---

## 📚 Full Documentation

For more details, see:

- **Quick Start**: `docs/BACKUP_QUICK_START.md`
- **Setup Guide**: `docs/BACKUP_SETUP_GUIDE.md`  
- **VPS Deployment**: `docs/VPS_BACKUP_DEPLOYMENT.md`
- **Architecture**: `docs/BACKUP_ARCHITECTURE.md`
- **Example .env**: `.env.backup.example`

---

## ✨ What's Included

✅ **Automatic scheduling** — Runs on cron schedule  
✅ **Parallel collections** — Exports all collections  
✅ **Compression** — Saves bandwidth (10x typical)  
✅ **Cloud upload** — Direct to Google Drive  
✅ **Error handling** — Continues on individual failures  
✅ **Retention policy** — Auto-cleanup old local files  
✅ **Manual trigger** — Optional admin endpoint  
✅ **Environment-based** — Easy to configure  
✅ **Non-blocking** — Doesn't slow down your app  
✅ **Comprehensive logging** — Full visibility  

---

## 📊 Next Steps

- [ ] SSH to VPS
- [ ] Install rclone
- [ ] Run `rclone config` with Google Drive auth
- [ ] Add env variables to `.env`
- [ ] Pull latest backend code
- [ ] Restart backend service
- [ ] Check logs for "✅ Backup scheduler started"
- [ ] Wait for scheduled time or manually trigger
- [ ] Verify files in Google Drive

---

## 🎯 You're All Set!

Your MongoDB backups are production-ready. They'll:
- 📅 Run automatically on schedule
- 💾 Export as compressed JSON
- ☁️ Upload to Google Drive
- 🗑️ Clean old local files
- 📊 Log everything for monitoring

**Questions?** Check the documentation files or the comments in `backupService.js`.

**Enjoy worry-free backups!** 🚀
