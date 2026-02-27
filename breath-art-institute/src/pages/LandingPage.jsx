import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Award, MapPin, Phone, Mail, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import ToolsCovered from '../components/ToolsCovered';
import Plasma from '../components/Plasma';
import Footer from '../components/Footer';
import insta from '../assets/instagram.webp';
import face from '../assets/facebook.png';
import photographyImage from '../assets/photography.webp';
import instituteImage from '../assets/institute.webp';
import marketingImage from '../assets/marketing.webp';
import RotatingText from '../components/RotatingText';

const LandingPage = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isWhiteNav, setIsWhiteNav] = useState(false);

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
    }, []);

    // Shared animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    return (
        <div className="min-h-screen w-full max-w-[100vw] flex flex-col bg-bg-dark text-white font-sans selection:bg-accent-cyan/30 overflow-x-hidden">

            {/* Ambient Background Accents are removed as per request for a darker background behind Plasma */}

            {/* Minimal Header (Dynamic Scroll & Theme) */}
            <header
                className={`fixed top-0 w-full z-[70] transition-all duration-300 py-3 md:py-4 px-4 md:px-8 lg:px-12 flex justify-between items-center ${isWhiteNav
                        ? 'bg-white/95 backdrop-blur-3xl shadow-lg border-b border-slate-200 text-slate-900'
                        : scrolled
                            ? 'bg-[#0a192f]/80 backdrop-blur-xl border-b border-white/10 shadow-lg text-white'
                            : 'bg-transparent border-b border-transparent text-white'
                    }`}
            >
                <div className="flex items-center gap-2 md:gap-3 transition-colors duration-300">
                    <Logo variant={isWhiteNav ? "dark" : "light"} className="w-8 h-8 md:w-10 md:h-10 text-current" />
                    <div className="flex flex-col">
                        <h1 className="font-bold text-base md:text-lg tracking-tight leading-none text-current">BreathArt</h1>
                        <span className={`text-[9px] md:text-[10px] uppercase font-bold tracking-widest mt-0.5 ${isWhiteNav ? 'text-accent-blue' : 'text-accent-cyan'}`}>Institute</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="hidden sm:flex items-center gap-3.5 mr-2">
                        <a href="https://www.instagram.com/breathart.institute/" target="_blank" rel="noopener noreferrer" className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center hover:scale-105 hover:shadow-lg transition-all cursor-pointer overflow-hidden shadow-sm">
                            <img src={insta} alt="Instagram" loading="lazy" decoding="async" className="w-full h-full object-cover scale-[1.1]" />
                        </a>
                        <a href="https://www.facebook.com/people/Breathart-institute-of-creative-technology/61579983401340/" target="_blank" rel="noopener noreferrer" className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center hover:scale-105 hover:shadow-lg transition-all cursor-pointer overflow-hidden shadow-sm">
                            <img src={face} alt="Facebook" loading="lazy" decoding="async" className="w-full h-full object-cover scale-[1.3] transform translate-y-[1px]" />
                        </a>
                    </div>
                    <Link
                        to="/admissions"
                        className={`hidden sm:flex items-center gap-2 text-xs md:text-sm font-bold transition-all border rounded-full px-4 py-2 shadow-sm whitespace-nowrap ${isWhiteNav
                                ? 'text-accent-blue hover:text-white hover:bg-accent-blue border-accent-blue bg-accent-blue/10'
                                : 'text-accent-cyan hover:text-white hover:bg-accent-cyan border-accent-cyan/50 bg-accent-cyan/10'
                            }`}
                    >
                        <span>Contact us</span>
                    </Link>
                    <Link
                        to="/"
                        className={`flex items-center gap-2 text-xs md:text-sm font-bold transition-all border rounded-full px-4 py-2 shadow-sm whitespace-nowrap ${isWhiteNav
                                ? 'text-slate-700 hover:text-accent-blue border-slate-200 hover:border-accent-blue bg-slate-100'
                                : 'text-white hover:text-accent-cyan border-white/20 hover:border-accent-cyan bg-white/5'
                            }`}
                    >
                        <span>Visit our website</span>
                    </Link>
                </div>
            </header>

            {/* Hero / About Section - Flexible Height filling remaining space */}
            <section className="relative w-full min-h-screen flex flex-col items-center justify-center text-center z-10 px-4 md:px-8 lg:px-12 pt-24 pb-12 bg-gradient-to-br from-[#020610] via-[#050b14] to-[#010308]">

                {/* Plasma Background */}
                <div className="absolute inset-0 z-0 overflow-hidden opacity-50 pointer-events-none mix-blend-screen">
                    <Plasma
                        color="#06b6d4" // Accent Cyan
                        speed={1}
                        scale={1.2}
                        opacity={1}
                        mouseInteractive={false} // Disable to avoid stealing clicks since it's behind text
                    />
                </div>

                {/* Optional subtle gradient overlay to ensure text legibility */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050b14]/50 to-[#050b14] z-0 pointer-events-none" />

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="max-w-4xl mx-auto w-full relative z-10"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/20 bg-white/5 text-slate-200 font-bold text-xs md:text-sm mb-6 md:mb-8 shadow-sm backdrop-blur-sm">
                        <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent-cyan cursor-pointer" /> <span>Transform Your Career in 2026</span>
                    </motion.div>

                    <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 md:mb-8 leading-[1.1] text-white font-heading flex flex-col items-center">
                        <div>Best Digital Marketing Academy</div>
                        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 mt-2 overflow-hidden">
                            <motion.span
                                layout
                                initial={{ y: '100%', opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200, delay: 0.2, layout: { type: "spring", damping: 25, stiffness: 200 } }}
                                className="text-slate-200 inline-block font-medium"
                            >
                                Powered by
                            </motion.span>
                            <RotatingText
                                texts={['AI', 'UAE Expertise']}
                                mainClassName="text-accent-cyan drop-shadow-sm font-bold tracking-tight inline-flex"
                                staggerFrom="center"
                                staggerDuration={0.025}
                                rotationInterval={3500}
                                initial={{ y: '70%', opacity: 0, scale: 0.95 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                exit={{ y: '-70%', opacity: 0, scale: 0.95 }}
                                transition={{ type: 'spring', damping: 22, stiffness: 220, mass: 0.6 }}
                            />
                        </div>
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed mb-4 max-w-2xl mx-auto px-4 sm:px-0">
                        Join the best digital marketing academy in Attingal. Learn SEO, Google Ads & social media marketing with expert trainers. Enroll today!
                    </motion.p>
                    <motion.p variants={fadeInUp} className="text-base sm:text-lg text-slate-400 leading-relaxed mb-8 md:mb-12 max-w-2xl mx-auto px-4 sm:px-0">
                        Learn the art of digital marketing where artificial intelligence meets UAE-specific expertise. Our institute prepares you with industry-ready skills for today's competitive market.
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4 sm:px-0 w-full sm:w-auto relative z-20">
                        <Link to="/admissions" className="w-full sm:w-auto px-6 md:px-8 py-3.5 md:py-4 rounded-full bg-gradient-to-r from-accent-cyan to-accent-blue text-white font-bold text-base md:text-lg hover:shadow-xl hover:shadow-accent-cyan/25 hover:-translate-y-1 transition-all flex justify-center items-center">
                            Enroll Now
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* Stats Row */}
            <section className="relative z-20 px-4 md:px-8 lg:px-12 py-12 md:py-20 w-full bg-bg-mid border-y border-white/5">
                <div className="max-w-[1200px] mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-0 py-8 px-6 md:px-12 rounded-3xl bg-bg-dark border border-white/10 shadow-2xl divide-y md:divide-y-0 md:divide-x divide-white/10"
                    >
                        <div className="text-center w-full md:w-1/3 py-2 md:py-0 px-4">
                            <p className="text-4xl md:text-5xl font-extrabold text-white">100%</p>
                            <p className="text-xs md:text-sm text-accent-cyan font-bold uppercase tracking-wider mt-2">Practical Training</p>
                        </div>
                        <div className="text-center w-full md:w-1/3 pt-6 pb-2 md:py-0 px-4">
                            <p className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-blue">500+</p>
                            <p className="text-xs md:text-sm text-accent-cyan font-bold uppercase tracking-wider mt-2">Happy Clients</p>
                        </div>
                        <div className="text-center w-full md:w-1/3 pt-6 pb-2 md:py-0 px-4">
                            <p className="text-4xl md:text-5xl font-extrabold text-white">24/7</p>
                            <p className="text-xs md:text-sm text-accent-cyan font-bold uppercase tracking-wider mt-2">Student Mentorship</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* BreathArt Group Section (White Theme) */}
            <section className="relative z-20 px-4 md:px-8 lg:px-12 py-16 md:py-24 w-full bg-white theme-light-section">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="border border-slate-200 rounded-3xl p-8 md:p-12 lg:p-16 relative overflow-hidden shadow-xl bg-white"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-cyan to-accent-blue z-10" />

                        <div className="relative z-10">
                            <div className="grid lg:grid-cols-[auto_1fr] gap-12 lg:gap-16 items-center">
                                {/* Images Column */}
                                <div className="flex flex-col gap-8 w-full max-w-[120px] mx-auto lg:mx-0">
                                    <div className="flex items-center justify-center">
                                        <img src={photographyImage} alt="Photography Studio" loading="lazy" decoding="async" className="w-full h-auto object-contain" />
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <img src={instituteImage} alt="Education Institute" loading="lazy" decoding="async" className="w-full h-auto object-contain" />
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <img src={marketingImage} alt="Digital Marketing" loading="lazy" decoding="async" className="w-full h-auto object-contain" />
                                    </div>
                                </div>

                                {/* Text Column */}
                                <div className="flex flex-col justify-center">
                                    <h3 className="text-3xl md:text-4xl font-bold mb-8 text-slate-900 text-left">BreathArt Group</h3>

                                    <div className="space-y-6 text-slate-600 text-lg leading-relaxed text-left">
                                        <p>
                                            <strong className="text-accent-cyan font-bold">BreathArt Group</strong> is a UAE-based creative and business group offering a complete ecosystem of AI-powered digital marketing, branding solutions, education institutes, professional photography studios, and business consultancy services.
                                        </p>
                                        <p>
                                            Founded in 2024 in the United Arab Emirates, BreathArt Group has expanded its operations to India and global markets, supporting brands and individuals across multiple industries. Our integrated approach helps businesses achieve strong online visibility, high-quality lead generation, and long-term brand growth.
                                        </p>
                                        <p>
                                            With a growing international presence, we have successfully served more than <strong className="text-slate-900">500 happy clients worldwide</strong>, delivering measurable results and creating new business opportunities every month across the globe.
                                        </p>
                                        <p className="text-xl text-slate-800 font-medium mt-8 pt-8 border-t border-slate-200">
                                            At BreathArt Group, we focus on transforming companies into brands by combining strategic marketing, creative innovation, advanced AI solutions, and industry-focused education.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Tools We Cover Section (Re-used from main site) */}
            <ToolsCovered />

            {/* 500+ Happy Clients Section */}
            <section className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-b from-bg-dark via-bg-mid to-bg-dark text-white">
                <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-accent-cyan/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 md:mb-8 border border-accent-cyan/20 shadow-xl">
                            <Award className="w-8 h-8 md:w-10 md:h-10 text-accent-cyan" />
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6">Trusted By <span className="text-accent-cyan">500+</span> Global Clients</h2>
                        <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-12 px-4 sm:px-0 font-medium">
                            Our agency wing has delivered successful campaigns, branding, and development for over 500 businesses worldwide. As a student, you'll learn the exact strategies we use for our paying clients.
                        </p>

                        {/* Decorative Logos Marquee */}
                        <div className="w-full overflow-hidden flex whitespace-nowrap relative py-4">
                            {/* Gradient fades for marquee */}
                            <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-bg-mid to-transparent z-10" />
                            <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-bg-mid to-transparent z-10" />

                            <div className="animate-marquee flex gap-12 md:gap-20 items-center opacity-40">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="text-2xl md:text-3xl font-black text-slate-500 tracking-tighter uppercase shrink-0 select-none">
                                        Client Brand {i + 1}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Contact & Map Section */}
            <section id="contact" className="py-12 md:py-16 px-4 md:px-8 lg:px-12 bg-bg-mid relative z-10 border-b border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-stretch">

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1 flex flex-col justify-center max-w-xl lg:max-w-none mx-auto lg:mx-0 w-full"
                    >
                        <span className="text-accent-cyan font-bold tracking-widest uppercase text-xs md:text-sm mb-3 block text-center lg:text-left">Enrollment</span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 text-white leading-tight text-center lg:text-left">Start Your <br className="hidden md:block" />Journey Today</h2>
                        <p className="text-slate-300 text-base md:text-lg mb-8 md:mb-10 text-center lg:text-left">Admissions are open for the upcoming batch. Get in touch with our counselors to find the right program for you.</p>

                        <div className="space-y-4 md:space-y-6">
                            <a href="tel:+918590144794" className="flex items-center gap-4 group p-4 md:p-5 rounded-2xl bg-white/5 border border-white/10 shadow-sm hover:border-accent-blue hover:shadow-xl hover:shadow-accent-blue/10 hover:bg-white/10 transition-all w-full backdrop-blur-sm">
                                <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-xl bg-accent-blue/20 flex items-center justify-center group-hover:bg-accent-blue group-hover:text-white transition-colors text-accent-cyan">
                                    <Phone className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs md:text-sm text-slate-400 mb-0.5 font-medium uppercase tracking-wider">Call Us Now</p>
                                    <p className="text-lg md:text-xl font-bold text-white truncate">+91 8590 144 794</p>
                                </div>
                            </a>

                            <a href="mailto:info@breathartinstitute.in" className="flex items-center gap-4 group p-4 md:p-5 rounded-2xl bg-white/5 border border-white/10 shadow-sm hover:border-accent-cyan hover:shadow-xl hover:shadow-accent-cyan/10 hover:bg-white/10 transition-all w-full backdrop-blur-sm">
                                <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-xl bg-accent-cyan/20 flex items-center justify-center group-hover:bg-accent-cyan group-hover:text-white transition-colors text-accent-cyan">
                                    <Mail className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs md:text-sm text-slate-400 mb-0.5 font-medium uppercase tracking-wider">Email Us</p>
                                    <p className="text-base md:text-lg font-bold text-white truncate block">info@breathartinstitute.in</p>
                                </div>
                            </a>

                            <div className="flex items-center gap-4 group p-4 md:p-5 rounded-2xl bg-white/5 border border-white/10 w-full backdrop-blur-sm">
                                <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-xl bg-white/10 flex items-center justify-center text-slate-300">
                                    <MapPin className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs md:text-sm text-slate-400 mb-0.5 font-medium uppercase tracking-wider">Location</p>
                                    <p className="text-sm md:text-base font-bold text-white">Karthika Tower, Attingal, Trivandrum</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Google Map */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1 w-full max-w-xl lg:max-w-none mx-auto min-h-[350px] md:min-h-[450px] lg:min-h-full rounded-3xl overflow-hidden shadow-xl shadow-accent-cyan/5 border border-white/10 relative group"
                    >
                        <div className="absolute inset-0 bg-bg-dark animate-pulse -z-10" />
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3945.728925430855!2d76.87788481489728!3d8.525712793872283!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b05bbfdd98b1ba3%3A0xe54e63f9720df545!2sBreathArt%20Institute%20of%20Creative%20Technology!5e0!3m2!1sen!2sae!4v1707567839353!5m2!1sen!2sae"
                            width="100%"
                            height="100%"
                            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(80%)' }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="BreathArt Institute Location"
                            className="w-full h-full min-h-[350px] object-cover"
                        ></iframe>
                        <div className="absolute inset-0 bg-accent-blue/10 pointer-events-none group-hover:bg-transparent transition-colors duration-300 mix-blend-overlay" />
                    </motion.div>

                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;
