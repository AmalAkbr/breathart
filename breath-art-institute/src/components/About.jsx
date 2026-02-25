import { motion } from 'framer-motion';
import whiskImage from '../assets/fro.jpg';
import Beams from './Beams';

const About = () => {
    return (
        <section id="about" className="py-24 relative overflow-hidden bg-bg-dark">
            {/* Wave Separator Top - transitions from the white PartnerLogos section above */}
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] z-20">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[60px] fill-white">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                </svg>
            </div>

            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-blue/5 rounded-full blur-[100px] pointer-events-none transform-gpu will-change-transform" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-cyan/5 rounded-full blur-[100px] pointer-events-none transform-gpu will-change-transform" />

            {/* Beams Background with seamless blending */}
            <div className="absolute inset-0 z-0 opacity-30 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
                <Beams
                    beamWidth={2}
                    beamHeight={15}
                    beamNumber={12}
                    lightColor="#0008f5"
                    speed={2}
                    noiseIntensity={1.75}
                    scale={0.2}
                    rotation={0}
                />
            </div>

            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Image/Visual Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        style={{ willChange: "transform, opacity" }}
                        className="relative"
                    >
                        <div className="aspect-square w-full max-w-[480px] mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 group">
                            <img
                                src={whiskImage}
                                alt="BICT Excellence"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        style={{ willChange: "transform, opacity" }}
                    >
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            style={{ willChange: "transform, opacity" }}
                            className="text-4xl lg:text-5xl font-heading font-bold mb-6 text-white leading-tight break-words"
                        >
                            <span className="text-gradient">About</span> BreathArt Institute
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            style={{ willChange: "transform, opacity" }}
                            className="text-slate-300 mb-6 text-lg break-words whitespace-normal"
                        >
                            BreathArt Institute of Creative Technology (BICT) is a premier international agency-based institute and a proud part of the renowned BreathArt Group – Dubai. We deliver global education standards through real-world, agency-driven training designed to create industry-ready digital professionals.
                        </motion.p>
                        <p className="text-slate-300 text-lg leading-relaxed break-words whitespace-normal">
                            With direct exposure to the UAE and international markets, BICT blends creativity, technology, and strategy to prepare students for high-growth careers in the global digital economy.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section >
    );
};

export default About;
