# VPS MongoDB Backup Deployment 🚀

This guide walks you through setting up automated MongoDB backups to Google Drive on your VPS.

---

## 🎯 What You're Getting

✅ **Automatic daily backups** of MongoDB collections as JSON  
✅ **Compressed uploads** to Google Drive (saves space)  
✅ **Configurable retention** (keep local backups 7 days)  
✅ **Environment-based** (easy to enable/disable)  
✅ **Error handling** (continues even if one collection fails)  
✅ **Admin endpoint** (trigger backups manually)

---

## 📋 Prerequisites

- VPS with MongoDB access
- `mongoexport` installed (MongoDB tools)
- `gzip` installed (standard on Linux)
- `rclone` installed
- Google account with Drive OR Mega account
---

## 🔧 Installation

### Step 1: Install rclone on VPS

```bash
SSH into your VPS first:
ssh user@your-vps-ip

Then install rclone:
curl https://rclone.org/install.sh | sudo bash

Verify:
rclone version
```

### Step 2: Install MongoDB Tools (if needed)

Check if mongoexport is installed:
```bash
which mongoexport
```

If not found, install:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y mongodb-org-tools
```

### Step 3: Configure Google Drive Access OR Mega

**Option A: Mega (Simpler - No Browser Auth)**

On your VPS:
```bash
rclone config
```

Follow prompts:
```
n → new remote
mega → name it
mega → type
your-email@gmail.com → username
your-password → password
```

✅ Done! No browser needed.

**Option B: Google Drive (Better for Production)**

On your VPS, run:
```bash
rclone config
```

Follow prompts:
```
n → new remote
gdrive → name it
17 → Google Drive
(leave blank for credentials)
drive → scope
y → Use web browser
```

When prompted, open browser and authenticate.

### Step 4: Update Your .env File

SSH into your backend directory and edit `.env`:

```bash
nano .env
```

Add these lines (choose one remote):

```env
# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_DB_NAME=breathart
BACKUP_COLLECTIONS=users,exams,videos,exam-participants
BACKUP_RETENTION_DAYS=7

# Choose one:
RCLONE_GDRIVE_REMOTE=mega           # If using Mega
# OR
RCLONE_GDRIVE_REMOTE=gdrive         # If using Google Drive
```

Save: `Ctrl+X → Y → Enter`

### Step 5: Deploy Updated Backend

```bash
# Go to your backend directory
cd /path/to/backend

# Pull latest code (which includes backupService.js)
git pull origin main

# Install deps (if any new ones)
npm install

# Restart your backend service
# (depends on your setup - systemd/docker/pm2/etc)
sudo systemctl restart breathart-backend
# OR
docker-compose restart backend
# OR
pm2 restart breathart-backend
```

### Step 6: Verify Backups are Running

**Check logs:**
```bash
# If using systemd:
sudo journalctl -u breathart-backend -f

# If using Docker:
docker-compose logs -f backend

# If using PM2:
pm2 logs breathart-backend
```

You should see (at startup):
```
✅ Backup scheduler started (cron: 0 2 * * *)
```

And (at scheduled time):
```
🔄 Starting backup routine at 2024-01-15T02:00:00.000Z
📦 Exporting breathart.users...
✅ Exported: backup-users-2024-01-15_02-00-00.json.gz
☁️  Uploading to Google Drive...
✅ Uploaded to Google Drive: mongo-backups/2024-01-15
```

**Check Google Drive OR Mega:**
```bash
# If using Mega:
rclone ls mega:/mongo-backups/

# If using Google Drive:
rclone ls gdrive:/mongo-backups/

# Example output:
# 12345678 backup-users-2024-01-15_02-00-00.json.gz
# 87654321 backup-exams-2024-01-15_02-00-00.json.gz

# Check total size:
rclone du mega:/mongo-backups/
# or
rclone du gdrive:/mongo-backups/
```

---

## 🎮 Manual Testing

### Trigger Backup Manually

```bash
# Using curl (if admin endpoint is set up)
curl -X POST http://localhost:3000/api/admin/backup/trigger \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# You should see immediate upload in logs
```

### Check Backup Files Locally

```bash
# On VPS
ls -lh /path/to/backend/temp/backups/

# Should show .json.gz files (compressed backups)
```

---

## ⏰ Cron Schedule Examples

Edit `BACKUP_SCHEDULE` in `.env` to customize when backups run:

| Schedule | Meaning |
|----------|---------|
| `0 2 * * *` | Daily at 2:00 AM |
| `0 */6 * * *` | Every 6 hours (2 AM, 8 AM, 2 PM, 8 PM) |
| `30 2 * * *` | Daily at 2:30 AM |
| `0 0 * * 0` | Weekly on Sunday at midnight |
| `0 0 1 * *` | On the 1st of each month |
| `0 0 * * 1-5` | Weekdays only (Mon-Fri) |

After updating, restart backend for new schedule to take effect.

---

## 🔒 Security

### Protect rclone credentials on VPS

```bash
# rclone config file contains auth tokens
sudo chown root:root ~/.config/rclone/rclone.conf
sudo chmod 600 ~/.config/rclone/rclone.conf

# Verify permissions
ls -la ~/.config/rclone/rclone.conf
# Should show: -rw------- (600)
```

### Use rclone with Service Account (Advanced)

For production, consider using a Google Cloud Service Account instead of personal Google account:

1. Create service account in Google Cloud Console
2. Generate JSON key
3. Grant it access to your backup folder
4. Use the JSON key in rclone config

This isolates backups from your personal account.

---

## 🐛 Troubleshooting

### Backups not running?

Check if scheduler started:
```bash
# View logs for "Backup scheduler started"
sudo journalctl -u breathart-backend | grep -i backup

# If not starting, check env vars:
echo $BACKUP_ENABLED
# Should print: true
```

### "command not found: mongoexport"

```bash
# Check if installed
which mongoexport

# If not, install:
sudo apt-get install mongodb-org-tools

# Or verify it's in PATH:
export PATH=$PATH:/usr/lib/mongodb/bin
mongoexport --version
```

### "command not found: rclone"

```bash
# Reinstall:
curl https://rclone.org/install.sh | sudo bash
rclone version
```

### Files not uploading to Google Drive?

```bash
# Check rclone config
rclone config show

# Test connection:
rclone ls gdrive:/

# If fails, re-authenticate:
rclone config
# Select 'e' to edit "gdrive" remote
# Follow browser auth again
```

### Backup is very slow?

```bash
# Reduce collections to backup
BACKUP_COLLECTIONS=users,exams

# Or use mongodump instead (faster for large DBs)
# Edit backupService.js to use mongodump command

# Or run at off-peak hours
BACKUP_SCHEDULE=0 3 * * *  # 3 AM instead of 2 AM
```

### Google Drive API expires after months?

```bash
# Re-authenticate:
rclone config
# 'e' to edit gdrive
# Let it make a new token
```

---

## 📊 Monitoring

### Set up daily status check

Add to your crontab to check if backups are recent:

```bash
crontab -e

# Add this line:
0 3 * * * rclone ls gdrive:/mongo-backups/ | grep "$(date +\%Y-\%m-\%d)" || \
  echo "ALERT: No backups today!" | mail -s "Backup Failed" your-email@example.com
```

### Clean old Google Drive backups (optional)

```bash
# Delete backups older than 30 days from Google Drive:
# Add to crontab:
0 4 * * * rclone delete gdrive:/mongo-backups/ --min-age 30d
```

---

## 📱 Integrate with Admin Panel

If you added the admin endpoint, you can trigger backups from your frontend:

```javascript
// In your admin dashboard
const triggerBackup = async () => {
  try {
    const response = await fetch('/api/admin/backup/trigger', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      }
    });
    const data = await response.json();
    console.log(data);
    // Shows: success, uploads: [file1.gz, file2.gz, ...]
  } catch (error) {
    console.error('Backup failed:', error);
  }
};
```

---

## ✅ Deployment Checklist

- [ ] rclone installed on VPS
- [ ] MongoDB tools installed (`mongoexport` available)
- [ ] `rclone config` completed with Google Drive
- [ ] Google Drive `/mongo-backups/` folder created
- [ ] `.env` file updated with `BACKUP_ENABLED=true`
- [ ] Backend restarted
- [ ] Logs show "✅ Backup scheduler started"
- [ ] First backup runs at scheduled time
- [ ] Files appear in Google Drive
- [ ] Manual backup tested (if admin endpoint set up)
- [ ] rclone credentials protected (600 permissions)

---

## 🚀 You're Done!

Your MongoDB backups are now:
- ✅ Running automatically on schedule
- ✅ Compressed and encrypted in transit
- ✅ Stored securely in your Google Drive
- ✅ Cleaned up automatically after 7 days on VPS

### Next: Advanced Setup (Optional)

1. **Database archival**: Move old backups to cold storage
2. **Restore automation**: Script to restore from backup
3. **Email alerts**: Send backup status daily
4. **Multiple remotes**: Backup to S3, Dropbox, etc.
5. **Incremental backups**: Only export changed documents

Need help? Check the full guide: `docs/BACKUP_SETUP_GUIDE.md`
