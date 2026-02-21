import { motion } from 'framer-motion';

const Logo = ({ className }) => {
    return (
        <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                    <motion.stop
                        offset="0%"
                        animate={{
                            stopColor: ["#06b6d4", "#3b82f6", "#06b6d4"],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                    <motion.stop
                        offset="100%"
                        animate={{
                            stopColor: ["#3b82f6", "#06b6d4", "#3b82f6"],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                </linearGradient>
            </defs>

            {/* Background */}
            <rect width="200" height="200" rx="40" fill="url(#logo-gradient)" />

            {/* M / Eye Shape */}
            <path d="M60 70C60 60 70 50 85 50H115C130 50 140 60 140 70V100H130V70C130 65 125 60 115 60H85C75 60 70 65 70 70V100H60V70Z" fill="white" />
            <circle cx="100" cy="90" r="15" stroke="white" strokeWidth="8" />
            <circle cx="100" cy="90" r="5" fill="white" />

            {/* Text */}
            <text x="100" y="140" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="28" fill="white" textAnchor="middle" letterSpacing="2">BICT</text>
            <text x="100" y="160" fontFamily="Arial, sans-serif" fontSize="8" fill="white" textAnchor="middle" letterSpacing="1" opacity="0.8">LEARN - CREATE - GROW</text>

            {/* Circular Ring Segment */}
            <path d="M30 100A70 70 0 1 1 150 150" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />

            {/* Pen Nib Icon */}
            <path d="M150 150L160 140L170 150L160 170L150 150ZM160 155V170" stroke="white" strokeWidth="2" fill="none" />
        </svg>
    );
};

export default Logo;
