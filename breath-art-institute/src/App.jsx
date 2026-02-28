import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense, useRef } from 'react';
import Lenis from 'lenis';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ScrollToTopButton from './components/ScrollToTopButton';

// Lazy-loaded pages — each becomes a separate JS chunk (code splitting)
const Home = lazy(() => import('./pages/Home'));
const Blogs = lazy(() => import('./pages/Blogs'));
const Careers = lazy(() => import('./pages/Careers'));
const Admission = lazy(() => import('./pages/Admission'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const Brochure = lazy(() => import('./pages/Brochure'));
const LandingPage = lazy(() => import('./pages/LandingPage'));

// Invisible fallback — preserves full height to prevent CLS
const PageLoader = () => <div className="min-h-screen" aria-hidden="true" />;

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }

    // Use Lenis for smooth top-scroll on route change, fall back to native
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    const handleBeforeUnload = () => window.scrollTo(0, 0);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
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

  useEffect(() => {
    // ── Lenis smooth scroll ──────────────────────────────────────────
    const lenis = new Lenis({
      duration: 1.4,          // animation duration in seconds
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo ease-out
      smoothWheel: true,      // smooth mouse wheel
      smoothTouch: false,     // native on touch (feels better)
      wheelMultiplier: 0.9,   // slightly slower wheel = more premium feel
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;
    window.__lenis = lenis;  // expose so navbar hash links can use lenis.scrollTo

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
          <Route path="/landing" element={
            <Suspense fallback={<PageLoader />}>
              <LandingPage />
            </Suspense>
          } />

          {/* Main Website Routes (Wrapped with Navbar/Footer) */}
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
