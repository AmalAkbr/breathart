# CORS Configuration Guide
**Breath Art Institute Backend**

---

## 🎯 Problem & Solution

### What Was Wrong
- ❌ Rate limiting was applied BEFORE CORS
- ❌ Preflight OPTIONS requests were blocked
- ❌ Browser preflight checks couldn't get CORS headers
- ❌ No CORS-specific configuration module

### What's Now Fixed
- ✅ CORS middleware runs BEFORE rate limiters
- ✅ OPTIONS preflight requests skip rate limiting
- ✅ Dedicated CORS configuration module created
- ✅ Proper error logging for CORS issues
- ✅ Different origins for dev vs production

---

## 🔧 Configuration Changes

### New File: `backend/src/config/cors.js`
```javascript
// Import CORS module
import corsConfig, { getAllowedOrigins, logCORSConfig } from './config/cors.js';

// Use in app.js
app.use(cors(corsConfig));

// Log configuration (useful for debugging)
logCORSConfig();
```

### Middleware Order (FIXED)
```
1. Helmet (Security headers)
2. Express parsers (JSON, URL-encoded)
3. ✅ CORS (MUST be early)
4. Rate Limiting (after CORS)
5. Request logging
6. Routes
7. Error handling
```

---

## 🌍 Development Setup

### What's Allowed in Development
```bash
http://localhost:5173      # Vite default
http://127.0.0.1:5173      # Localhost variant
http://localhost:3000      # Common port
http://localhost:5000      # Alternative port
# + FRONTEND_URL from .env
```

### In `.env` (Development)
```
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Test in Development
```bash
# Backend running on port 3001
curl -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS http://localhost:3001/api/videos

# Should see:
# Access-Control-Allow-Origin: http://localhost:5173
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
# Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token
```

---

## 🚀 Production Setup

### Key Point: Use Environment Variables

#### In `backend/.env.production`
```bash
# Production MUST explicitly set FRONTEND_URL
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production

# Only this origin will be allowed
# No localhost, no wildcards
```

#### What's Allowed in Production
```
https://your-frontend-domain.com    # ONLY this exact URL
# No localhost
# No other domains
# No IP addresses
```

### Production Deployment Checklist
```
[ ] Set FRONTEND_URL to exact production domain
[ ] Verify NODE_ENV=production
[ ] Test CORS before deploying
[ ] Test with exact domain name (not IP)
[ ] Monitor logs for CORS errors
[ ] Document all allowed domains
```

---

## 🧪 Testing CORS

### Test Preflight Request
```bash
# Option 1: curl with OPTIONS
curl -i -X OPTIONS http://localhost:3001/api/videos \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET"

# Expected response should include:
# Access-Control-Allow-Origin: http://localhost:5173
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
```

### Test from Browser Console
```javascript
// Frontend console (http://localhost:5173)
fetch('http://localhost:3001/api/videos')
  .then(r => r.json())
  .then(data => console.log('Success:', data))
  .catch(e => console.error('CORS Error:', e));
```

### Check Response Headers
```javascript
fetch('http://localhost:3001/api/videos')
  .then(r => {
    console.log('CORS Headers:');
    console.log('Allow-Origin:', r.headers.get('access-control-allow-origin'));
    console.log('Allow-Methods:', r.headers.get('access-control-allow-methods'));
    console.log('Allow-Headers:', r.headers.get('access-control-allow-headers'));
    return r.json();
  });
```

---

## 📋 Common CORS Errors & Fixes

### Error 1: "No 'Access-Control-Allow-Origin' header"
```
❌ Problem: CORS middleware not before rate limiter
✅ Solution: Already fixed! Restart backend server
  npm run dev  (in backend directory)
```

### Error 2: "Preflight request failed"
```
❌ Problem: OPTIONS method not in allowed methods
✅ Solution: Already configured in corsConfig
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
```

### Error 3: "Credentials not allowed"
```
❌ Problem: Missing credentials: true
✅ Solution: Already configured
  credentials: true
```

### Error 4: "Origin not allowed in production"
```
❌ Problem: FRONTEND_URL not set correctly
✅ Solution: 
  1. Check .env.production has FRONTEND_URL
  2. Verify exact domain name (no trailing slash)
  3. Restart backend
  4. Check backend logs for blocked origins
```

---

## 🔍 Debugging CORS Issues

### Enable CORS Logging
The updated backend automatically logs CORS issues:

**Development:** Warnings shown (yellow)
```
⚠️  CORS: Origin not in allowed list: http://example.com
```

**Production:** Errors logged (red)
```
❌ CORS: Blocked origin: http://example.com
```

### Check Configuration
```javascript
// In backend, after importing cors config
import { logCORSConfig } from './config/cors.js';
logCORSConfig(); // Will print CORS setup

// Sample output:
// ╔════════════════════════════════════════════════════════╗
// ║          CORS Configuration                            ║
// ║  Environment: DEVELOPMENT                              ║
// ║  Allowed Origins:                                      ║
// ║    • http://localhost:5173                             ║
// ║    • http://127.0.0.1:5173                             ║
// ╚════════════════════════════════════════════════════════╝
```

---

## 📊 Common Scenarios

### Scenario 1: Local Development
```
Frontend: http://localhost:5173
Backend:  http://localhost:3001
.env:     FRONTEND_URL=http://localhost:5173
Result:   ✅ Works (in allowedOrigins)
```

### Scenario 2: Production
```
Frontend: https://app.breathart.com
Backend:  https://api.breathart.com
.env:     FRONTEND_URL=https://app.breathart.com
Result:   ✅ Works (exact match)
```

### Scenario 3: Multiple Subdomains (NOT RECOMMENDED)
```
Frontend: https://app.breathart.com
Backend:  https://api.breathart.com
Problem:  Subdomain mismatch (app ≠ api)
Solution: Need separate CORS config or CDN
```

### Scenario 4: Production Testing
```
Frontend: http://localhost:5173 (testing backend production)
Backend:  https://api.breathart.com (production)
.env:     FRONTEND_URL=https://app.breathart.com
Result:   ❌ Blocked (localhost not in production)
```

---

## ✅ Quick Restart Guide

After the fix, your backend will work correctly:

### Step 1: Restart Backend
```bash
cd backend
npm run dev
```

### Step 2: Check Logs
You should see:
```
✅ CORS configured for origins: [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...
]
```

### Step 3: Test Frontend
```bash
cd frontend
npm run dev
```

### Step 4: Verify in Browser
- Open http://localhost:5173
- Check Network tab in DevTools
- Look for `access-control-allow-origin` header
- Should show `http://localhost:5173`

---

## 🔒 Security Notes

### Good CORS Practices
✅ Never use wildcard `*` in production  
✅ Always explicitly list allowed origins  
✅ Use HTTPS in production  
✅ Validate origins on backend  
✅ Log CORS rejections  
✅ Monitor for unexpected origins  

### Bad CORS Practices
❌ Wildcard for all origins: `*`  
❌ Hardcoding localhost in production  
❌ Allowing any origin  
❌ Not validating origin server-side  

---

## 📚 Environment Setup Summary

### Development (`.env`)
```
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Production (`.env.production`)
```
FRONTEND_URL=https://your-domain.com
NODE_ENV=production
```

### Verification
```bash
# Print current CORS config
npm run dev  # Check console output for CORS setup

# Test CORS from command line
curl -i -X OPTIONS http://localhost:3001/api/videos \
  -H "Origin: http://localhost:5173"
```

---

## ❓ Questions?

### How do I know CORS is working?
- Check DevTools Network tab
- Look for `access-control-allow-origin` response header
- Should match your frontend origin

### Why different origins in dev vs prod?
- Development: Allow many localhost variations for flexibility
- Production: Strict origins for security (prevent CSRF/CORS abuse)

### How do I add a new allowed origin?
- Development: Edit `getAllowedOrigins()` in `backend/src/config/cors.js`
- Production: Update `FRONTEND_URL` in `.env.production`
- Restart backend: `npm run dev`

---

**Status:** ✅ CORS Fixed & Configured  
**Last Updated:** March 28, 2026
