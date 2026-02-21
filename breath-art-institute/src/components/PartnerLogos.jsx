import { motion } from 'framer-motion';
import breathLogo from '../assets/breath.png';
import ignetLogo from '../assets/ignet.png';
import metaLogo from '../assets/meta.png';

const logos = [
    { name: 'BreathArt', src: breathLogo },
    { name: 'IGNET', src: ignetLogo },
    { name: 'Meta', src: metaLogo },
];

const PartnerLogos = () => {
    return (
        <section className="py-10 bg-secondary/50 backdrop-blur-md border-y border-white/5 overflow-hidden">
            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16">
                <p className="text-center text-slate-400 text-xs tracking-widest uppercase mb-10 opacity-60">Trusted Partners & Affiliations</p>

                <div className="w-full max-w-[100vw] overflow-hidden relative">
                    <div className="flex overflow-hidden relative max-w-2xl mx-auto px-4 md:px-12">
                        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-secondary/80 to-transparent z-10" />
                        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-secondary/80 to-transparent z-10" />

                        <motion.div
                            className="flex gap-24 items-center"
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        >
                            {[...logos, ...logos].map((logo, index) => (
                                <div key={index} className="flex flex-col items-center hover:scale-110 transition-transform duration-500 cursor-pointer flex-shrink-0">
                                    <div className="h-14 w-auto flex items-center justify-center">
                                        <img
                                            src={logo.src}
                                            alt={logo.name}
                                            className="h-full w-auto object-contain block filter brightness-90 hover:brightness-100 transition-all"
                                            onError={(e) => { e.target.style.display = 'none'; console.error(`Failed to load logo: ${logo.name}`); }}
                                        />
                                    </div>
                                    {logo.name === 'Meta' && (
                                        <span className="text-[10px] text-slate-500 font-medium tracking-[0.2em] mt-1 lg:mt-2 uppercase">meta</span>
                                    )}
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
