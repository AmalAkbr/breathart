import React from 'react';
import { motion } from 'framer-motion';

const PillSlider = ({ totalSlides = 4, currentSlide = 0, onSlideChange }) => {
    // Determine number of segments for the dot placement
    const numDots = totalSlides;

    return (
        <div className="relative flex items-center bg-blue-50 border border-blue-200 rounded-full w-48 h-10 p-1 shadow-inner overflow-hidden mx-auto mt-12 mb-4 cursor-pointer">
            {/* Background Dots/Click Areas */}
            <div className="absolute inset-0 flex justify-between items-center px-2 z-10">
                {Array.from({ length: numDots }).map((_, index) => (
                    <div
                        key={index}
                        className={`w-10 h-8 flex justify-center items-center pointer-events-auto rounded-full transition-all`}
                        onClick={() => onSlideChange && onSlideChange(index)}
                    >
                        <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${currentSlide === index ? 'bg-transparent' : 'bg-blue-300 hover:bg-blue-400'}`}></div>
                    </div>
                ))}
            </div>

            {/* Solid white pill-shaped slider element */}
            <motion.div
                className="absolute left-[4px] bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full w-10 h-8 shadow-md shadow-blue-500/30 z-20 pointer-events-none"
                initial={false}
                animate={{
                    // Calculate translation. w-48 is 12rem (192px). w-10 is 2.5rem (40px). 
                    // Paddings are 4px on each side. Available travel distance = 192 - 8 - 40 = 144px.
                    // For `n` slides, there are `n-1` intervals. Distance per interval = 144 / (n-1).
                    x: numDots > 1 ? currentSlide * (144 / (numDots - 1)) : 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
        </div>
    );
};

export default PillSlider;
