# Breath Art Institute

**A modern, high-performance marketing and educational platform built with React, Vite, and Supabase.**

Breath Art Institute is a full-stack web application designed to showcase digital marketing and training courses with user authentication, course enrollment, and interactive animated components. The platform combines a responsive React frontend with a secure Supabase Postgres backend, featuring real-time authentication, dynamic course content, and a seamless user experience.

---

## ✨ Features

- **User Authentication** – Secure sign-up and login via Supabase Auth with email verification
- **Session Management** – Persistent session handling with automatic redirect logic
- **Responsive Design** – Mobile-first layout using Tailwind CSS with custom animations
- **Advanced Animations** – Smooth, GPU-accelerated animations using Framer Motion and GSAP
- **Database Integration** – Type-safe Drizzle ORM queries to Supabase Postgres
- **Course Management** – Browse, filter, and enroll in courses
- **Contact & Inquiry Forms** – Modal-based contact, enrollment, and job application flows
- **Blog Section** – Read articles and industry insights
- **SEO Optimizations** – URL redirects and metadata for better search engine visibility
- **Real-time Notifications** – WhatsApp integration and in-app messaging

---

## 🛠️ Technology Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 19, Vite 7, React Router |
| **Styling** | Tailwind CSS v4, PostCSS |
| **Animations** | Framer Motion, GSAP, Lenis (smooth scroll) |
| **Backend** | Supabase Postgres, Node.js |
| **Database** | Drizzle ORM (type-safe query builder) |
| **Authentication** | Supabase Auth (email) |
| **Linting** | ESLint |
| **Build Tool** | Vite |

---

## 📋 Project Structure

```
breath-art-institute/
├── src/
│   ├── components/          # Reusable UI components (Hero, Navbar, Footer, etc.)
│   ├── pages/               # Full-page views (Home, Courses, Admission, Auth)
│   ├── pages/Authentication/
│   │   ├── Form.jsx         # Login/Register form with validation
│   │   └── Protected.jsx    # Auth gate (redirects logged-in users)
│   ├── supabase/
│   │   └── client.js        # Supabase client initialization
│   ├── assets/              # Images, logos, extracted files
│   ├── App.jsx              # Main router configuration
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── drizzle/
│   ├── schema.ts            # Drizzle ORM database schema
│   └── migrations/          # SQL migration files
├── public/                  # Static files (manifest, favicon)
├── package.json             # Dependencies and npm scripts
├── vite.config.js           # Vite configuration
├── drizzle.config.ts        # Drizzle configuration
├── postcss.config.js        # PostCSS plugins
└── README.md                # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase project with Postgres database
- Modern browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
     ```
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     DATABASE_URL=postgres://user:password@db.supabase.co/postgres
     ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

---

## 📦 Environment Setup

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (public) | Starts with `eyJ...` |
| `DATABASE_URL` | Postgres connection string | `postgres://user:pwd@host/db` |

**⚠️ Security Note:** Keep private keys and database passwords in `.env` and never commit them to version control.

---

## 🗄️ Database (Drizzle ORM + Supabase)

### Schema Definition
- **Location:** [drizzle/schema.ts](drizzle/schema.ts)
- **Type-safe queries** with Drizzle ORM
- **Automatic migrations** tracked in `drizzle/migrations/`

### Database Commands

```bash
# Generate new migration from schema changes
npm run drizzle:generate

# Apply pending migrations to database
npm run drizzle:migrate

# View migrations log
npm run drizzle:status

# Open Prisma Studio (if using Prisma)
npm run studio
```

### Connect to Database

Use the Supabase connection string from your `.env`:
```bash
psql $DATABASE_URL
```

---

## 📜 NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (hot reload) |
| `npm run build` | Build for production (optimized) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint code quality checks |
| `npm run drizzle:generate` | Generate SQL migration from schema |
| `npm run drizzle:migrate` | Apply migrations to database |

---

## 🔐 Authentication Flow

1. **Sign Up** → User registers with email → Verification link sent
2. **Email Verification** → User clicks link → Session established
3. **Protected Routes** → Logged-in users redirected from `/auth` → Can view profile details
4. **Session Persistence** → Token stored in Supabase → Auto-restore on page refresh
5. **Sign Out** → Clears tokens → Redirects to `/auth`

**Auth Components:**
- [src/pages/Authentication/Form.jsx](src/pages/Authentication/Form.jsx) – Login/Register form with validation
- [src/pages/Authentication/Protected.jsx](src/pages/Authentication/Protected.jsx) – Auth gate & user details display

---

## 🎨 Component Highlights

| Component | Purpose |
|-----------|---------|
| `Navbar` | Navigation with auth-aware session (avatar + logout) |
| `Hero` | Animated hero section with CTA |
| `Courses` | Course listing with filtering |
| `Placement` | Placement statistics & testimonials |
| `Footer` | Links and contact info |
| `Grainient`, `Plasma`, `Aurora` | Advanced animated backgrounds |
| `RotatingText`, `ShinyText` | Text animation effects |

---

## 🐛 Troubleshooting

### "process is not defined"
- **Cause:** Using CommonJS `process` in Vite
- **Fix:** Use `import.meta.env` instead

### Supabase connection errors
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
- Restart dev server after env changes: `npm run dev`

### Migration conflicts
- Reset migrations: `npm run drizzle:migrate` (applies all migrations in order)
- Check `drizzle/migrations/` for manual adjustments if needed

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test thoroughly
3. Commit with descriptive messages: `git commit -m "feat: add new feature"`
4. Push to your branch and open a pull request

---

## 📝 License

This project is proprietary software. All rights reserved by Breath Art Institute.

---

## 📞 Support

For issues, questions, or feature requests, contact the development team or open an issue on the project repository.

---

**Last Updated:** March 2026  
**Built with ❤️ by Breath Art Institute**
