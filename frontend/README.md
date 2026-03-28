# Frontend - Breath Art Institute

React + Vite application with Tailwind CSS, Framer Motion animations, and Zustand state management.

---

## 🚀 Quick Start

```bash
npm install
npm run dev  # Runs on port 5173
```

---

## 📋 Environment Variables

```
VITE_API_URL=http://localhost:3001/api
```

---

## 📁 Project Structure

```
frontend/src/
├── components/          # Reusable React components
│   ├── Navbar.jsx       # Navigation bar
│   ├── Footer.jsx       # Footer
│   ├── Hero.jsx         # Hero section
│   ├── Courses.jsx      # Course listing
│   ├── ProtectedRoute.jsx    # auth guard
│   └── ...
├── pages/               # Full page views
│   ├── Home.jsx         # Landing page
│   ├── Courses.jsx      # Courses page
│   ├── Admission.jsx    # Admission page
│   ├── Login.jsx        # Login (new MongoDB auth)
│   ├── Register.jsx     # Registration
│   ├── VerifyEmail.jsx  # Email verification
│   └── profile/         # User profile page
├── store/
│   ├── userStore.js     # Zustand auth store
│   └── ...
├── utils/
│   ├── apiClient.js     # Axios API wrapper
│   ├── envValidator.js  # Environment validation
│   └── toast.js         # Toast notifications
├── App.jsx              # Router configuration
└── main.jsx             # React entry point
```

---

## 🎯 Key Features

### Pages
- **Home** - Landing page with hero, courses, features
- **Courses** - Browse and filter courses
- **Admission** - Admission inquiry form
- **Login/Register** - MongoDB-based authentication
- **Profile** - User profile with logout
- **Blogs** - Blog articles
- **Careers** - Career opportunities

### Components
- **Navbar** - Navigation with auth state
- **Hero** - Animated hero banner
- **Courses** - Course cards and filters
- **Modal Forms** - Contact, enrollment, applications
- **Animations** - Framer Motion, GSAP effects

---

## 🔐 Authentication (Zustand)

### User Store
```javascript
import { useUserStore } from './store/userStore';

const { user, isLoggedIn, login, logout } = useUserStore();
```

### Login Flow
```javascript
const handleLogin = async (email, password) => {
  const token = await authAPI.login(email, password);
  login(token); // Updates Zustand store
};
```

### Protected Routes
```javascript
<ProtectedRoute>
  <Profile />
</ProtectedRoute>
```

---

## 📡 API Integration

### API Client
```javascript
import { authAPI } from './utils/apiClient';

// Login
const result = await authAPI.login(email, password);

// Signup
await authAPI.signup(fullName, email, password);

// Get profile
const profile = await authAPI.getProfile();

// Logout
await authAPI.logout();
```

---

## 🎨 Styling

### Tailwind CSS
- Custom colors: `accent-blue`, `accent-cyan`
- Responsive design: mobile-first
- Dark theme with gradients

### Animation Libraries
- **Framer Motion** - Component animations
- **GSAP** - Advanced scroll effects
- **Lenis** - Smooth scroll

---

## 📦 NPM Scripts

```bash
npm run dev      # Development server (port 5173)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # ESLint code quality
```

---

## 🔗 API Routes Integration

| Page | API Calls |
|------|-----------|
| Login | `POST /auth/login` |
| Register | `POST /auth/signup` |
| Verify Email | `POST /auth/verify-email` |
| Profile | `GET /auth/profile` |
| Image Upload | `POST /upload/image` |

---

## 💾 State Management

### Zustand Store (userStore.js)
```javascript
{
  user: { userId, email, fullName, role, profileImage },
  isLoggedIn: boolean,
  loading: boolean,
  login(token),
  logout(),
  setUser(user),
}
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "API not found" | Check VITE_API_URL in .env.local |
| "Images not loading" | Verify ImageKit URL in environment |
| "Login fails" | Ensure backend running on port 3001 |
| "Animations laggy" | Check GPU acceleration in browser settings |

---

## 📚 Additional Resources

- [Main README](../README.md)
- [Backend README](../backend/README.md)
- [Tailwind Docs](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)

---

**Last Updated:** March 2026
