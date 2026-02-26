import { Link } from 'react-router-dom';
import insta from '../assets/instagram.webp';
import face from '../assets/facebook.png'; // tiny (21KB), not converted
import linkedin from '../assets/linkedin.png'; // tiny (9KB), not converted
import xIcon from '../assets/X.png'; // tiny (37KB), not converted

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
                            <a href="https://www.instagram.com/breathart.institute/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent-cyan/20 hover:border-accent-cyan/40 transition-colors cursor-pointer overflow-hidden">
                                <img src={insta} alt="Instagram" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                            </a>
                            <a href="https://www.facebook.com/people/Breathart-institute-of-creative-technology/61579983401340/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent-blue/20 hover:border-accent-blue/40 transition-colors cursor-pointer overflow-hidden p-[2px]">
                                <img src={face} alt="Facebook" loading="lazy" decoding="async" className="w-full h-full object-cover rounded-[10px] scale-110" />
                            </a>
                            <a href="https://www.linkedin.com/company/breathart-marketing-agency/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent-cyan/20 hover:border-accent-cyan/40 transition-colors cursor-pointer overflow-hidden">
                                <img src={linkedin} alt="LinkedIn" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                            </a>
                            <a href="https://x.com/BreathartInd" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent-blue/20 hover:border-accent-blue/40 transition-colors cursor-pointer overflow-hidden p-[2px]">
                                <img src={xIcon} alt="X (formerly Twitter)" loading="lazy" decoding="async" className="w-full h-full object-cover rounded-[10px]" />
                            </a>
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

                <div className="border-t border-white/5 pt-6 md:pt-8 flex flex-col items-center gap-4 relative">
                    <p className="text-slate-500 text-sm md:absolute md:left-0 md:top-8">
                        © {new Date().getFullYear()} BreathArt Institute.
                    </p>

                    <div className="text-xs text-slate-500 text-center flex-1">
                        <span>
                            Developed by{' '}
                            <a
                                href="https://www.instagram.com/intellex.web?igsh=MXc4Z2Uwd243OHpqdA=="
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-accent-cyan hover:text-white transition-colors uppercase tracking-wider"
                            >
                                INTELLEX
                            </a>
                        </span>
                    </div>

                    <div className="text-xs text-slate-500 md:absolute md:right-0 md:top-8">
                        <span>📍 Located in Trivandrum, Kerala</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
