import React from 'react';
import { motion } from 'framer-motion';

// Certification Logos
import ic1 from '../assets/ic1.png';
import ic2 from '../assets/ic2.png';
import ic3 from '../assets/ic3.png';
import ic4 from '../assets/ic4.png';
import ic5 from '../assets/ic5.png';
import ic6 from '../assets/ic6.png';
import ic7 from '../assets/ic7.png';
import ic8 from '../assets/ic8.png';
import ic9 from '../assets/ic9.png';
import ic10 from '../assets/ic10.png';
import ic11 from '../assets/ic11.png';
import ic12 from '../assets/ic12.png';
import ic13 from '../assets/ic13.png';
import ic14 from '../assets/ic14.png';
import ic15 from '../assets/ic15.png';

const partnerLogos = [
    { name: 'Partner 1', url: ic1, customClass: 'h-14 md:h-20' },
    { name: 'Partner 2', url: ic2 },
    { name: 'Partner 3', url: ic3, customClass: 'h-14 md:h-20' },
    { name: 'Partner 4', url: ic4 },
    { name: 'Partner 5', url: ic5 },
    { name: 'Partner 6', url: ic6 },
    { name: 'Partner 7', url: ic7 },
    { name: 'Partner 8', url: ic8, customClass: 'h-16 md:h-24' }, // ITS icon was very large in PDF
    { name: 'Partner 9', url: ic9 },
    { name: 'Partner 10', url: ic10 },
    { name: 'Partner 11', url: ic11, customClass: 'h-6 md:h-9' },
    { name: 'Partner 12', url: ic12 },
    { name: 'Partner 13', url: ic13, customClass: 'h-6 md:h-9' },
    { name: 'Partner 14', url: ic14 },
    { name: 'Partner 15', url: ic15, customClass: 'h-6 md:h-9' },
];

const GlobalPartners = () => {
    return (
        <section className="py-8 bg-white theme-light-section relative z-20 overflow-hidden">
            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 relative">
                {/* Gradient Fades for Marquee */}
                <div className="absolute inset-y-0 left-0 w-24 md:w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-24 md:w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

                <motion.div
                    className="flex gap-16 md:gap-24 items-center w-max will-change-transform"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                >
                    {[...partnerLogos, ...partnerLogos, ...partnerLogos, ...partnerLogos].map((logo, index) => (
                        <div key={index} className="flex-shrink-0 flex items-center justify-center transition-all duration-300 hover:scale-110">
                            <img
                                src={logo.url}
                                alt={logo.name}
                                className={`${logo.customClass || 'h-10 md:h-14'} w-auto max-w-[180px] object-contain block select-none`}
                                loading="lazy"
                            />
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default GlobalPartners;
