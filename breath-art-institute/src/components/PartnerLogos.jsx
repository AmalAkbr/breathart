import React from 'react';
import { motion } from 'framer-motion';
import breathLogo from '../assets/breath.webp';
import ignetLogo from '../assets/ignet.webp';
import metaLogo from '../assets/meta.webp';

const logos = [
    { name: 'BreathArt', src: breathLogo },
    { name: 'IGNET', src: ignetLogo },
    { name: 'Meta', src: metaLogo },
];

const PartnerLogos = () => {
    return (
        <section className="pt-10 pb-16 bg-white overflow-hidden theme-light-section relative z-10">
            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16 relative z-10">
                <p className="text-center text-slate-500 text-xs tracking-widest uppercase mb-10 opacity-80">Trusted Partners & Affiliations</p>

                <div className="w-full max-w-[100vw] overflow-hidden relative">
                    <div className="flex overflow-hidden relative max-w-2xl mx-auto px-4 md:px-12">
                        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
                        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

                        <motion.div
                            className="flex gap-24 items-center pr-24 w-max"
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        >
                            {[...logos, ...logos, ...logos, ...logos].map((logo, index) => (
                                <div key={index} className="flex flex-col items-center hover:scale-110 transition-transform duration-500 cursor-pointer flex-shrink-0">
                                    <div className="h-14 w-auto flex items-center justify-center">
                                        <img
                                            src={logo.src}
                                            alt={logo.name}
                                            loading="lazy"
                                            decoding="async"
                                            className="h-full w-auto object-contain block filter brightness-90 hover:brightness-100 transition-all"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PartnerLogos;
