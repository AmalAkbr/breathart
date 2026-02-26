import { motion } from 'framer-motion';
import TiltedCard from './TiltedCard';
import SplitText from './SplitText';
import LightPillar from './LightPillar';
import cardBg from '../assets/whitee.jpg';

const VisionMission = () => {
    return (
        <section className="py-16 lg:py-24 relative overflow-hidden bg-gradient-to-b from-secondary via-bg-dark to-secondary">
            {/* Animated WebGL Background for entire section */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-60 mix-blend-screen [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
                <LightPillar
                    topColor="#5227FF"
                    bottomColor="#00b4d8"
                    intensity={1.0}
                    rotationSpeed={0.3}
                    interactive={true}
                    glowAmount={0.015}
                    pillarWidth={4.0}
                />
            </div>

            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-blue/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen transform-gpu will-change-transform" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-cyan/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen transform-gpu will-change-transform" />

            <div className="w-full max-w-[1100px] mx-auto px-4 md:px-12 lg:px-16 relative z-10">
                <div className="text-center mb-8 lg:mb-10">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-black text-white tracking-tight drop-shadow-lg">
                        <SplitText text="Empowering the Next Generation" delay={40} splitType="words" duration={0.8} rootMargin="-50px" />
                    </h2>
                </div>
                <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">

                    {/* Vision */}
                    <motion.div
                        initial={{ opacity: 0, x: -150 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1.2, type: "spring", bounce: 0.3 }}
                        className="w-full h-full min-h-[120px] lg:min-h-[130px]"
                    >
                        <TiltedCard
                            imageSrc={cardBg}
                            containerHeight="100%"
                            containerWidth="100%"
                            imageHeight="100%"
                            imageWidth="100%"
                            rotateAmplitude={6}
                            scaleOnHover={1.03}
                            showTooltip={false}
                            displayOverlayContent={true}
                            className="w-full h-full min-h-[120px] lg:min-h-[130px]"
                            overlayContent={
                                <div className="absolute inset-0 px-3 py-2 lg:px-5 lg:py-3 rounded-[2rem] bg-white/20 border border-white/50 overflow-hidden group hover:border-accent-cyan/70 hover:bg-white/30 transition-colors duration-700 shadow-xl shadow-black/10 flex flex-col justify-center backdrop-blur-md w-full h-full">
                                    <div className="absolute -right-20 -top-20 w-48 h-48 bg-accent-cyan/30 rounded-full blur-[40px] group-hover:bg-accent-cyan/50 group-hover:scale-150 transition-all duration-1000 ease-out z-0" />
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-cyan to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0" />

                                    <div className="relative z-10">
                                        <h3 className="text-xl lg:text-2xl font-heading font-black text-black mb-1 tracking-tight drop-shadow-sm">
                                            <SplitText text="VISION" delay={80} duration={0.8} rootMargin="-50px" />
                                        </h3>
                                        <span className="inline-block text-xs lg:text-sm text-blue-700 font-bold tracking-wide uppercase mb-1 lg:mb-2 pb-1 border-b border-blue-700/30">
                                            <SplitText text="Shaping Future Leaders" delay={30} splitType="chars" duration={0.8} />
                                        </span>
                                        <div className="text-xs lg:text-sm text-slate-900 leading-snug font-medium">
                                            <SplitText text="To become the global benchmark in AI-powered creative education, producing world-class digital professionals capable of leading the future economy from Kerala to the world stage." delay={15} splitType="chars" duration={0.5} textAlign="left" />
                                        </div>
                                    </div>
                                </div>
                            }
                        />
                    </motion.div>

                    {/* Mission */}
                    <motion.div
                        initial={{ opacity: 0, x: 150 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1.2, delay: 0.2, type: "spring", bounce: 0.3 }}
                        style={{ willChange: "transform, opacity" }}
                        className="w-full h-full min-h-[120px] lg:min-h-[130px] lg:translate-y-3"
                    >
                        <TiltedCard
                            imageSrc={cardBg}
                            containerHeight="100%"
                            containerWidth="100%"
                            imageHeight="100%"
                            imageWidth="100%"
                            rotateAmplitude={6}
                            scaleOnHover={1.03}
                            showTooltip={false}
                            displayOverlayContent={true}
                            className="w-full h-full min-h-[120px] lg:min-h-[130px]"
                            overlayContent={
                                <div className="absolute inset-0 px-3 py-2 lg:px-5 lg:py-3 rounded-[2rem] bg-white/20 border border-white/50 overflow-hidden group hover:border-accent-blue/70 hover:bg-white/30 transition-colors duration-700 shadow-xl shadow-black/10 flex flex-col justify-center backdrop-blur-md w-full h-full">
                                    <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-accent-blue/30 rounded-full blur-[40px] group-hover:bg-accent-blue/50 group-hover:scale-150 transition-all duration-1000 ease-out z-0" />
                                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-blue to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0" />

                                    <div className="relative z-10">
                                        <h3 className="text-xl lg:text-2xl font-heading font-black text-black mb-1 tracking-tight drop-shadow-sm">
                                            <SplitText text="MISSION" delay={80} duration={0.8} rootMargin="-50px" />
                                        </h3>
                                        <span className="inline-block text-xs lg:text-sm text-blue-700 font-bold tracking-wide uppercase mb-1 lg:mb-2 pb-1 border-b border-blue-700/30">
                                            <SplitText text="Empowering the World" delay={30} splitType="chars" duration={0.8} />
                                        </span>
                                        <div className="text-xs lg:text-sm text-slate-900 leading-snug font-medium">
                                            <SplitText text="To bridge creativity and technology through agency-based, real-world training so every student gains international-grade skills, mentorship, and placement support to thrive globally." delay={15} splitType="chars" duration={0.5} textAlign="left" />
                                        </div>
                                    </div>
                                </div>
                            }
                        />
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default VisionMission;
