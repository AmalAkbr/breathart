import { motion, AnimatePresence } from 'framer-motion';
import { Facebook, Instagram, Linkedin, Twitter, Menu, X, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
    const [contactOpen, setContactOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isWhiteNav, setIsWhiteNav] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const location = useLocation();
    const navLinks = ['Home', 'About', 'Courses', 'Our Services', 'Blogs', 'Careers', 'Brochure'];

    const openContact = () => {
        setContactOpen(true);
        setMenuOpen(false);    // close mobile drawer
        setDesktopMenuOpen(false); // close side drawer
        setHoveredItem(null);  // close mega-menu
    };

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

    // Lock background scroll whenever any overlay is visible
    useEffect(() => {
        const megaMenuOpen = hoveredItem && ['Courses', 'Our Services', 'Blogs', 'Careers', 'Contact Us'].includes(hoveredItem);
        const anyOpen = megaMenuOpen || menuOpen || desktopMenuOpen || contactOpen;

        if (anyOpen) {
            if (window.__lenis) window.__lenis.stop();
            document.body.style.overflow = 'hidden';
        } else {
            if (window.__lenis) window.__lenis.start();
            document.body.style.overflow = '';
        }

        return () => {
            if (window.__lenis) window.__lenis.start();
            document.body.style.overflow = '';
        };
    }, [hoveredItem, menuOpen, desktopMenuOpen, contactOpen]);



    return (
        <>
            <nav
                onMouseLeave={() => setHoveredItem(null)}
                className={`fixed top-0 w-full z-50 transition-all duration-300 ${hoveredItem && ['Courses', 'Our Services', 'Blogs', 'Careers', 'Contact Us'].includes(hoveredItem)
                    ? (isWhiteNav ? 'bg-white/80 backdrop-blur-3xl shadow-lg border-transparent' : 'bg-[#0a0f1a]/80 backdrop-blur-3xl shadow-xl border-transparent')
                    : isWhiteNav
                        ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm'
                        : scrolled
                            ? 'bg-[#0a192f]/80 backdrop-blur-xl border-b border-white/10 shadow-lg'
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
                            const isInternalPage = ['About', 'Courses', 'Blogs', 'Careers', 'Brochure'].includes(item);
                            const path = item === 'Our Services' ? '/#tools' : isInternalPage ? `/${item.toLowerCase().replace(' ', '-')}` : (item === 'Home' ? '/' : `/#${item.toLowerCase().replace(' ', '-')}`);

                            const handleHomeClick = (e) => {
                                if (item === 'Home') {
                                    if (location.pathname === '/') {
                                        e.preventDefault();
                                    }
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
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
                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={openContact}
                            className={`px-5 md:px-7 py-2.5 rounded-full font-bold text-sm transition-colors border hidden sm:block ${isWhiteNav ? 'border-blue-900/30 text-blue-900 hover:bg-blue-900/10' : 'border-white/30 text-white hover:bg-white/10'}`}
                        >
                            Contact Us
                        </motion.button>
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
                        {/* Desktop Menu Icon */}
                        <div
                            onClick={() => setDesktopMenuOpen(true)}
                            className={`hidden lg:flex items-center justify-center cursor-pointer transition-colors duration-300 ml-2 p-2 rounded-full ${isWhiteNav ? 'text-blue-900 hover:bg-blue-100 hover:text-accent-blue' : 'text-white hover:bg-white/10 hover:text-accent-cyan'}`}
                        >
                            <Menu className="w-6 h-6" />
                        </div>
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
                {hoveredItem && ['Courses', 'Our Services', 'Blogs', 'Careers', 'Contact Us'].includes(hoveredItem) && (
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

                                {hoveredItem === 'Our Services' && (
                                    <div className="flex flex-row gap-24 w-full max-w-5xl">
                                        <div className="w-full">
                                            <h4 className={`text-sm font-bold tracking-wider mb-6 uppercase ${isWhiteNav ? 'text-slate-500' : 'text-slate-400'}`}>Professional Services</h4>
                                            <ul className={`grid grid-cols-2 gap-x-12 gap-y-4 text-base font-medium ${isWhiteNav ? 'text-blue-900' : 'text-white'}`}>
                                                <li><Link to="/#tools" className="hover:text-accent-cyan transition-colors">Digital Marketing Solutions</Link></li>
                                                <li><Link to="/#tools" className="hover:text-accent-cyan transition-colors">Brand Identity & Strategy</Link></li>
                                                <li><Link to="/#tools" className="hover:text-accent-cyan transition-colors">Web Design & Development</Link></li>
                                                <li><Link to="/#tools" className="hover:text-accent-cyan transition-colors">Content Creation & Photography</Link></li>
                                                <li><Link to="/#tools" className="hover:text-accent-cyan transition-colors">Search Engine Optimization</Link></li>
                                                <li><Link to="/#tools" className="hover:text-accent-cyan transition-colors">Social Media Management</Link></li>
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
                                            <a href="tel:+918590144794" className={`flex items-center gap-2 text-xl font-medium mb-2 hover:text-accent-cyan transition-colors ${isWhiteNav ? 'text-blue-900' : 'text-white'}`}>
                                                <Phone className="w-5 h-5" /> +91 8590 144 794
                                            </a>
                                            <a href="mailto:info@breathartinstitute.in" className={`flex items-center gap-2 text-base mb-1 hover:text-accent-cyan transition-colors ${isWhiteNav ? 'text-slate-700' : 'text-slate-300'}`}>
                                                <Mail className="w-4 h-4" /> info@breathartinstitute.in
                                            </a>
                                            <a href="mailto:info@breathart.ae" className={`flex items-center gap-2 text-base mb-4 hover:text-accent-cyan transition-colors ${isWhiteNav ? 'text-slate-700' : 'text-slate-300'}`}>
                                                <Mail className="w-4 h-4" /> info@breathart.ae
                                            </a>
                                            <p className={`flex items-start gap-2 text-sm ${isWhiteNav ? 'text-slate-500' : 'text-slate-400'}`}>
                                                <MapPin className="w-4 h-4 mt-0.5 shrink-0" /> Karthika Tower, Attingal, Trivandrum
                                            </p>
                                            <h4 className={`text-sm font-bold tracking-wider mb-4 uppercase mt-6 ${isWhiteNav ? 'text-slate-500' : 'text-slate-400'}`}>Socials</h4>
                                            <div className="flex gap-4">
                                                <a href="https://www.instagram.com/breathart.institute/" target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 transition-colors ${isWhiteNav ? 'text-slate-700 hover:text-accent-blue' : 'text-slate-300 hover:text-accent-cyan'}`}>
                                                    <Instagram className="w-5 h-5" /> Instagram
                                                </a>
                                                <a href="https://www.facebook.com/people/Breathart-institute-of-creative-technology/61579983401340/" target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 transition-colors ${isWhiteNav ? 'text-slate-700 hover:text-accent-blue' : 'text-slate-300 hover:text-accent-blue'}`}>
                                                    <Facebook className="w-5 h-5" /> Facebook
                                                </a>
                                                <a href="https://www.linkedin.com/company/breathart-marketing-agency/" target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 transition-colors ${isWhiteNav ? 'text-slate-700 hover:text-accent-blue' : 'text-slate-300 hover:text-accent-blue'}`}>
                                                    <Linkedin className="w-5 h-5" /> LinkedIn
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

            {/* Desktop Side Drawer (Menu) */}
            <AnimatePresence>
                {desktopMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => setDesktopMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] hidden lg:block"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-screen w-[320px] bg-[#1a1f2e] border-l border-white/10 shadow-2xl z-[70] hidden lg:flex flex-col overflow-y-auto"
                        >
                            <div className="p-6 flex justify-between items-center border-b border-white/10">
                                <span className="text-white font-bold tracking-wider text-lg">MENU</span>
                                <button
                                    onClick={() => setDesktopMenuOpen(false)}
                                    className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-8 flex-grow flex flex-col gap-10">
                                <div>
                                    <h4 className="text-xs font-bold tracking-wider mb-6 uppercase text-slate-500">Quick Links</h4>
                                    <ul className="flex flex-col gap-4 text-slate-200">
                                        <li><Link to="/" onClick={() => setDesktopMenuOpen(false)} className="hover:text-accent-cyan transition-colors text-lg font-medium">Home</Link></li>
                                        <li><Link to="/about" onClick={() => setDesktopMenuOpen(false)} className="hover:text-accent-cyan transition-colors text-lg font-medium">About Us</Link></li>
                                        <li><Link to="/courses" onClick={() => setDesktopMenuOpen(false)} className="hover:text-accent-cyan transition-colors text-lg font-medium">Courses</Link></li>
                                        <li><Link to="/#tools" onClick={() => setDesktopMenuOpen(false)} className="hover:text-accent-cyan transition-colors text-lg font-medium">Our Services</Link></li>
                                        <li><Link to="/blogs" onClick={() => setDesktopMenuOpen(false)} className="hover:text-accent-cyan transition-colors text-lg font-medium">Blogs</Link></li>
                                        <li><Link to="/careers" onClick={() => setDesktopMenuOpen(false)} className="hover:text-accent-cyan transition-colors text-lg font-medium">Careers</Link></li>
                                        <li><Link to="/brochure" onClick={() => setDesktopMenuOpen(false)} className="hover:text-accent-cyan transition-colors text-lg font-medium">Brochure</Link></li>
                                        <li><Link to="/admission" onClick={() => setDesktopMenuOpen(false)} className="hover:text-accent-cyan transition-colors text-lg font-medium">Admission</Link></li>
                                        <li><button onClick={openContact} className="hover:text-accent-cyan transition-colors text-lg font-medium text-left">Contact Us</button></li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold tracking-wider mb-6 uppercase text-slate-500">Featured Info</h4>
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-sm font-bold uppercase mb-1 text-accent-cyan">Admissions Open</p>
                                            <p className="text-sm text-slate-400">Enroll now for the upcoming batch of AI Digital Marketing.</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold uppercase mb-1 text-accent-cyan">Get in Touch</p>
                                            <p className="text-sm text-slate-400">hello@breathart.in<br />+91 98765 43210</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
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
                                const isInternalPage = ['About', 'Courses', 'Blogs', 'Careers', 'Brochure'].includes(item);
                                const path = item === 'Our Services' ? '/#tools' : isInternalPage ? `/${item.toLowerCase().replace(' ', '-')}` : (item === 'Home' ? '/' : `/#${item.toLowerCase().replace(' ', '-')}`);

                                const handleHomeClick = (e) => {
                                    setMenuOpen(false);
                                    if (item === 'Home') {
                                        if (location.pathname === '/') {
                                            e.preventDefault();
                                        }
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
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
                            {/* Contact Us button in mobile menu */}
                            <button
                                onClick={openContact}
                                className={`text-2xl font-bold py-3 border-b last:border-none transition-colors flex justify-between items-center group w-full text-left ${isWhiteNav ? 'text-blue-900 border-slate-100 hover:text-accent-blue' : 'text-slate-200 border-white/5 hover:text-accent-cyan'}`}
                            >
                                Contact Us
                                <span className={`w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${isWhiteNav ? 'bg-accent-blue' : 'bg-accent-cyan'}`} />
                            </button>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Contact Us Modal Popup ── */}
            <AnimatePresence>
                {contactOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="contact-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            onClick={() => setContactOpen(false)}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90]"
                        />

                        {/* Modal */}
                        <motion.div
                            key="contact-modal"
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 20 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-[92vw] max-w-lg bg-[#0d1b2e] border border-white/10 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                                <div>
                                    <h3 className="text-white font-bold text-lg leading-tight">Get In Touch</h3>
                                    <p className="text-slate-400 text-xs mt-0.5">We're happy to hear from you</p>
                                </div>
                                <button
                                    onClick={() => setContactOpen(false)}
                                    className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="px-6 py-6 space-y-5">

                                {/* Phone */}
                                <a
                                    href="tel:+918590144794"
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-accent-cyan/40 hover:bg-accent-cyan/5 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-accent-cyan/15 flex items-center justify-center shrink-0 group-hover:bg-accent-cyan/25 transition-colors">
                                        <Phone className="w-5 h-5 text-accent-cyan" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-0.5 uppercase tracking-wider">Phone</p>
                                        <p className="text-white font-semibold">+91 8590 144 794</p>
                                    </div>
                                </a>

                                {/* WhatsApp */}
                                <a
                                    href="https://wa.me/918590144794"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-green-400/40 hover:bg-green-400/5 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0 group-hover:bg-green-500/25 transition-colors">
                                        <MessageCircle className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-0.5 uppercase tracking-wider">WhatsApp</p>
                                        <p className="text-white font-semibold">Chat with us instantly</p>
                                    </div>
                                </a>

                                {/* Emails */}
                                <div className="grid grid-cols-1 gap-3">
                                    <a
                                        href="mailto:info@breathartinstitute.in"
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-accent-blue/40 hover:bg-accent-blue/5 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-accent-blue/15 flex items-center justify-center shrink-0 group-hover:bg-accent-blue/25 transition-colors">
                                            <Mail className="w-5 h-5 text-accent-blue" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-400 mb-0.5 uppercase tracking-wider">Email (India)</p>
                                            <p className="text-white font-semibold truncate">info@breathartinstitute.in</p>
                                        </div>
                                    </a>
                                    <a
                                        href="mailto:info@breathart.ae"
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-accent-blue/40 hover:bg-accent-blue/5 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-accent-blue/15 flex items-center justify-center shrink-0 group-hover:bg-accent-blue/25 transition-colors">
                                            <Mail className="w-5 h-5 text-accent-blue" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-400 mb-0.5 uppercase tracking-wider">Email (UAE)</p>
                                            <p className="text-white font-semibold truncate">info@breathart.ae</p>
                                        </div>
                                    </a>
                                </div>

                                {/* Address */}
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-10 h-10 rounded-xl bg-slate-500/20 flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-slate-300" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-0.5 uppercase tracking-wider">Address</p>
                                        <p className="text-white font-semibold">Karthika Tower, Attingal</p>
                                        <p className="text-slate-400 text-sm">Trivandrum, Kerala</p>
                                    </div>
                                </div>

                                {/* Social links */}
                                <div className="flex gap-3 pt-1">
                                    <a href="https://www.instagram.com/breathart.institute/" target="_blank" rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-pink-500/40 hover:bg-pink-500/5 transition-all text-sm font-medium">
                                        <Instagram className="w-4 h-4" /> Instagram
                                    </a>
                                    <a href="https://www.facebook.com/people/Breathart-institute-of-creative-technology/61579983401340/" target="_blank" rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-sm font-medium">
                                        <Facebook className="w-4 h-4" /> Facebook
                                    </a>
                                    <a href="https://www.linkedin.com/company/breathart-marketing-agency/" target="_blank" rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-blue-400/40 hover:bg-blue-400/5 transition-all text-sm font-medium">
                                        <Linkedin className="w-4 h-4" /> LinkedIn
                                    </a>
                                    <a href="https://x.com/BreathartInd" target="_blank" rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-slate-400/40 hover:bg-slate-400/5 transition-all text-sm font-medium">
                                        <Twitter className="w-4 h-4" /> X
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
