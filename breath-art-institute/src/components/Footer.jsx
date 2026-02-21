import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer id="contact" className="py-12 border-t border-black/40 bg-black text-white shadow-[0_-4px_30px_rgba(0,0,0,0.5)]">
            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 lg:px-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10 md:mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-2xl font-heading font-bold text-gradient mb-4">
                            BreathArt Institute
                        </h3>
                        <p className="text-slate-400 mb-6 max-w-sm">
                            Shaping future leaders through AI-powered creative education and agency-based training.
                        </p>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent-cyan/20 hover:border-accent-cyan/40 transition-colors cursor-pointer text-sm">IG</div>
                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent-blue/20 hover:border-accent-blue/40 transition-colors cursor-pointer text-sm">FB</div>
                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent-cyan/20 hover:border-accent-cyan/40 transition-colors cursor-pointer text-sm">LN</div>
                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent-blue/20 hover:border-accent-blue/40 transition-colors cursor-pointer text-sm">YT</div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-slate-400">
                            <li><Link to="/#about" className="hover:text-accent-cyan transition-colors">About Us</Link></li>
                            <li><Link to="/#courses" className="hover:text-accent-cyan transition-colors">Courses</Link></li>
                            <li><Link to="/careers" className="hover:text-accent-cyan transition-colors">Careers</Link></li>
                            <li><Link to="/blogs" className="hover:text-accent-cyan transition-colors">Blogs</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4">Get in Touch</h4>
                        <div className="space-y-4 text-slate-400 text-sm">
                            <p>
                                <strong className="block text-white">Address:</strong>
                                Karthika Tower, Attingal
                            </p>
                            <p>
                                <strong className="block text-white">Email:</strong>
                                info@breathartinstitute.in<br />
                                info@breathart.ae
                            </p>
                            <p>
                                <strong className="block text-white">Phone:</strong>
                                +91 8590 144 794
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} BreathArt Institute. All rights reserved. Part of BreathArt Group (Dubai/Ajman).
                    </p>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>📍 Located in Trivandrum, Kerala</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
