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

## 🚀 Quick Start (3 Steps) - Mega (Easiest)

### Step 1️⃣: On Your Local PC or VPS

```bash
# Install rclone
curl https://rclone.org/install.sh | sudo bash

# Set up Mega (NO browser needed!)
rclone config
# → n (new)
# → mega (name)
# → mega (type)
# → your-email@gmail.com
# → your-password
# ✅ Done!
```

### Step 2️⃣: Update .env

```env
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
RCLONE_GDRIVE_REMOTE=mega
BACKUP_COLLECTIONS=users,exams,videos,exam-participants
BACKUP_RETENTION_DAYS=7
BACKUP_DB_NAME=breathart
```

### Step 3️⃣: Deploy

```bash
# Pull latest code
git pull origin main

# Restart backend
npm start
# OR
docker-compose restart backend
# OR 
pm2 restart breathart-backend
```

**Done!** ✅ Backups will run automatically at 2 AM UTC daily.
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

### Check Mega or Google Drive
```bash
# If using Mega:
rclone ls mega:/mongo-backups/

# If using Google Drive:
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
    ├─ Upload to Mega or Google Drive via rclone
    └─ Clean local backups older than 7 days
    ↓
Files appear in: Mega/GoogleDrive / mongo-backups / 2024-01-15 / ...
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
| `RCLONE_GDRIVE_REMOTE` | Required | `mega` or `gdrive` | rclone remote name |

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

### In Mega or Google Drive (permanent)
```
mongo-backups/
├── 2024-01-15/
│   ├── backup-users-*.json.gz
│   ├── backup-exams-*.json.gz
│   ├── backup-videos-*.json.gz
│   └── backup-exam-participants-*.json.gz
├── 2024-01-16/
│   └── ...

# Access via:
# Mega:  rclone ls mega:/mongo-backups/
# GDrive: rclone ls gdrive:/mongo-backups/
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

1. **rclone config** stores credentials at:
   ```bash
   ~/.config/rclone/rclone.conf
   ```
   Make sure permissions are `600`:
   ```bash
   sudo chmod 600 ~/.config/rclone/rclone.conf
   ```

2. **Mega** - Uses email/password auth (stored locally)

3. **Google Drive** - Uses OAuth token (browser-based, stored locally on VPS)

4. **Backups are encrypted** over HTTPS during upload

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
✅ **Cloud upload** — Direct to Mega or Google Drive  
✅ **Error handling** — Continues on individual failures  
✅ **Retention policy** — Auto-cleanup old local files  
✅ **Manual trigger** — Optional admin endpoint  
✅ **Environment-based** — Easy to configure  
✅ **Non-blocking** — Doesn't slow down your app  
✅ **Comprehensive logging** — Full visibility  

---

## 📊 Next Steps

### Option A: Mega (Easiest - Recommended for Testing)
- [ ] Install rclone (local PC or VPS)
- [ ] Run `rclone config` with Mega (no browser auth needed!)
- [ ] Add env variables to `.env`
- [ ] Pull latest backend code
- [ ] Restart backend service
- [ ] Check logs for "✅ Backup scheduler started"
- [ ] Verify files appear in Mega

### Option B: Google Drive (Production VPS)
- [ ] SSH to VPS
- [ ] Install rclone
- [ ] Run `rclone config` with Google Drive auth
- [ ] Add env variables to `.env`
- [ ] Pull latest backend code
- [ ] Restart backend service
- [ ] Check logs for "✅ Backup scheduler started"
- [ ] Verify files in Google Drive

---

## 🎯 You're All Set!

Your MongoDB backups are production-ready. They'll:
- 📅 Run automatically on schedule
- 💾 Export as compressed JSON
- ☁️ Upload to Mega or Google Drive
- 🗑️ Clean old local files
- 📊 Log everything for monitoring

**Pick your storage:**
- ⚡ **Mega** (easier, works on Windows/VPS, no browser auth)
- 🔐 **Google Drive** (better for production, requires browser auth)

**Questions?** Check the documentation files or the comments in `backupService.js`.

**Enjoy worry-free backups!** 🚀
