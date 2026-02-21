import { motion } from 'framer-motion';
import Silk from './Silk';

const Location = () => {
    return (
        <section className="py-20 relative overflow-hidden flex flex-col items-center justify-center bg-white">
            {/* Animated Silk Background */}
            <div className="absolute inset-0 z-0 bg-secondary">
                <Silk color="#ffffff" color2="#0284c7" opacity={0.65} />
            </div>

            {/* Subtle Gradient Overlay to ensure map readability */}
            <div className="absolute inset-0 bg-primary/40 z-0 pointer-events-none" />

            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16 relative z-10 flex justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-5xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-secondary/30 backdrop-blur-sm p-2"
                >
                    <div className="w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] rounded-xl overflow-hidden relative">
                        {/* Loading skeleton pulse behind the map */}
                        <div className="absolute inset-0 bg-slate-800 animate-pulse -z-10" />

                        <iframe
                            src="https://maps.google.com/maps?q=BreathArt+Institute+of+Creative+Technology,+Karthika+Tower,+Opposite+Wedland+Weddings,+Attingal&t=k&z=18&output=embed"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full h-full object-cover"
                            title="BreathArt Institute Location"
                        ></iframe>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Location;
