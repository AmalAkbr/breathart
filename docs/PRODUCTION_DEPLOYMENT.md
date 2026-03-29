# Production Deployment Guide

Complete guide for deploying BreathArt to production using Docker.

## Prerequisites

- Docker & Docker Compose installed
- `.env` files created for secrets (not in git)
- VPS or server with sufficient resources
- Domain name (optional, for HTTPS)

---

## 1. Environment Setup

### Backend Environment (`backend/.env`)

Create `backend/.env` with all production secrets:

```bash
# =====================
# Node Environment
# =====================
NODE_ENV=production
PORT=8080

# =====================
# Database
# =====================
MONGODB_URI=mongodb://user:password@host:27017/breathart
MONGODB_URI_DOCKER=mongodb://user:password@host.docker.internal:27017/breathart

# =====================
# CORS & Security
# =====================
# Comma-separated list of allowed origins
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# =====================
# Email Service (SendGrid or similar)
# =====================
SENDGRID_API_KEY=your_sendgrid_key_here
SENDER_EMAIL=noreply@yourdomain.com

# =====================
# Image Upload (ImageKit or Cloudflare R2)
# =====================
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_account/

# OR for Cloudflare R2:
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_BUCKET_NAME=your_bucket_name
CLOUDFLARE_BUCKET_URL=https://your_bucket_url.r2.cloudflarecontent.com

# =====================
# JWT & Authentication
# =====================
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRES_IN=7d

# =====================
# Admin Credentials (for setup)
# =====================
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=strong_admin_password_here

# =====================
# Webhook (if using external services)
# =====================
WEBHOOK_SECRET=your_webhook_secret_here

# =====================
# Redis (optional, for caching/sessions)
# =====================
REDIS_URL=redis://user:password@redis-host:6379

# =====================
# Logging
# =====================
LOG_LEVEL=info
```

**Security Tips:**
- Never commit `.env` to git
- Add `.env` to `.gitignore`
- Rotate secrets regularly
- Use strong random values for JWT_SECRET and WEBHOOK_SECRET
- Store sensitive values in your VPS password manager or secrets vault

### Frontend Environment (`frontend/.env.local`)

Create `frontend/.env.local` with production values:

```bash
# Backend API endpoint (must match FRONTEND_URL from backend)
VITE_API_URL=https://yourdomain.com/api

# Web3Forms key (for contact forms, optional)
VITE_WEB3FORMS_KEY=your_web3forms_key_here

# Token expiry (same as backend)
JWT_MAX_AGE=7d
VERIFICATION_TOKEN_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=5hr
VITE_NODE_ENV=production
```

**Important:**
- `VITE_API_URL` must be `https://yourdomain.com/api` in production (not localhost)
- This value is baked into the compiled JavaScript during build
- If blank/missing, build will fail with "VITE_API_URL environment variable is not set"

---

## 2. Docker Build & Configuration

### Dockerfile Overview

The multi-stage Dockerfile handles:

1. **Frontend Build Stage:**
   - Installs frontend dependencies
   - Runs `npm run build` with `VITE_API_URL` as build argument
   - Creates optimized `dist/` bundle with API URL baked in

2. **Backend Dependencies Stage:**
   - Installs production dependencies only (`--omit=dev`)
   - Keeps image lean

3. **Runtime Stage:**
   - Runs backend on port 8080
   - Serves built frontend as static assets
   - Uses non-root user `breathart` for security

### docker-compose.yml Configuration

Key settings:

```yaml
build:
  context: .
  args:
    # Frontend build argument - injected into Vite during build
    VITE_API_URL: ${VITE_API_URL:-http://localhost:8080/api}

env_file:
  - backend/.env  # Runtime backend secrets

ports:
  - "8080:8080"   # Container exposes 8080

restart: unless-stopped  # Auto-restart on crash

volumes:
  # Optional: persist uploads if not using cloud storage
  - ./uploads:/app/backend/uploads
```

---

## 3. Building & Deploying

### Step 1: Copy Files to Server

```bash
# From your local machine, copy everything to VPS
scp -r . user@your-server:/home/user/breathart

# SSH into server
ssh user@your-server
cd /home/user/breathart
```

### Step 2: Set Up Environment Files

```bash
# Create backend/.env with production secrets
nano backend/.env
# Paste your backend environment variables, save (Ctrl+X, Y, Enter)

# Create frontend/.env.local with production values
nano frontend/.env.local
# Paste your frontend environment variables, save

# Verify files exist
ls -la backend/.env frontend/.env.local
```


### Step 3: Build & Start Containers (Production Docker Workflow)

```bash
# 1. Stop and remove all running containers
docker compose down

# 2. (Optional, for guaranteed fresh build) Remove all build cache and unused images
docker builder prune -af
docker image prune -af
docker image rm -f breathart-app  # Remove old app image if exists

# 3. Build all images with no cache (ensures env vars are injected)
docker compose build --no-cache

# 4. Start containers in detached mode
docker compose up -d

# 5. (Optional) View logs
docker compose logs -f

# 6. Check if running
docker compose ps
```

Expected log output:
```
✓ NODE_ENV: production
✓ PORT: 8080
✓ MongoDB connected to host.docker.internal:27017
✓ Allowed Origins: [ 'https://yourdomain.com', 'https://www.yourdomain.com' ]
✓ Server running on http://0.0.0.0:8080
✓ Frontend dist ready for serving
```

---

## 4. Verification Steps

### Check Container Running

```bash
docker compose ps
# Should show:
# NAME       STATUS       PORTS
# brt_app    Up 2 mins    0.0.0.0:8080->8080/tcp
```

### Test Backend Health

```bash
curl http://localhost:8080/api/health
# Should return: { "status": "ok" }
```

### Test Frontend Served

```bash
curl http://localhost:8080/
# Should return HTML (index.html served by Express)
```

### Check Browser

1. Navigate to `https://yourdomain.com` (or `http://localhost:8080` if local)
2. Open DevTools → Network tab
3. Verify API calls go to correct URL (not `undefined` or wrong port)
4. No CSP violations in console

### Test Admin Panel

1. Login with admin credentials from `ADMIN_EMAIL` / `ADMIN_PASSWORD`
2. Navigate to admin panel
3. Should see no `undefined/admin/enable-admin` 404 errors
4. Should see no `<!doctype` JSON parse errors

---

## 5. Reverse Proxy Setup (HTTPS with Nginx)

For HTTPS and domain routing:

```nginx
# /etc/nginx/sites-available/breathart
upstream backend {
  server localhost:8080;
}

server {
  listen 80;
  server_name yourdomain.com www.yourdomain.com;
  
  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name yourdomain.com www.yourdomain.com;
  
  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  
  # Proxy to Docker container
  location / {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_buffering off;
  }
  
  # WebSocket support (for upload progress)
  location /socket.io {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/breathart /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Get HTTPS cert with Let's Encrypt:
```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

---

## 6. Common Issues & Troubleshooting

### Issue: "VITE_API_URL environment variable is not set"

**Cause:** Frontend build ran without VITE_API_URL in docker-compose or frontend/.env.local

**Fix:**
```bash
# Ensure frontend/.env.local exists with VITE_API_URL
cat frontend/.env.local

# Rebuild without cache
docker compose down
docker compose build --no-cache app
docker compose up -d app
```

### Issue: API calls go to `undefined/admin/...` (404)

**Cause:** VITE_API_URL not injected into compiled code

**Fix:**
```bash
# Check built code in container
docker exec brt_app cat frontend/dist/index-*.js | grep "http" | head -5

# Should contain: http://yourdomain.com/api or localhost:8080/api
# If not, rebuild with --no-cache
```

### Issue: CSP (Content Security Policy) violations

**Cause:** CORS_ORIGIN not matching frontend requests

**Fix:**
```bash
# Check backend logs
docker compose logs app | grep -i "cors\|csp"

# Verify CORS_ORIGIN in backend/.env includes frontend domain:
cat backend/.env | grep CORS_ORIGIN
# Should list: https://yourdomain.com,https://www.yourdomain.com
```

### Issue: MongoDB Connection Refused

**Cause:** MongoDB host unreachable or credentials wrong

**Fix:**
```bash
# Verify connection string
docker exec brt_app node -e "console.log(process.env.MONGODB_URI)"

# Test connection from inside container
docker exec brt_app mongosh "mongodb://user:pass@host:27017/breathart" --eval "db.adminCommand('ping')"

# Check if MongoDB is running on host
ps aux | grep mongod

# If using Docker MongoDB:
docker ps | grep mongo
```

### Issue: Container crashes on startup

**Fix:**
```bash
# View detailed logs
docker compose logs app -n 100

# Rebuild and restart
docker compose restart app

# If still failing:
docker compose down
docker compose up app  # Run in foreground to see errors
```

---

## 7. Maintenance

### Viewing Logs

```bash
# Real-time logs
docker compose logs -f app

# Last 50 lines
docker compose logs -n 50 app

# Logs from backend only (exclude Vite build logs)
docker compose logs app | grep -v "Vite"
```

### Updating Code

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose down
docker compose build --no-cache app
docker compose up -d app

# Verify
docker compose ps
```

### Backing Up Data

```bash
# Backup MongoDB
docker exec mongodb mongodump --out /backup

# Backup uploads (if stored locally)
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/

# Copy to storage
scp uploads_backup_*.tar.gz backup-server:/storage/
```

### Monitoring

```bash
# Container resource usage
docker stats brt_app

# Disk space
df -h

# Memory
free -h

# Check for errors in logs
docker compose logs app | grep -i "error\|warn"
```

---

## 8. Environment Variable Reference

| Variable | Backend | Frontend | Type | Required | Example |
|----------|---------|----------|------|----------|---------|
| NODE_ENV | ✓ | ✗ | string | Yes | production |
| PORT | ✓ | ✗ | number | Yes | 8080 |
| MONGODB_URI | ✓ | ✗ | string | Yes | mongodb://... |
| CORS_ORIGIN | ✓ | ✗ | string | Yes | https://domain.com |
| FRONTEND_URL | ✓ | ✗ | string | Yes | https://domain.com |
| VITE_API_URL | ✗ | ✓ (build-time) | string | Yes | https://domain.com/api |
| JWT_SECRET | ✓ | ✗ | string | Yes | random_min_32_chars |
| SENDGRID_API_KEY | ✓ | ✗ | string | Yes | key_... |
| IMAGEKIT_PRIVATE_KEY | ✓ | ✗ | string | Yes | private_... |
| CLOUDFLARE_ACCESS_KEY_ID | ✓ | ✗ | string | No | ... |

---

## 9. Security Checklist

- [ ] `.env` files in `.gitignore`
- [ ] Backend runs as non-root user (uid 1001)
- [ ] MongoDB authentication enabled
- [ ] JWT_SECRET is strong (32+ chars, random)
- [ ] CORS_ORIGIN restricted to known domains
- [ ] HTTPS enabled with valid certificate
- [ ] CSP headers configured (Content-Security-Policy)
- [ ] Rate limiting enabled on auth endpoints
- [ ] CSRF protection enabled
- [ ] Environment-specific secrets (never hardcoded)
- [ ] Regular backups of MongoDB
- [ ] Monitor logs for suspicious activity

---


## 10. Quick Reference Docker Commands

```bash
# Build & start (production, with fresh env)
docker compose build --no-cache
docker compose up -d

# Stop all containers
docker compose down

# View logs
docker compose logs -f

# Restart app container
docker compose restart app

# Execute command in container
docker exec brt_app npm run migrate
docker exec brt_app node some_script.js

# SSH into container (interactive)
docker exec -it brt_app /bin/bash

# Remove everything (careful!)
docker compose down -v
docker image rm breathart-app
```

---

## Need Help?

- Check logs: `docker compose logs -f app`
- Verify env files: `cat backend/.env` and `cat frontend/.env.local`
- Test connectivity: `curl http://localhost:8080/api/health`
- Rebuild: `docker compose build --no-cache --pull app`

