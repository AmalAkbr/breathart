import { motion } from 'framer-motion';

const Location = () => {
    return (
        <section className="py-20 relative overflow-hidden flex flex-col items-center justify-center">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-primary z-0" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none z-0" />

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
                            src="https://www.google.com/maps/embed?origin=mfe&pb=!1m4!2m1!1sBreathart+Institute+of+Creative+Technology+Karthika+Tower,+Opposite+Wedland+Weddings,+Attingal!5e0!6i13"
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
