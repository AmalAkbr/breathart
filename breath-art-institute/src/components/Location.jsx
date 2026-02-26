import { motion } from 'framer-motion';

const Location = () => {
    return (
        <section className="relative overflow-hidden">
            <div className="w-full mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="w-full overflow-hidden"
                >
                    <div className="w-full h-[300px] sm:h-[350px] lg:h-[400px] overflow-hidden relative">
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
