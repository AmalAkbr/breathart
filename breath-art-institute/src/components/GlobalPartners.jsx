import React from 'react';
import { motion } from 'framer-motion';

const partnerLogos = [
    { name: 'Adobe', url: 'https://breathartinstitute.in/wp-content/uploads/2025/08/1-2.png' },
    { name: 'Apple', url: 'https://breathartinstitute.in/wp-content/uploads/2025/08/2-2.png' },
    { name: 'Autodesk', url: 'https://breathartinstitute.in/wp-content/uploads/2025/08/3-2.png' },
    { name: 'Cisco', url: 'https://breathartinstitute.in/wp-content/uploads/2025/08/4-2.png' },
    { name: 'ESB', url: 'https://breathartinstitute.in/wp-content/uploads/2025/08/5-2.png' },
    { name: 'Communication Skills', url: 'https://breathartinstitute.in/wp-content/uploads/2025/08/6-2.png' }
];

const GlobalPartners = () => {
    return (
        <section className="py-12 bg-white border-y border-slate-100 theme-light-section relative z-20">
            <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
                <div className="w-full bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-slate-100 py-8 px-6 overflow-hidden relative">

                    {/* Gradient Fades for Marquee */}
                    <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                    <div className="flex overflow-hidden relative w-full">
                        <motion.div
                            className="flex gap-16 md:gap-24 items-center pr-16 md:pr-24 w-max"
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        >
                            {/* Double the array for seamless infinite scroll */}
                            {[...partnerLogos, ...partnerLogos].map((logo, index) => (
                                <div key={index} className="flex-shrink-0 flex items-center justify-center transition-all duration-300">
                                    <img
                                        src={logo.url}
                                        alt={logo.name}
                                        className="h-10 md:h-14 lg:h-16 w-auto object-contain block mix-blend-multiply"
                                        loading="lazy"
                                        onError={(e) => {
                                            // Fallback if the -2 missing or url changes
                                            e.target.src = logo.url.replace('-2.png', '-2-150x150.png');
                                        }}
                                    />
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GlobalPartners;
