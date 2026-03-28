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

# Start backend (runs on port 3001)
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local
VITE_API_URL=http://localhost:3001/api

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
PORT=3001
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
VITE_API_URL=http://localhost:3001/api
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
npm run dev          # Start development server (port 3001)
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

## 🔒 Security

✅ **Implemented:**
- JWT authentication with expiry
- Email verification required
- Password hashing with bcryptjs
- HTTP-only secure cookies
- CORS protection
- Helmet security headers
- Input validation with JOI

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Ensure MongoDB running: `mongod` |
| Email not sending | Check EMAIL_USER/PASSWORD in .env |
| Images not uploading | Verify ImageKit credentials |
| Frontend can't reach backend | Check VITE_API_URL and CORS |

---

## 📝 License

Proprietary software. All rights reserved by Breath Art Institute.

---

**Last Updated:** March 2026
