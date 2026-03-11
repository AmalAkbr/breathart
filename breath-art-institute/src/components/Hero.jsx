import { motion } from 'framer-motion';
import heroCharacter from '../assets/hero.webp';
import bg2 from '../assets/bg2.jpg';

import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <section 
            id="home" 
            className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16"
            style={{ 
                backgroundImage: `url(${bg2})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="absolute inset-0 bg-[#0a0f1a]/80 z-0 pointer-events-none" />
            {/* Background Gradient Blobs */}
            <div className="absolute top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-accent-blue/40 rounded-full blur-[100px] md:blur-[120px] pointer-events-none transform-gpu will-change-transform" />
            <div className="absolute bottom-0 left-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-accent-cyan/30 rounded-full blur-[100px] md:blur-[120px] pointer-events-none transform-gpu will-change-transform" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-blue-700/20 rounded-full blur-[80px] md:blur-[100px] pointer-events-none transform-gpu will-change-transform" />

            <div className="w-full px-4 md:px-12 grid lg:grid-cols-2 gap-8 md:gap-12 items-center z-10 py-12 md:py-20">
                {/* Text Content */}
                <div className="text-center lg:text-left order-2 lg:order-1">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-accent-cyan font-bold tracking-wider mb-3 uppercase text-xs md:text-sm"
                    >
                        Kerala's Most Advanced Digital Marketing Training Programme
                    </motion.h2>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-[2rem] sm:text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 text-white leading-tight break-words"
                    >
                        Kerala's Best <br />
                        <span className="text-gradient">AI-Powered</span> <br />
                        Digital Marketing &<br className="hidden sm:block" />{' '}
                        Creative Training Institute
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.4 }}
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
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="relative h-[280px] sm:h-[360px] lg:h-[70vh] w-full flex items-center justify-center order-1 lg:order-2"
                >
                    <div className="relative w-auto h-full max-h-[500px] flex items-center justify-center">
                        {/* Glow effect behind */}
                        <div className="absolute inset-0 bg-accent-blue/20 blur-[80px] rounded-full scale-75" />

                        <img
                            src={heroCharacter}
                            alt="3D Student Character"
                            fetchpriority="high"
                            decoding="async"
                            className="w-full h-full object-contain relative z-10 drop-shadow-2xl max-h-[500px]"
                        />

                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
