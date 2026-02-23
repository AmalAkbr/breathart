import { motion, AnimatePresence } from 'framer-motion';
import { Facebook, Instagram, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isWhiteNav, setIsWhiteNav] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const location = useLocation();
    const navLinks = ['Home', 'About', 'Courses', 'Blogs', 'Careers'];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);

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
                onMouseLeave={() => setHoveredItem(null)}
                className={`fixed top-0 w-full z-50 transition-all duration-300 ${hoveredItem && ['Courses', 'Blogs', 'Careers', 'Contact Us'].includes(hoveredItem)
                    ? (isWhiteNav ? 'bg-white/70 backdrop-blur-3xl shadow-lg border-transparent' : 'bg-[#0a0f1a]/60 backdrop-blur-3xl shadow-xl border-transparent')
                    : isWhiteNav
                        ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm'
                        : scrolled
                            ? 'bg-white/10 backdrop-blur-xl border-b border-white/20'
                            : 'bg-transparent border-b border-transparent'
                    }`}
            >
                <div className={`w-full py-4 px-4 md:px-12 flex justify-between items-center transition-colors duration-300 ${isWhiteNav ? 'text-blue-900' : 'text-white'}`}>
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
                                            onMouseEnter={() => setHoveredItem(item)}
                                            className={`transition-colors duration-300 text-sm uppercase tracking-widest font-medium relative group py-2 ${isWhiteNav ? 'text-blue-900 hover:text-accent-blue' : 'text-slate-200 hover:text-white'}`}
                                        >
                                            {item}
                                            <span className={`absolute bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${isWhiteNav ? 'bg-accent-blue' : 'bg-accent-cyan'}`} />
                                        </Link>
                                    ) : (
                                        <a
                                            href={path}
                                            onMouseEnter={() => setHoveredItem(item)}
                                            className={`transition-colors duration-300 text-sm uppercase tracking-widest font-medium relative group py-2 ${isWhiteNav ? 'text-blue-900 hover:text-accent-blue' : 'text-slate-200 hover:text-white'}`}
                                        >
                                            {item}
                                            <span className={`absolute bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${isWhiteNav ? 'bg-accent-blue' : 'bg-accent-cyan'}`} />
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
                        <a href="#contact" onMouseEnter={() => setHoveredItem('Contact Us')}>
                            <motion.button
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-5 md:px-7 py-2.5 rounded-full font-bold text-sm transition-colors border hidden sm:block ${isWhiteNav ? 'border-blue-900/30 text-blue-900 hover:bg-blue-900/10' : 'border-white/30 text-white hover:bg-white/10'}`}
                            >
                                Contact Us
                            </motion.button>
                        </a>
                        <Link to="/admission" onMouseEnter={() => setHoveredItem(null)}>
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

            {/* Desktop Mega Menu Overlay */}
            <AnimatePresence>
                {hoveredItem && ['Courses', 'Blogs', 'Careers', 'Contact Us'].includes(hoveredItem) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        onMouseEnter={() => setHoveredItem(hoveredItem)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={`fixed top-[73px] left-0 w-full z-40 overflow-hidden hidden lg:block ${isWhiteNav ? 'bg-white/70 backdrop-blur-3xl shadow-lg' : 'bg-[#0a0f1a]/60 backdrop-blur-3xl shadow-xl shadow-black/20'}`}
                    >
                        <div className="container mx-auto px-12 py-10">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.3 }}
                                className="w-full flex justify-center"
                            >
                                {hoveredItem === 'Courses' && (
                                    <div className="flex flex-row gap-24 w-full max-w-5xl">
                                        <div className="w-full">
                                            <h4 className={`text-sm font-bold tracking-wider mb-6 uppercase ${isWhiteNav ? 'text-slate-500' : 'text-slate-400'}`}>Programs</h4>
                                            <ul className={`grid grid-cols-2 gap-x-12 gap-y-4 text-base font-medium ${isWhiteNav ? 'text-blue-900' : 'text-white'}`}>
                                                <li><Link to="/courses" className="hover:text-accent-cyan transition-colors">Master Diploma in AI Digital Marketing</Link></li>
                                                <li><Link to="/courses" className="hover:text-accent-cyan transition-colors">Diploma in AI Digital Marketing</Link></li>
                                                <li><Link to="/courses" className="hover:text-accent-cyan transition-colors">Certificate in Digital Marketing</Link></li>
                                                <li><Link to="/courses" className="hover:text-accent-cyan transition-colors">Diploma in Photography</Link></li>
                                                <li><Link to="/courses" className="hover:text-accent-cyan transition-colors">Diploma in Graphic Design</Link></li>
                                                <li><Link to="/courses" className="hover:text-accent-cyan transition-colors">Integrated Diploma in Creative Media</Link></li>
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {hoveredItem === 'Blogs' && (
                                    <div className="flex flex-row gap-24 w-full max-w-5xl">
                                        <div className="w-full">
                                            <h4 className={`text-sm font-bold tracking-wider mb-6 uppercase ${isWhiteNav ? 'text-slate-500' : 'text-slate-400'}`}>Latest Articles</h4>
                                            <ul className={`grid grid-cols-2 gap-x-12 gap-y-4 text-base font-medium ${isWhiteNav ? 'text-blue-900' : 'text-white'}`}>
                                                {[
                                                    "Start Your Journey with the Best Digital Marketing Academy in Attingal Today",
                                                    "Best Digital Marketing Courses in Attingal with 100% Practical Training",
                                                    "Enroll at the Best Digital Marketing Academy in Attingal for 100% Practical Learning",
                                                    "Why Best Digital Marketing Courses Are in High Demand in Kerala",
                                                    "Career Opportunities in Kerala After Completing a Digital Marketing Course",
                                                    "Why Digital Marketing Course in Kerala Is the Smartest Career Choice in 2026",
                                                    "Benefits of Learning AI-Powered Digital Marketing in Kerala",
                                                    "Why a Graphic Designing Course in Kerala Is a Game-Changer for Your Career",
                                                    "Top Reasons to Join the Best Digital Marketing Institute in Trivandrum",
                                                    "Scope of Digital Marketing in Kerala and International Markets",
                                                    "Best Digital Marketing Institute in Kerala – BreathArt Institute",
                                                    "Digital Marketing Course with Placement",
                                                    "Digital marketing certification",
                                                    "Digital Marketing VS Traditional Marketing",
                                                    "Future Of Digital Marketing",
                                                    "Kerala’s First Marketing Institute with UAE Expertise",
                                                    "Best Digital Marketing Course in Trivandrum"
                                                ].map((title, idx) => (
                                                    <li key={idx}>
                                                        <Link to="/blogs" className="hover:text-accent-cyan transition-colors block truncate w-full" title={title}>
                                                            {title}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {hoveredItem === 'Careers' && (
                                    <div className="flex flex-row gap-24 w-full max-w-5xl">
                                        <div>
                                            <h4 className={`text-sm font-bold tracking-wider mb-6 uppercase ${isWhiteNav ? 'text-slate-500' : 'text-slate-400'}`}>Open Roles</h4>
                                            <ul className={`space-y-4 text-lg font-medium ${isWhiteNav ? 'text-blue-900' : 'text-white'}`}>
                                                <li><Link to="/careers" className="hover:text-accent-cyan transition-colors">Video Editor</Link></li>
                                                <li><Link to="/careers" className="hover:text-accent-cyan transition-colors">Customer Care Executive</Link></li>
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {hoveredItem === 'Contact Us' && (
                                    <div className="flex justify-between w-full max-w-5xl">
                                        <div>
                                            <h4 className={`text-sm font-bold tracking-wider mb-6 uppercase ${isWhiteNav ? 'text-slate-500' : 'text-slate-400'}`}>Get In Touch</h4>
                                            <p className={`text-xl font-medium mb-1 hover:text-accent-cyan transition-colors cursor-pointer ${isWhiteNav ? 'text-blue-900' : 'text-white'}`}>+91 98765 43210</p>
                                            <p className={`text-lg mb-6 hover:text-accent-cyan transition-colors cursor-pointer ${isWhiteNav ? 'text-slate-700' : 'text-slate-300'}`}>hello@breathart.in</p>

                                            <h4 className={`text-sm font-bold tracking-wider mb-4 uppercase mt-8 ${isWhiteNav ? 'text-slate-500' : 'text-slate-400'}`}>Socials</h4>
                                            <div className="flex gap-4">
                                                <a href="https://www.instagram.com/breathart.institute/" target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 transition-colors ${isWhiteNav ? 'text-slate-700 hover:text-accent-blue' : 'text-slate-300 hover:text-accent-cyan'}`}>
                                                    <Instagram className="w-5 h-5" /> Instagram
                                                </a>
                                                <a href="https://www.facebook.com/people/Breathart-institute-of-creative-technology/61579983401340/" target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 transition-colors ${isWhiteNav ? 'text-slate-700 hover:text-accent-blue' : 'text-slate-300 hover:text-accent-blue'}`}>
                                                    <Facebook className="w-5 h-5" /> Facebook
                                                </a>
                                            </div>
                                        </div>
                                        <div className="w-[400px] h-[200px] rounded-xl overflow-hidden shadow-lg border border-white/10">
                                            <iframe
                                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3945.728925430855!2d76.87788481489728!3d8.525712793872283!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b05bbfdd98b1ba3%3A0xe54e63f9720df545!2sBreathArt%20Institute%20of%20Creative%20Technology!5e0!3m2!1sen!2sae!4v1707567839353!5m2!1sen!2sae"
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                allowFullScreen=""
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                                title="BreathArt Institute Location"
                                            ></iframe>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
