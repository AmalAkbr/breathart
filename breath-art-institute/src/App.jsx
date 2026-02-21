import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Blogs from './pages/Blogs';
import Careers from './pages/Careers';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Prevent the browser from restoring the previous scroll position
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // Force scroll to top on every route change and initial load
    window.scrollTo(0, 0);
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
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/careers" element={<Careers />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App
