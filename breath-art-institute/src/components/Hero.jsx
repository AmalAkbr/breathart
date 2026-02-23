import { motion } from 'framer-motion';
import heroCharacter from '../assets/hero.png';
import LiquidChrome from './LiquidChrome';

import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden bg-primary pt-16">
            {/* LiquidChrome Background */}
            <div className="absolute inset-0 z-0 opacity-60 [mask-image:linear-gradient(to_bottom,black_70%,transparent)]">
                <LiquidChrome
                    baseColor={[0.02, 0.05, 0.15]}
                    speed={0.15}
                    amplitude={0.4}
                    frequencyX={2}
                    frequencyY={2}
                    interactive={true}
                />
            </div>

            {/* Background Gradient Blobs */}
            <div className="absolute top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-accent-blue/40 rounded-full blur-[100px] md:blur-[120px] animate-pulse pointer-events-none transform-gpu will-change-transform" />
            <div className="absolute bottom-0 left-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-accent-cyan/30 rounded-full blur-[100px] md:blur-[120px] animate-pulse delay-1000 pointer-events-none transform-gpu will-change-transform" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-blue-700/20 rounded-full blur-[80px] md:blur-[100px] pointer-events-none transform-gpu will-change-transform" />

            <div className="w-full px-4 md:px-12 grid lg:grid-cols-2 gap-8 md:gap-12 items-center z-10 py-12 md:py-20">
                {/* Text Content */}
                <div className="text-center lg:text-left order-2 lg:order-1">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{ willChange: "transform, opacity" }}
                        className="text-accent-cyan font-bold tracking-wider mb-3 uppercase text-xs md:text-sm"
                    >
                        Kerala's Most Advanced Digital Marketing Training Programme
                    </motion.h2>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        style={{ willChange: "transform, opacity" }}
                        className="text-[2rem] sm:text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 text-white leading-tight break-words"
                    >
                        Kerala's Best <br />
                        <span className="text-gradient">AI-Powered</span> <br />
                        Digital Marketing &<br className="hidden sm:block" />{' '}
                        Creative Training Institute
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        style={{ willChange: "transform, opacity" }}
                        className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start w-full"
                    >
                        <Link to="/courses" className="bg-gradient-to-r from-accent-cyan to-accent-blue text-white px-8 py-3 rounded-full font-bold hover:shadow-lg hover:shadow-accent-cyan/30 transition-all transform-gpu hover:-translate-y-1 w-full sm:w-auto break-words whitespace-normal text-center inline-block">
                            Explore Courses
                        </Link>
                    </motion.div>
                </div>

                {/* 3D Character Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="relative h-[280px] sm:h-[360px] lg:h-[70vh] w-full flex items-center justify-center order-1 lg:order-2"
                >
                    <motion.div
                        animate={{
                            y: [0, -20, 0],
                            scale: [1, 1.02, 1]
                        }}
                        transition={{
                            y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="relative w-auto h-full max-h-[500px] flex items-center justify-center"
                    >
                        {/* Glow effect behind */}
                        <div className="absolute inset-0 bg-accent-blue/20 blur-[80px] rounded-full scale-75 animate-pulse" />

                        <img
                            src={heroCharacter}
                            alt="3D Student Character"
                            className="w-full h-full object-contain relative z-10 drop-shadow-2xl max-h-[500px]"
                        />

                        {/* Floating Badges */}
                        <motion.div
                            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute top-4 right-4 md:top-10 md:right-10 w-12 h-12 md:w-16 md:h-16 bg-secondary/90 backdrop-blur rounded-xl border border-white/10 flex items-center justify-center shadow-xl shadow-black/30 z-20"
                        >
                            <span className="text-xl md:text-2xl">🤖</span>
                        </motion.div>
                        <motion.div
                            animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            className="absolute bottom-10 left-4 md:bottom-20 md:left-10 w-10 h-10 md:w-14 md:h-14 bg-secondary/90 backdrop-blur rounded-full border border-white/10 flex items-center justify-center shadow-xl shadow-black/30 z-20"
                        >
                            <span className="text-lg md:text-xl">🚀</span>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
