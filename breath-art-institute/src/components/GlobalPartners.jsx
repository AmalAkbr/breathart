import React from 'react';
import { motion } from 'framer-motion';

// Certification Logos
import adobeLogo from '../assets/partners/adobe.png';
import appleLogo from '../assets/partners/apple.png';
import autodeskLogo from '../assets/partners/autodesk.png';
import ciscoLogo from '../assets/partners/cisco.png';
import csbLogo from '../assets/partners/csb.png';
import esbLogo from '../assets/partners/esb.png';
import ic3Logo from '../assets/partners/ic3.png';
import itsLogo from '../assets/partners/its.png';
import intuitLogo from '../assets/partners/intuit.png';
import msFundamentals from '../assets/partners/ms-fundamentals.png';
import msOffice from '../assets/partners/ms-office.png';
import msEducator from '../assets/partners/ms-educator.png';
import pmiLogo from '../assets/partners/pmi.png';
import unityLogo from '../assets/partners/unity.png';
import metaLogo from '../assets/partners/meta.png';

// Shuffled array to avoid clustering (especially Microsoft logos)
const partnerLogos = [
    { name: 'Adobe', url: adobeLogo },
    { name: 'Microsoft Fundamentals', url: msFundamentals },
    { name: 'Apple', url: appleLogo },
    { name: 'PMI', url: pmiLogo },
    { name: 'Autodesk', url: autodeskLogo },
    { name: 'Microsoft Office', url: msOffice },
    { name: 'Cisco', url: ciscoLogo },
    { name: 'Unity', url: unityLogo },
    { name: 'Communication Skills for Business', url: csbLogo },
    { name: 'Microsoft Educator', url: msEducator },
    { name: 'Entrepreneurship and Small Business', url: esbLogo },
    { name: 'Meta', url: metaLogo },
    { name: 'IC3 Digital Literacy', url: ic3Logo },
    { name: 'Intuit', url: intuitLogo },
    { name: 'Information Technology Specialist', url: itsLogo },
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
                        <div key={index} className="flex-shrink-0 flex items-center justify-center h-14 w-32 md:w-40 transition-all duration-300 hover:scale-110">
                            <img
                                src={logo.url}
                                alt={logo.name}
                                className="max-h-full max-w-full object-contain block select-none"
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
