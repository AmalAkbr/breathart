import { motion, AnimatePresence } from 'framer-motion';
import { Facebook, Instagram, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isWhiteNav, setIsWhiteNav] = useState(false);
    const location = useLocation();
    const navLinks = ['Home', 'About', 'Courses', 'Blogs', 'Careers'];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);

            // Force white nav for blogs, careers, and courses pages
            const isInternalLightPage = ['/blogs', '/careers', '/courses', '/about', '/admission'].includes(location.pathname);

            if (isInternalLightPage) {
                setIsWhiteNav(true);
                return;
            }

            const lightSections = document.querySelectorAll('.theme-light-section');
            const navCenter = window.scrollY + 40;

            let isLight = false;
            lightSections.forEach(section => {
                const top = section.offsetTop;
                const bottom = top + section.offsetHeight;
                if (navCenter >= top && navCenter <= bottom) {
                    isLight = true;
                }
            });
            setIsWhiteNav(isLight);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [location.pathname]);

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.substring(1); // remove the '#'
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100); // Small delay to ensure the page has rendered
        }
    }, [location]);

    return (
        <>
            <nav
                className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${isWhiteNav
                    ? 'bg-white/90 backdrop-blur-xl border-slate-200 shadow-sm py-2'
                    : scrolled
                        ? 'bg-white/10 backdrop-blur-xl border-white/20 py-2'
                        : 'bg-transparent border-transparent py-4'
                    }`}
            >
                <div className={`w-full px-4 md:px-12 flex justify-between items-center transition-colors duration-300 ${isWhiteNav ? 'text-blue-900' : 'text-white'}`}>
                    {/* Logo */}
                    <Link
                        to="/"
                        onClick={(e) => {
                            if (location.pathname === '/') {
                                e.preventDefault();
                            }
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <Logo className="w-10 h-10 md:w-14 md:h-14" />
                            <div className="flex flex-col">
                                <span className="text-base md:text-xl font-heading font-bold text-gradient leading-tight">BreathArt Institute</span>
                                <span className={`text-[9px] md:text-xs tracking-widest hidden sm:block transition-colors duration-300 ${isWhiteNav ? 'text-blue-800' : 'text-slate-300'}`}>LEARN | CREATE | GROW</span>
                            </div>
                        </motion.div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center space-x-10">
                        {navLinks.map((item, index) => {
                            const isInternalPage = ['About', 'Courses', 'Blogs', 'Careers'].includes(item);
                            const path = isInternalPage ? `/${item.toLowerCase()}` : (item === 'Home' ? '/' : `/#${item.toLowerCase()}`);

                            const handleHomeClick = (e) => {
                                if (item === 'Home' && location.pathname === '/') {
                                    e.preventDefault();
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                            };

                            return (
                                <motion.div
                                    key={item}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    {isInternalPage || item === 'Home' ? (
                                        <Link
                                            to={path}
                                            onClick={handleHomeClick}
                                            className={`transition-colors duration-300 text-sm uppercase tracking-widest font-medium relative group ${isWhiteNav ? 'text-blue-900 hover:text-accent-blue' : 'text-slate-200 hover:text-white'}`}
                                        >
                                            {item}
                                            <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${isWhiteNav ? 'bg-accent-blue' : 'bg-accent-cyan'}`} />
                                        </Link>
                                    ) : (
                                        <a
                                            href={path}
                                            className={`transition-colors duration-300 text-sm uppercase tracking-widest font-medium relative group ${isWhiteNav ? 'text-blue-900 hover:text-accent-blue' : 'text-slate-200 hover:text-white'}`}
                                        >
                                            {item}
                                            <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${isWhiteNav ? 'bg-accent-blue' : 'bg-accent-cyan'}`} />
                                        </a>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className={`hidden md:flex gap-3 pr-2 border-r transition-colors duration-300 ${isWhiteNav ? 'border-blue-200' : 'border-white/10'}`}>
                            <a href="https://www.instagram.com/breathart.institute/" target="_blank" rel="noopener noreferrer" className="flex">
                                <Instagram className={`w-5 h-5 cursor-pointer transition-colors ${isWhiteNav ? 'text-blue-800 hover:text-accent-blue' : 'text-slate-300 hover:text-accent-cyan'}`} />
                            </a>
                            <a href="https://www.facebook.com/people/Breathart-institute-of-creative-technology/61579983401340/" target="_blank" rel="noopener noreferrer" className="flex">
                                <Facebook className={`w-5 h-5 cursor-pointer transition-colors ${isWhiteNav ? 'text-blue-800 hover:text-accent-blue' : 'text-slate-300 hover:text-accent-blue'}`} />
                            </a>
                        </div>
                        <Link to="/admission">
                            <motion.button
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-accent-cyan to-accent-blue text-white px-5 md:px-7 py-2.5 rounded-full font-bold shadow-lg shadow-accent-blue/20 text-sm hover:shadow-accent-cyan/40 transition-shadow"
                            >
                                Admission
                            </motion.button>
                        </Link>
                        {/* Mobile hamburger */}
                        <button
                            className={`lg:hidden p-2 rounded-lg transition-colors ${isWhiteNav ? 'text-blue-900 hover:bg-blue-100' : 'text-white hover:bg-white/10'}`}
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-2xl border-b lg:hidden overflow-hidden pt-24 ${isWhiteNav ? 'bg-white/95 border-slate-200' : 'bg-[#0a0f1a]/95 border-white/10'}`}
                    >
                        <div className="w-full px-6 pb-12 flex flex-col gap-6">
                            {navLinks.map((item) => {
                                const isInternalPage = ['About', 'Courses', 'Blogs', 'Careers'].includes(item);
                                const path = isInternalPage ? `/${item.toLowerCase()}` : (item === 'Home' ? '/' : `/#${item.toLowerCase()}`);

                                const handleHomeClick = (e) => {
                                    setMenuOpen(false);
                                    if (item === 'Home' && location.pathname === '/') {
                                        e.preventDefault();
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }
                                };

                                return isInternalPage || item === 'Home' ? (
                                    <Link
                                        key={item}
                                        to={path}
                                        onClick={handleHomeClick}
                                        className={`text-2xl font-bold py-3 border-b last:border-none transition-colors flex justify-between items-center group ${isWhiteNav ? 'text-blue-900 border-slate-100' : 'text-slate-200 border-white/5'}`}
                                    >
                                        {item}
                                        <span className={`w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${isWhiteNav ? 'bg-accent-blue' : 'bg-accent-cyan'}`} />
                                    </Link>
                                ) : (
                                    <a
                                        key={item}
                                        href={path}
                                        onClick={() => setMenuOpen(false)}
                                        className={`text-2xl font-bold py-3 border-b last:border-none transition-colors flex justify-between items-center group ${isWhiteNav ? 'text-blue-900 border-slate-100' : 'text-slate-200 border-white/5'}`}
                                    >
                                        {item}
                                        <span className={`w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${isWhiteNav ? 'bg-accent-blue' : 'bg-accent-cyan'}`} />
                                    </a>
                                );
                            })}
                            <div className="flex gap-6 pt-6">
                                <a href="https://www.instagram.com/breathart.institute/" target="_blank" rel="noopener noreferrer" className="flex">
                                    <Instagram className={`w-6 h-6 cursor-pointer transition-colors ${isWhiteNav ? 'text-blue-800 hover:text-accent-blue' : 'text-slate-400 hover:text-accent-cyan'}`} />
                                </a>
                                <a href="https://www.facebook.com/people/Breathart-institute-of-creative-technology/61579983401340/" target="_blank" rel="noopener noreferrer" className="flex">
                                    <Facebook className={`w-6 h-6 cursor-pointer transition-colors ${isWhiteNav ? 'text-blue-800 hover:text-accent-blue' : 'text-slate-400 hover:text-accent-blue'}`} />
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
