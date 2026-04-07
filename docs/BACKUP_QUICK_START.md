# Quick Backup Setup

## ⚡ Option 1: Mega (Easiest - No Browser Auth)

### On your Windows PC OR VPS:

```bash
# 1. Install rclone
curl https://rclone.org/install.sh | sudo bash

# 2. Configure Mega (no browser needed!)
rclone config
# n → new
# mega → name it
# mega → type
# your-email@gmail.com → email
# your-password → password
# Done! ✅

# 3. Add to .env
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
RCLONE_GDRIVE_REMOTE=mega
BACKUP_COLLECTIONS=users,exams,videos,exam-participants
```

---

## 🔐 Option 2: Google Drive (Production VPS)

### On your VPS:

```bash
# 1. Install rclone
curl https://rclone.org/install.sh | sudo bash

# 2. Configure Google Drive
rclone config
# (follow browser auth)

# 3. Add to .env
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
RCLONE_GDRIVE_REMOTE=gdrive
BACKUP_COLLECTIONS=users,exams,videos,exam-participants
```

### In your backend `src/index.js`:

```javascript
import { backupService } from './services/index.js';

// ... existing setup code ...

// Start backup scheduler (add before app.listen)
backupService.scheduleBackups();

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📦 Backups: ${env.BACKUP_ENABLED ? 'ENABLED' : 'DISABLED'}`);
});
```

### Verify it works:

```bash
# Check Google Drive for backups
rclone ls gdrive:/mongo-backups/

# Or trigger manually via admin endpoint:
POST /admin/backup/trigger
```

---

## Key Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `BACKUP_ENABLED` | `false` | Enable/disable backups |
| `BACKUP_SCHEDULE` | `0 2 * * *` | Cron format (daily at 2 AM) |
| `BACKUP_DB_NAME` | `breathart` | MongoDB database name |
| `BACKUP_COLLECTIONS` | `users,exams,videos,exam-participants` | Collections to export |
| `BACKUP_RETENTION_DAYS` | `7` | Keep local backups X days |
| `RCLONE_GDRIVE_REMOTE` | `gdrive` | Rclone remote name |

---

## Google Drive Auth Explained

**Why the browser?**
- Secure: You log in directly to Google
- Safe: rclone never sees your password
- One-time: Token stored locally on VPS

**What rclone stores:**
- `~/.config/rclone/rclone.conf` ← Your Google Drive credentials
- Never hardcoded in .env
- Separate from your app secrets

**Permissions:**
- rclone gets full access to **your** Google Drive
- Files saved to: `Google Drive > mongo-backups` folder

---

## Files Modified

✅ `backend/src/services/backupService.js` - New backup service
✅ `backend/src/config/env.js` - Added backup config variables
✅ `backend/src/services/index.js` - Exported new service
📄 `docs/BACKUP_SETUP_GUIDE.md` - Full setup documentation

---

## Next: Integrate into Your App

Just add these 2 lines to your `backend/src/index.js`:

```javascript
import { backupService } from './services/index.js';
// ... in your startup code ...
backupService.scheduleBackups();
```

That's it! Backups will run automatically. 🎉
