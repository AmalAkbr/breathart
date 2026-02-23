import React from 'react';
import { motion } from 'framer-motion';

const DigitalMarketingCareer = () => {
    return (
        <section className="py-16 md:py-20 relative bg-gradient-to-b from-secondary via-tertiary to-secondary z-10">
            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16">

                <div className="text-center mb-12">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-heading font-bold text-[#55C6D9] tracking-wide"
                    >
                        Digital Marketing Career In Kerala
                    </motion.h2>
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
                    {/* Left side: YouTube Embed */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="w-full lg:w-1/2 shadow-2xl shadow-black/50 rounded-xl overflow-hidden"
                    >
                        {/* Aspect video container for responsive iframe */}
                        <div className="relative w-full aspect-video bg-slate-900 rounded-xl border border-slate-700/50">
                            <iframe
                                className="absolute top-0 left-0 w-full h-full"
                                // Replace 'dQw4w9WgXcQ' with the actual YouTube video ID for the BreathArt video
                                src="https://www.youtube.com/embed/odEB4rRC424"
                                title="Digital Marketing Course BreathArt"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </motion.div>

                    {/* Right side: Course Description Text */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="w-full lg:w-1/2 flex flex-col justify-center font-sans space-y-6 text-white text-[16px] md:text-lg leading-relaxed text-left"
                    >
                        <p>
                            Our Digital Marketing Course is designed to give students complete, practical knowledge of online marketing.
                        </p>
                        <p>
                            The program covers SEO, Social Media Marketing, Google Ads, Meta Ads, Content Marketing, Analytics, and AI powered tools, along with integrated learning in Graphic Designing, Photography, Videography, and Content Creation. Training is delivered through live projects and real campaign execution, making it ideal for students, professionals, and entrepreneurs looking to grow in the digital space.
                        </p>
                    </motion.div>
                </div>

            </div>
        </section>
    );
};

export default DigitalMarketingCareer;
