import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLightBg, setIsLightBg] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.pageYOffset > 300);

            // Detect if the button is over a light section
            const buttonY = window.innerHeight - 32 - 24; // bottom-8 (32px) + half button height (~24px)
            const scrollY = window.scrollY + buttonY;

            const lightSections = document.querySelectorAll('.theme-light-section');
            let onLight = false;
            lightSections.forEach(section => {
                const top = section.offsetTop;
                const bottom = top + section.offsetHeight;
                if (scrollY >= top && scrollY <= bottom) {
                    onLight = true;
                }
            });
            setIsLightBg(onLight);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.5, x: -20 }}
                    onClick={scrollToTop}
                    className={`fixed bottom-8 left-8 z-[999] p-3 rounded-full backdrop-blur-md border shadow-xl hover:scale-110 transition-all group ${isLightBg
                            ? 'bg-slate-900/20 border-slate-900/20 text-slate-800 shadow-black/10 hover:bg-slate-900/30'
                            : 'bg-accent-cyan/20 border-white/20 text-white shadow-black/20 hover:bg-accent-cyan/40'
                        }`}
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />

                    {/* Tooltip */}
                    <span className={`absolute left-full ml-4 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none ${isLightBg ? 'bg-slate-800 text-white' : 'bg-black/80 text-white'
                        }`}>
                        Scroll to top
                    </span>
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default ScrollToTopButton;
