# Nginx Configuration Setup Guide

## Files Created

✅ `nginx/breathartinstitute.in.conf` - Ready-to-use Nginx config

---

## How to Apply (On Your VPS)

### Step 1: Copy config file to Nginx

```bash
# SSH to your VPS
ssh user@your-vps-ip

# Copy the config (replace path if different)
sudo cp /path/to/breathart/nginx/breathartinstitute.in.conf \
        /etc/nginx/sites-available/breathartinstitute.in
```

### Step 2: Enable the site

```bash
# Create symlink to enable
sudo ln -s /etc/nginx/sites-available/breathartinstitute.in \
           /etc/nginx/sites-enabled/breathartinstitute.in
```

### Step 3: Test config

```bash
sudo nginx -t
# Should show: nginx: configuration file test is successful
```

### Step 4: Restart Nginx

```bash
sudo systemctl restart nginx
```

### Step 5: Restart Backend

```bash
# Update .env first
nano backend/.env
# Change: NODE_ENV=production

# Then restart
pm2 restart breathart-backend
# OR
docker-compose restart backend
```

---

## ⚠️ Important: Update Path in Config

The config file has this line:

```nginx
alias /path/to/breathart/frontend/dist/assets/;
```

**Replace `/path/to/breathart/` with your actual path:**

Example:
```nginx
# If backend is at /home/ubuntu/breathart/
alias /home/ubuntu/breathart/frontend/dist/assets/;

# Or if using docker:
alias /var/www/breathart/frontend/dist/assets/;
```

**Edit on VPS:**
```bash
sudo nano /etc/nginx/sites-available/breathartinstitute.in
# Find and replace the alias path
# Ctrl+X → Y → Enter to save
```

---

## 🧪 Verify It Works

```bash
# Test CSS loads correctly
curl -I https://www.breathartinstitute.in/assets/index-Cuiv0ezB.css

# Should show:
# HTTP/2 200
# Content-Type: text/css

# NOT:
# Content-Type: application/json ❌
```

---

## 📋 Checklist

- [ ] Copied config to `/etc/nginx/sites-available/breathartinstitute.in`
- [ ] Created symlink in sites-enabled
- [ ] Updated the asset path in config
- [ ] Ran `sudo nginx -t` (passed)
- [ ] Restarted nginx: `sudo systemctl restart nginx`
- [ ] Changed backend `.env` to `NODE_ENV=production`
- [ ] Restarted backend
- [ ] Verified CSS loads with correct MIME type

---

## Quick Copy-Paste Commands

```bash
# All in one (adjust path as needed)
sudo cp /path/to/breathart/nginx/breathartinstitute.in.conf /etc/nginx/sites-available/breathartinstitute.in && \
sudo ln -s /etc/nginx/sites-available/breathartinstitute.in /etc/nginx/sites-enabled/breathartinstitute.in && \
sudo nginx -t && \
sudo systemctl restart nginx
```

Then:
```bash
# Update backend
cd /path/to/backend
sed -i 's/NODE_ENV=development/NODE_ENV=production/' .env
pm2 restart breathart-backend
```

---

## 🔧 Troubleshooting

### "nginx: not found" or "tests failed"
- Make sure syntax in config file is correct
- Run: `sudo nginx -t` to see errors

### "Permission denied"
- Use `sudo` for all nginx commands

### CSS still loading as JSON
- Check that path in alias is correct
- Verify backend restarted with NODE_ENV=production
- Check browser cache: Ctrl+Shift+Delete to clear

### "502 Bad Gateway"
- Backend not running on port 8080
- Check: `pm2 list` or `docker-compose ps`
- Restart: `pm2 restart breathart-backend`

---

Done! 🚀
