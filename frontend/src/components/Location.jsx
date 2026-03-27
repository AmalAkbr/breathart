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
                            src="https://maps.google.com/maps?q=Breathart%20Institute%20of%20Creative%20Technology%20%28BICT%29%20Karthika%20Tower%2C%20Opposite%20Wedland%20Weddings%2C%20Attingal&t=m&z=13&output=embed&iwloc=near"
                            width="100%"
                            height="100%"
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full h-full object-cover border-0"
                            title="BreathArt Institute Location"
                        ></iframe>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Location;
