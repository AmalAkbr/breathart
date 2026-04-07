# MongoDB Backup Setup Guide (Mega or Google Drive)

## Overview
Automated daily backups of your MongoDB database exported as JSON and uploaded to cloud storage using `rclone`.

Choose your storage:
- **Mega** ⭐ Easier (no browser auth, works on Windows)
- **Google Drive** Better for production on VPS

## Prerequisites
- MongoDB access (local or VPS)
- `mongoexport` installed (comes with MongoDB tools)
- `gzip` installed (standard on Linux)
- `rclone` installed
- Either: Mega account OR Google Drive account

---

## 🚀 Step 1: Install Dependencies on VPS

### Install rclone
```bash
curl https://rclone.org/install.sh | sudo bash
rclone version  # Verify installation
```

### Verify mongoexport
```bash
mongoexport --version
```

If not installed:
```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb-org-tools

# Or download from MongoDB
wget https://fastdl.mongodb.org/tools/db/mongodb-database-tools-ubuntu2004-x86_64-100.9.4.tgz
tar xzf mongodb-database-tools-ubuntu2004-x86_64-100.9.4.tgz
sudo cp mongodb-database-tools-ubuntu2004-x86_64-100.9.4/bin/* /usr/local/bin/
```

---

## 🔐 Step 2: Configure Cloud Storage

### Option A: Mega (Easier - No Browser Needed!)

```bash
rclone config
```

Follow prompts:
```
n/s/q> n                    # Create NEW remote
name> mega                  # Name it "mega"
Type of storage> mega       # Choose Mega storage
Username> your-email@gmail.com  # Your Mega account email
Password> your-password     # Your Mega password
Edit advanced config?> n
```

✅ Done! No browser needed.

Verify:
```bash
rclone listremotes        # Should show: mega
rclone ls mega:/          # List Mega contents
```

---

### Option B: Google Drive (Better for Production)

```bash
rclone config
```

Follow prompts:
```
n/s/q> n                          # Create NEW remote
name> gdrive                       # Name it "gdrive"
Type of storage> 17               # Choose "Google Drive"
ID of Google Drive to use> <leave blank>
Service Account Credentials?> <leave blank>
scope> drive                       # Full access to Drive
Edit advanced config?> n
Use web browser to authorize? y    # YES - open browser
```

Browser authentication:
1. Click the link that appears
2. Log in with your Google Account
3. Grant rclone access to Google Drive
4. You'll get a token — rclone saves it automatically

Verify:
```bash
rclone listremotes        # Should show: gdrive
rclone ls gdrive:/        # List Google Drive contents
```

---

## 🔑 Step 3: Add Environment Variables to .env

```env
# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *           # Cron: Daily at 2 AM UTC
BACKUP_DB_NAME=breathart            # Your MongoDB database name
BACKUP_COLLECTIONS=users,exams,videos,exam-participants  # Collections to backup
BACKUP_RETENTION_DAYS=7             # Keep local backups for 7 days

# Choose one (must match your rclone config name):
RCLONE_GDRIVE_REMOTE=mega           # If using Mega
# OR
RCLONE_GDRIVE_REMOTE=gdrive         # If using Google Drive
```

### Cron Schedule Reference
- `0 2 * * *` → Daily at 2:00 AM UTC
- `0 */6 * * *` → Every 6 hours
- `0 0 * * 0` → Weekly on Sunday at midnight
- `0 0 1 * *` → Monthly on 1st at midnight

---

## 🔄 Step 4: Enable Backups in Your App

### In your backend entry point (e.g., `backend/src/index.js`):

```javascript
import { backupService } from './services/index.js';

// Start the app...
const app = express();
// ... setup routes ...

// Initialize backup scheduler
backupService.scheduleBackups();

console.log('✅ Backup scheduler started');
```

---

## 🛠️ Step 5: Create Admin Endpoint (Optional)

Add manual backup trigger to your admin routes:

```javascript
// backend/src/routes/admin.js

import { backupService } from '../services/index.js';

router.post('/backup/trigger', adminMiddleware, async (req, res) => {
  try {
    const result = await backupService.triggerBackup();
    res.json({ 
      success: true, 
      message: 'Backup completed',
      uploads: result.uploads 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
```

---

## 📁 What Gets Backed Up

### Directory Structure
```
Google Drive / mongo-backups /
├── 2024-01-15/
│   ├── backup-users-2024-01-15_02-00-00.json.gz
│   ├── backup-exams-2024-01-15_02-00-00.json.gz
│   ├── backup-videos-2024-01-15_02-00-00.json.gz
│   └── backup-exam-participants-2024-01-15_02-00-00.json.gz
├── 2024-01-16/
│   └── ...
```

### Local Backups (on VPS)
```
backend/temp/backups/
├── backup-users-2024-01-15_02-00-00.json.gz (deleted after 7 days)
├── backup-exams-2024-01-15_02-00-00.json.gz
└── ...
```

---

## ✅ Verify It's Working

### Check backup logs
```bash
# If running as systemd service, view logs
sudo journalctl -u breathart-backend -f

# Or check manual backup
npm run dev  # Start backend development
# Watch console for backup logs
```

### Test manual backup
```bash
curl -X POST http://localhost:3000/admin/backup/trigger \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Verify files in Google Drive
```bash
rclone ls gdrive:/mongo-backups/
rclone du gdrive:/mongo-backups/  # See total size
```

---

## 🔒 Security Best Practices

1. **Protect rclone config** (contains auth tokens)
   ```bash
   sudo chown root:root ~/.config/rclone/rclone.conf
   sudo chmod 600 ~/.config/rclone/rclone.conf
   ```

2. **Use service account** (optional, for non-personal backups)
   ```bash
   # Create service account in Google Cloud Console
   # Download JSON key
   # Use in rclone config with: Service Account Credentials JSON file path
   ```

3. **Limit Google Drive folder**
   - Create dedicated folder: `mongo-backups`
   - Share only with backup service account

4. **Enable MFA on Google Account**
   - Recommended for security

---

## 🔧 Troubleshooting

### "command not found: mongoexport"
```bash
which mongoexport
# If not in PATH, install or add to PATH:
export PATH=$PATH:/usr/lib/mongodb/bin
```

### "command not found: rclone"
```bash
rclone version
# If fails, reinstall:
curl https://rclone.org/install.sh | sudo bash
```

### "The rclone Google Drive remote might have expired"
```bash
# Re-authenticate
rclone config
# Select "e" to edit existing remote
# Enter your remote name
# Follow browser auth again
```

### Backup running but not uploading
```bash
# Check rclone config
rclone config show

# Test rclone connection
rclone listremotes
rclone ls gdrive:/

# Check permissions on Google Drive
rclone check gdrive:/mongo-backups/
```

### Backup too slow (large database)
```bash
# Option 1: Reduce collections
BACKUP_COLLECTIONS=users,exams

# Option 2: Use mongodump instead (binary, faster)
# Edit backupService.js to use mongodump + gzip

# Option 3: Run at off-peak hours
BACKUP_SCHEDULE=0 3 * * *  # 3 AM instead of 2 AM
```

---

## 📊 Example .env Configuration

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/breathart

# Backup Settings
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_DB_NAME=breathart
BACKUP_COLLECTIONS=users,exams,videos,exam-participants
BACKUP_RETENTION_DAYS=7
RCLONE_GDRIVE_REMOTE=gdrive

# Other configs...
PORT=3000
NODE_ENV=production
```

---

## 📝 Monitoring & Maintenance

### Add cron job for remote cleanup (optional)
```bash
# Keep only last 30 days in Google Drive
0 3 * * * rclone delete gdrive:/mongo-backups/ --min-age 30d

# Add to crontab:
crontab -e
```

### Set up email alerts (optional)
Integrate with your monitoring service to alert if backup fails.

---

## ✨ Advanced: Alternative Storage Options

Switch `gdrive` to any rclone-supported service:

- **AWS S3**: `rclone copy file.json.gz s3-backup:/bucket/`
- **Dropbox**: `rclone copy file.json.gz dropbox:/backups/`
- **OneDrive**: `rclone copy file.json.gz onedrive:/backups/`
- **B2 (Backblaze)**: `rclone copy file.json.gz b2-backup:/bucket/`

---

## 🎯 Next Steps

1. ✅ Install rclone on VPS
2. ✅ Run `rclone config` and authenticate Google Drive
3. ✅ Add environment variables to `.env`
4. ✅ Import backupService in your `index.js`
5. ✅ Deploy and monitor logs
6. ✅ Verify backups appear in Google Drive

Done! 🎉
