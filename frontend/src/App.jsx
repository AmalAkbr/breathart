import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useEffect, lazy, Suspense, useRef } from "react";
import Lenis from "lenis";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import ScrollToTopButton from "./components/ScrollToTopButton";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import PublicRoute from "./components/PublicRoute";
import { validateEnvironmentVariables } from "./utils/envValidator";
import { useUserStore } from "./store/userStore";
import { getAuthToken } from "./utils/apiClient";

// Lazy-loaded pages — each becomes a separate JS chunk (code splitting)
const Home = lazy(() => import("./pages/Home"));
const Terms = lazy(() => import("./pages/Terms"));
const Blogs = lazy(() => import("./pages/Blogs"));
const Careers = lazy(() => import("./pages/Careers"));
const Admission = lazy(() => import("./pages/Admission"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const Brochure = lazy(() => import("./pages/Brochure"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Profile = lazy(() => import("./pages/profile/Profile"));
const VideoViewer = lazy(() => import("./pages/Private/Viewer"));
const VideoPlayer = lazy(() => import("./pages/Private/VideoPlayer"));
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));

// MongoDB-based Auth Pages (Standalone)
const Login = lazy(() => import("./pages/Authentication/Login"));
const Register = lazy(() => import("./pages/Authentication/Register"));
const VerifyEmail = lazy(() => import("./pages/Authentication/VerifyEmail"));
const ForgotPassword = lazy(() => import("./pages/Authentication/ForgotPassword"));

// Legacy Auth Pages (to be removed)
const OldForgotPassword = lazy(() => import("./pages/Authentication/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/Authentication/ResetPassword"));

// Invisible fallback — preserves full height to prevent CLS
const PageLoader = () => <div className="min-h-screen" aria-hidden="true" />;

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    // if (window.location.hash) {
    //   window.history.replaceState(null, '', window.location.pathname);
    // }

    // Use Lenis for smooth top-scroll on route change, fall back to native
    if (!window.location.hash) {
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
    }

    const handleBeforeUnload = () => window.scrollTo(0, 0);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [pathname]);

  return null;
};

// Layout for the main website that includes global navigation and footers
const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/admission" element={<Admission />} />
          <Route path="/brochure" element={<Brochure />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </Suspense>
      <Footer />
      <WhatsAppButton />
      <ScrollToTopButton />
    </>
  );
};

function App() {
  const lenisRef = useRef(null);
  const { setUser, setLoading, logout } = useUserStore();

  // ===== RESTORE USER STATE ON APP LOAD =====
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = getAuthToken();
        console.log("[APP INIT] Token from storage:", token ? "✓" : "✗");
        
        // Check localStorage for persisted user state
        const storedState = localStorage.getItem('user-store');
        console.log("[APP INIT] Stored state:", storedState ? "✓ found" : "✗ not found");
        
        if (token && storedState) {
          const parsed = JSON.parse(storedState);
          const storedUser = parsed?.state?.user;
          const storedIsLoggedIn = parsed?.state?.isLoggedIn;
          
          console.log("[APP INIT] Hydrating from storage - user:", storedUser?.email, "isLoggedIn:", storedIsLoggedIn);
          
          if (storedUser && storedIsLoggedIn) {
            console.log('[APP INIT] ✅ Restored user state from localStorage:', storedUser.email, 'Role:', storedUser.role);
            setUser(storedUser);
          }
        } else if (!token && storedState) {
          // Token missing but state persisted - clear storage
          console.log('[APP INIT] ⚠️ Token missing, clearing stored state');
          localStorage.removeItem('user-store');
          logout();
        } else {
          console.log('[APP INIT] ℹ️ No token or stored state available');
        }
      } catch (error) {
        console.error('[APP INIT] Error restoring auth state:', error);
      } finally {
        console.log('[APP INIT] Setting loading to false');
        setLoading(false);
      }
    };

    initializeAuth();
  }, [setUser, setLoading, logout]);

  // ===== LISTEN FOR LOGOUT IN OTHER TABS =====
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'auth_token' && !e.newValue) {
        console.log('[APP] Auth token removed, clearing user store');
        logout();
        localStorage.removeItem('user-store');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [logout]);

  // Validate environment variables on app load
  useEffect(() => {
    const validation = validateEnvironmentVariables();
    if (!validation.isValid) {
      console.error('🚨 App Startup: Missing required environment variables. Check console for details.');
    }
  }, []);

  // ── Lenis smooth scroll ──────────────────────────────────────────
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4, // animation duration in seconds
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo ease-out
      smoothWheel: true, // smooth mouse wheel
      smoothTouch: false, // native on touch (feels better)
      wheelMultiplier: 0.9, // slightly slower wheel = more premium feel
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;
    window.__lenis = lenis; // expose so navbar hash links can use lenis.scrollTo

    // RAF loop
    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen text-white font-sans selection:bg-accent-cyan/30 overflow-x-hidden w-full max-w-[100vw]">
        <Routes>
          {/* Isolated Landing Page (No Navbar/Footer) */}
          <Route
            path="/landing"
            element={
              <Suspense fallback={<PageLoader />}>
                <LandingPage />
              </Suspense>
            }
          />

          {/* SEO Redirects - Root Level */}
          <Route
            path="/best-digital-marketing-courses"
            element={<Navigate to="/courses" replace />}
          />
          <Route
            path="/best-digital-marketing-course-in-trivandrum"
            element={<Navigate to="/courses" replace />}
          />
          <Route
            path="/best-institute-for-digital-marketing-with-placement-in-kerala"
            element={<Navigate to="/#placement" replace />}
          />
          <Route
            path="/breathart-group"
            element={<Navigate to="/about" replace />}
          />
          <Route
            path="/google-digital-marketing-certification"
            element={<Navigate to="/#certifications" replace />}
          />
          <Route
            path="/best-digital-marketing-institute-in-kerala"
            element={<Navigate to="/" replace />}
          />
          <Route
            path="/best-digital-marketing-academy-in-kerala"
            element={<Navigate to="/" replace />}
          />
          <Route
            path="/graphic-design-course-in-trivandrum"
            element={<Navigate to="/#graphic-design" replace />}
          />
          <Route
            path="/traditional-marketing-vs-digital-marketing"
            element={<Navigate to="/#digital-marketing-courses" replace />}
          />
          <Route
            path="/digital-marketing-blogs"
            element={<Navigate to="/blogs" replace />}
          />

          {/* Protected Video Routes */}
          <Route
            path="/videos"
            element={
              <Suspense fallback={<PageLoader />}>
                <VideoViewer />
              </Suspense>
            }
          />
          <Route
            path="/player/:videoId"
            element={
              <Suspense fallback={<PageLoader />}>
                <VideoPlayer />
              </Suspense>
            }
          />

          {/* MongoDB Auth Routes - Separate login and register pages (with Navbar) */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <>
                  <Navbar />
                  <Suspense fallback={<PageLoader />}>
                    <Login />
                  </Suspense>
                </>
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <>
                  <Navbar />
                  <Suspense fallback={<PageLoader />}>
                    <Register />
                  </Suspense>
                </>
              </PublicRoute>
            }
          />

          {/* Keep /auth for backward compatibility - redirect to /login */}
          <Route path="/auth" element={<Navigate to="/login" replace />} />

          <Route
            path="/verify-email"
            element={
              <>
                <Navbar />
                <Suspense fallback={<PageLoader />}>
                  <VerifyEmail />
                </Suspense>
              </>
            }
          />

          <Route
            path="/forgot-password"
            element={
              <Suspense fallback={<PageLoader />}>
                <ForgotPassword />
              </Suspense>
            }
          />

          {/* Legacy Auth Routes (to be deprecated) */}
          {/* Forgot Password - Standalone page (no navbar/footer) */}
          <Route
            path="/auth/forgot-password"
            element={
              <>
                <Navbar />
                <Suspense fallback={<PageLoader />}>
                  <OldForgotPassword />
                </Suspense>
              </>
            }
          />

          {/* Reset Password - Standalone page (no navbar/footer) */}
          <Route
            path="/auth/reset-password"
            element={
              <>
                <Navbar />
                <Suspense fallback={<PageLoader />}>
                  <ResetPassword />
                </Suspense>
              </>
            }
          />

          {/* Admin Dashboard - Protected by Zustand role check */}
          <Route
            path="/admin/*"
            element={
              <ProtectedAdminRoute>
                <Suspense fallback={<PageLoader />}>
                  <AdminDashboard />
                </Suspense>
              </ProtectedAdminRoute>
            }
          />

          {/* User Profile - Protected */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Suspense fallback={<PageLoader />}>
                    <Profile />
                  </Suspense>
                </>
              </ProtectedRoute>
            }
          />

          {/* Main Website Routes (Wrapped with Navbar/Footer) */}
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
