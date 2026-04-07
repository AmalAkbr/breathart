# Backup Deployment Cheat Sheet

## 🚀 VPS Setup (Copy-Paste)

```bash
# Install rclone
curl https://rclone.org/install.sh | sudo bash

# Verify
rclone version

# Configure (Choose ONE):

# OPTION A: Mega (easier, no browser needed)
rclone config
# n → new
# mega → name
# mega → type
# your-email@gmail.com → username
# your-password → password

# OPTION B: Google Drive (production)
rclone config
# n → new
# gdrive → name
# 17 → Google Drive
# Leave blank for ID/service account
# drive → scope
# y → Use web browser to authorize
```

## 📝 Add to .env

```env
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_DB_NAME=breathart
BACKUP_COLLECTIONS=users,exams,videos,exam-participants
BACKUP_RETENTION_DAYS=7
RCLONE_GDRIVE_REMOTE=mega
# OR use: RCLONE_GDRIVE_REMOTE=gdrive (if using Google Drive)
```

## 🔄 Deploy Backend

```bash
# Pull latest code
git pull origin main

# Install deps (if needed)
npm install

# Restart
sudo systemctl restart breathart-backend
# OR
docker-compose restart backend
# OR
pm2 restart breathart
```

## ✅ Verify

```bash
# Check scheduler started
sudo journalctl -u breathart-backend -f
# Look for: "✅ Backup scheduler started"

# List Google Drive backups
rclone ls gdrive:/mongo-backups/

# Check rclone works
rclone ls gdrive:
```

## 🧪 Manual Test

```bash
# Test mongoexport (replace URLs)
mongoexport \
  --uri "mongodb+srv://user:pass@cluster.mongodb.net/breathart" \
  --db breathart \
  --collection users \
  --jsonArray \
  --out test.json

# Test gzip
gzip test.json

# Test rclone
rclone copy test.json.gz gdrive:/mongo-backups/test/

# Verify
rclone ls gdrive:/mongo-backups/test/
```

## 🔐 Secure Credentials

```bash
# Protect rclone config
sudo chown root:root ~/.config/rclone/rclone.conf
sudo chmod 600 ~/.config/rclone/rclone.conf

# Verify
ls -la ~/.config/rclone/rclone.conf
# Should show: -rw------- (600)
```

## ⏱️ Common Schedules

```env
0 2 * * *       # Daily at 2 AM
0 */6 * * *     # Every 6 hours
0 0 * * 0       # Weekly Sunday midnight
0 0 1 * *       # Monthly 1st at midnight
30 1 * * *      # Daily 1:30 AM
0 3 * * 1-5     # Weekdays 3 AM only
```

## 🐛 Quick Fixes

```bash
# mongoexport not found?
sudo apt-get install mongodb-org-tools

# rclone not found?
curl https://rclone.org/install.sh | sudo bash

# Re-auth Google Drive?
rclone config
# e (edit) → gdrive → follow browser auth

# Check what's configured?
rclone config show

# Test connection?
rclone ls gdrive:/
```

## 📊 Check Backups

```bash
# If using Mega:
rclone ls mega:/mongo-backups/
rclone du mega:/mongo-backups/

# If using Google Drive:
rclone ls gdrive:/mongo-backups/
rclone du gdrive:/mongo-backups/
```

## 🎯 Enable/Disable

```env
# Enable
BACKUP_ENABLED=true

# Disable
BACKUP_ENABLED=false
# (then restart backend)
```

## 📞 Debug Commands

```bash
# See rclone config
cat ~/.config/rclone/rclone.conf

# Test rclone auth
rclone config show

# Check available remotes
rclone listremotes

# Manual backup trigger (if endpoint added)
curl -X POST http://localhost:3000/api/admin/backup/trigger \
  -H "Authorization: Bearer YOUR_TOKEN"

# Monitor logs in real-time
sudo journalctl -u breathart-backend -f | grep -i backup
```

## 📚 Full Guides

- Quick Start: `docs/BACKUP_QUICK_START.md`
- Setup: `docs/BACKUP_SETUP_GUIDE.md`
- Deployment: `docs/VPS_BACKUP_DEPLOYMENT.md`
- Architecture: `docs/BACKUP_ARCHITECTURE.md`
- Summary: `BACKUP_IMPLEMENTATION_SUMMARY.md`

---

**Status after setup:** ✅ Automated daily backups to Google Drive
