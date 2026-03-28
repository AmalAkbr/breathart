# Backend API - Breath Art Institute

Node.js Express server with MongoDB, JWT authentication, and ImageKit integration.

---

## 🚀 Quick Start

```bash
npm install
npm run dev  # Runs on port 3001
```

---

## 📋 Environment Variables

```
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/breathart
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
IMAGEKIT_PUBLIC_KEY=your-public-key
IMAGEKIT_PRIVATE_KEY=your-private-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-endpoint/
FRONTEND_URL=http://localhost:5173
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/verify-email` | Verify email with token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| POST | `/api/auth/resend-verification` | Resend verification email |
| GET | `/api/auth/profile` | Get user profile (protected) |
| POST | `/api/auth/logout` | Logout user (protected) |

### File Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/image` | Upload and convert image to WebP |
| POST | `/api/upload/profile-image` | Upload profile picture |
| POST | `/api/upload/course-thumbnail` | Upload course thumbnail |

---

## 🔐 Authentication

### Signup
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

# Returns: { token, user { userId, email, fullName, role } }
# Sets: HTTP-only cookie "authToken"
```

### Protected Route
```bash
GET /api/auth/profile
Authorization: Bearer <jwt-token>

# Or with cookie (automatically sent)
```

---

## 📁 Project Structure

```
backend/src/
├── config/
│   ├── database.js          # MongoDB connection
│   └── env.js               # Environment validation
├── models/
│   ├── User.js              # User schema
│   └── Video.js             # Video schema
├── controllers/
│   ├── authMongoDB.js       # Auth logic
│   └── uploadControllerMongoDB.js  # Upload logic
├── routes/
│   ├── authMongoDB.js       # Auth endpoints
│   └── uploadMongoDB.js     # Upload endpoints
├── middleware/
│   ├── auth.js              # JWT + validation
│   └── fileUpload.js        # File validation
├── utils/
│   ├── emailService.js      # Email sending
│   ├── imagekitHelper.js    # ImageKit operations
│   ├── imageProcessor.js    # WebP conversion
│   └── logger.js            # Logging
└── index.js                 # Main server
```

---

## 🖼️ Image Upload & Conversion

### Upload Flow
1. User uploads PNG/JPG/WebP
2. Sharp converts to WebP format (75-90% size reduction)
3. Creates thumbnail (300x300px)
4. Uploads both to ImageKit
5. Returns main image + thumbnail URLs

### Batch Convert
```bash
node batch-process-images.js ./uploads
# Converts all PNG/JPG files > 40KB to WebP
```

See [WEBP_CONVERSION.md](./WEBP_CONVERSION.md) for full details.

---

## 📦 NPM Scripts

```bash
npm run dev      # Development with nodemon
npm run start    # Production server
```

---

## 🗄️ Database

### Models
- **User** - fullName, email, password (hashed), profileImage, role, isEmailVerified
- **Video** - title, description, url, thumbnail, duration, category
- **Exam** - title, questions, startDate, endDate
- **ExamParticipant** - userId, examId, score, completedAt

---

## 🔒 Security Features

✅ JWT with 7-day expiry
✅ Password hashing (bcryptjs)
✅ Email verification required
✅ HTTP-only secure cookies
✅ CORS protection
✅ Helmet security headers
✅ Input validation (JOI)
✅ Session management

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "MongoDB connection failed" | Check MONGODB_URI, ensure mongod running |
| "Email not sending" | Verify EMAIL_USER/PASSWORD, check Gmail app password |
| "ImageKit upload error" | Check credentials and IMAGEKIT_URL_ENDPOINT format |
| "Port 3001 already in use" | Change PORT in .env or kill process |

---

## 📚 Additional Resources

- [Main README](../README.md)
- [Image Optimization Guide](./WEBP_CONVERSION.md)
- [Frontend README](../frontend/README.md)

---

**Last Updated:** March 2026
