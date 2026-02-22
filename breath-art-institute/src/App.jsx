import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Blogs from './pages/Blogs';
import Careers from './pages/Careers';
import Admission from './pages/Admission';
import AboutUs from './pages/AboutUs';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Prevent the browser from restoring the previous scroll position
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // If reloading with a hash (like /#about), strip it to force starting at the top Hero section
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }

    // Force scroll to top on every route change and initial load
    window.scrollTo(0, 0);
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);

    // Also force scroll to top right before the page unloads/reloads
    const handleBeforeUnload = () => window.scrollTo(0, 0);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname]);

  return null;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen text-white font-sans selection:bg-accent-cyan/30 overflow-x-hidden w-full max-w-[100vw]">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/admission" element={<Admission />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App
