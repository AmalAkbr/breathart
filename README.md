# Breath Art Institute - Full Stack Platform

A modern, high-performance educational and marketing platform combining React frontend with MongoDB backend. Features user authentication, course management, image optimization, and real-time notifications.

---

## 📋 Project Overview

**Breath Art Institute** is a comprehensive web application for digital marketing education with:
- **MongoDB** backend with JWT authentication
- **React + Vite** frontend with smooth animations
- **ImageKit** CDN for optimized image delivery
- **Email verification** and password reset flows
- **WebP conversion** for automatic image optimization
- **Responsive design** with Tailwind CSS

---

## ✨ Key Features

### 🎥 Video Upload & Management
- **Real-time Upload Progress** - Byte-accurate progress tracking (capped at 99% during transfer, 100% on success)
- **Network Speed Check** - Automatic pre-upload diagnostics for download speed & backend connectivity
- **Smart Slow Network Handling** - User-friendly warnings with actionable suggestions when network is slow
- **Auto Duration Detection** - Automatically extracts & fills video duration from selected files
- **Cancel Upload Anytime** - Stop mid-upload with automatic cleanup of partially uploaded files
- **Leave-Page Protection** - Confirms before navigating away during active uploads

### 🛡️ Content Security
- **DevTools Detection** - Prevents content viewing/piracy in production when DevTools opened
- **Blank Security Screen** - Shows protective lock screen when DevTools detected
- **Portfolio Protection** - Blocks keyboard shortcuts & context menu inspection

### 🎨 Upload Features
- **Thumbnail Upload to ImageKit** - Optimized image storage with automatic WebP conversion
- **Video Upload to Cloudflare R2** - Fast video delivery via S3-compatible storage
- **Error Recovery** - Meaningful error messages for network issues (ECONNRESET → user-friendly)
- **File Cleanup on Cancel** - Removes thumbnails from ImageKit, videos from R2, DB records

### 📊 User Experience
- **Drag & Drop Upload** - Intuitive file selection with drag-and-drop support
- **File Preview** - See thumbnail/video preview before uploading
- **URL Input Option** - Upload via file OR paste external URLs
- **Responsive Design** - Works seamlessly on desktop & mobile
- **Toast Notifications** - Real-time feedback for all operations

---

## 🏗️ Architecture

```
breathart/
├── backend/                          # Node.js Express server
│   ├── src/
│   │   ├── config/                  # Database & env config
│   │   ├── models/                  # MongoDB schemas (User, Video, etc.)
│   │   ├── controllers/             # Business logic
│   │   ├── routes/                  # API endpoints
│   │   ├── middleware/              # Auth, validation, file upload
│   │   ├── utils/                   # Helpers (email, image processing)
│   │   └── index.js                 # Main server file
│   ├── package.json
│   ├── .env
│   └── WEBP_CONVERSION.md           # Image processing docs
│
├── frontend/                         # React + Vite app
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   ├── pages/                   # Full-page views
│   │   ├── store/                   # Zustand state management
│   │   ├── utils/                   # API client, helpers
│   │   ├── App.jsx                  # Router configuration
│   │   └── main.jsx                 # React entry point
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
└── README.md                         # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB (local or Atlas)
- ImageKit account (for image optimization)

### Dockerized run (prod-style)

```bash
# 1) Copy backend env vars
cp backend/.env.example backend/.env
# Fill PORT=8080 and your real values (Mongo, JWT, R2, ImageKit, email, CORS/FRONTEND_URL)

# 2) Build and start
docker compose up --build

# App available on http://localhost:8080 (also mapped to host 443 -> container 8080)
```

Notes:
- The container serves the built frontend via the Express backend; no separate Vite server.
- TLS is not terminated in the container; keep `443:8080` mapping for downstream proxies/ingress that terminate HTTPS.
- Runs as unprivileged user `nodeapp` inside the container.

### 1. Clone Repository
```bash
git clone <repo-url>
cd breathart
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
# Copy the required variables from section below

# Start backend (runs on port 8080)
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local
VITE_API_URL=http://localhost:8080/api

# Start development server (runs on port 5173)
npm run dev
```

---

## 🛠️ Technology Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React 19, Vite, React Router |
| **Backend** | Node.js, Express, MongoDB |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | JWT + Email verification |
| **Image Optimization** | ImageKit + Sharp (WebP) |
| **Email** | Nodemailer (Gmail SMTP) |
| **Styling** | Tailwind CSS |
| **Animations** | Framer Motion |

---

## 📦 Environment Variables

### Backend (.env)
```
PORT=8080
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/breathart
JWT_SECRET=your-secret-key-here
SESSION_SECRET=your-session-secret-here
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
IMAGEKIT_PUBLIC_KEY=your-public-key
IMAGEKIT_PRIVATE_KEY=your-private-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-endpoint/
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8080/api
```

---

## 📚 Documentation

- **[Backend README](./backend/README.md)** - API endpoints, authentication, database
- **[Frontend README](./frontend/README.md)** - Components, state management, styling  
- **[Image Optimization](./backend/WEBP_CONVERSION.md)** - WebP conversion and upload

---

## 🔐 Authentication

- **JWT Authentication** with 7-day expiry
- **Email Verification** required before login
- **Password Reset** via email link
- **HTTP-only Cookies** for session management
- **Password Hashing** with bcryptjs

---

## 📜 NPM Scripts

### Backend
```bash
npm run dev          # Start development server (port 8080)
npm run start        # Start production server
```

### Frontend
```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## 🚀 Deployment

### Backend (VPS/Heroku)
```bash
npm install
npm start
# Configure production .env variables
```

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
# Set VITE_API_URL to production API
```

---
## 🌐 Network Speed Check System

### How It Works
Before uploading a video, the system automatically tests your internet connection:

1. **Download Speed Test** - Measures frontend internet bandwidth
2. **Backend Connectivity Check** - Verifies server is responding properly
3. **Smart Status Display** - Shows results with user-friendly feedback

### Network Status Levels

| Status | Threshold | Action |
|--------|-----------|--------|
| ✅ **Excellent** | Download ≥ 1 Mbps, Latency < 5s | Upload proceeds automatically |
| ⚠️ **Warning** | Download < 1 Mbps OR Latency > 5s | User can fix network or proceed anyway |
| ❌ **Error** | Check failed to complete | Retry or proceed with caution |

### User-Friendly Messages
- **Slow Download**: "Moving closer to your router • Closing other apps using network • Switching to stronger WiFi"
- **Slow Backend**: "Wait a few moments and try again • Check if server is overloaded • Refresh and retry"
- **Connection Error**: Clear explanation with option to retry check

### Endpoints
- **`GET /api/upload/check-speed`** - Lightweight connectivity test (no auth required)
- **`POST /api/upload/video-file`** - Upload video to Cloudflare R2
- **`POST /api/upload/thumbnail`** - Upload thumbnail to ImageKit
- **`POST /api/upload/cancel-upload`** - Cleanup partially uploaded files

---
## 🔒 Security

✅ **Implemented:**
- JWT authentication with expiry
- Email verification required
- Password hashing with bcryptjs
- HTTP-only secure cookies
- CORS protection
- Helmet security headers
- Input validation with JOI
- **DevTools Detection & Blocking** (Production only)
- **Content Protection** from inspection/piracy
- **Keyboard Shortcut Prevention** (F12, Ctrl+Shift+I, etc.)

---

## � Utilities & Helpers

### Frontend Utilities
- **`utils/networkSpeedCheck.js`** - Download speed test, backend connectivity check
- **`utils/videoDuration.js`** - Extract video metadata without backend
- **`hooks/useDevtoolsShield.js`** - DevTools detection hook for production
- **`components/SecurityBlankScreen.jsx`** - Blank lock screen for content protection

### Backend Services
- **`utils/cloudflareR2Helper.js`** - R2 upload with error normalization
- **`utils/imagekitHelper.js`** - ImageKit upload & deletion
- **`services/uploadService.js`** - Upload orchestration & cleanup

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Ensure MongoDB running: `mongod` |
| Email not sending | Check EMAIL_USER/PASSWORD in .env |
| Images not uploading | Verify ImageKit credentials |
| Frontend can't reach backend | Check VITE_API_URL and CORS |
| Network check showing slow speed | Move closer to WiFi router, close other apps using network |
| Upload stuck at 99% | Network interrupted - wait & retry or check backend logs |
| DevTools blocking in production | This is expected security feature - close DevTools to view content |
| Video upload fails with ECONNRESET | Check internet stability, may need to retry upload |

---

## 📝 License

Proprietary software. All rights reserved by Breath Art Institute.

---

**Last Updated:** March 2026
