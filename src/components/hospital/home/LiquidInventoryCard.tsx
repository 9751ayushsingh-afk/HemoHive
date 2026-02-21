'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Droplets } from 'lucide-react';

interface LiquidInventoryCardProps {
    title: string;
    link: string;
}

const LiquidInventoryCard: React.FC<LiquidInventoryCardProps> = ({ title, link }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Magnetic effect for the icon
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 20, stiffness: 300 };
    const magneticX = useSpring(mouseX, springConfig);
    const magneticY = useSpring(mouseY, springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY, currentTarget } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const x = clientX - (left + width / 2);
        const y = clientY - (top + height / 2);

        // Magnetic intensity - moves the icon towards mouse
        mouseX.set(x * 0.25);
        mouseY.set(y * 0.25);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            className="relative group h-full min-h-[240px] overflow-hidden bg-gray-900/40 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl cursor-pointer"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
            {/* Atmospheric Glare */}
            <div className="absolute -inset-2 bg-gradient-to-br from-red-600/20 via-transparent to-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl" />

            {/* Liquid Wave Effect */}
            <div className="absolute inset-0 pointer-events-none select-none">
                <motion.div
                    animate={{
                        y: isHovered ? "45%" : "75%",
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 40,
                        damping: 15,
                    }}
                    className="absolute inset-0 w-[200%] h-[200%] left-[-50%]"
                >
                    <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full fill-red-600/40 blur-[2px]"
                        preserveAspectRatio="none"
                    >
                        <motion.path
                            animate={{
                                d: isHovered
                                    ? [
                                        "M0 50 Q 25 35, 50 50 T 100 50 V100 H0 Z",
                                        "M0 50 Q 25 65, 50 50 T 100 50 V100 H0 Z",
                                        "M0 50 Q 25 35, 50 50 T 100 50 V100 H0 Z"
                                    ]
                                    : [
                                        "M0 60 Q 25 55, 50 60 T 100 60 V100 H0 Z",
                                        "M0 60 Q 25 65, 50 60 T 100 60 V100 H0 Z",
                                        "M0 60 Q 25 55, 50 60 T 100 60 V100 H0 Z"
                                    ]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: isHovered ? 2.5 : 5,
                                ease: "easeInOut"
                            }}
                        />
                    </svg>
                </motion.div>

                {/* Secondary wave for depth */}
                <motion.div
                    animate={{
                        y: isHovered ? "48%" : "78%",
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 35,
                        damping: 18,
                    }}
                    className="absolute inset-0 w-[200%] h-[200%] left-[-50%] opacity-40"
                >
                    <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full fill-red-800/50"
                        preserveAspectRatio="none"
                    >
                        <motion.path
                            animate={{
                                d: isHovered
                                    ? [
                                        "M0 50 Q 25 65, 50 50 T 100 50 V100 H0 Z",
                                        "M0 50 Q 25 35, 50 50 T 100 50 V100 H0 Z",
                                        "M0 50 Q 25 65, 50 50 T 100 50 V100 H0 Z"
                                    ]
                                    : [
                                        "M0 60 Q 25 65, 50 60 T 100 60 V100 H0 Z",
                                        "M0 60 Q 25 55, 50 60 T 100 60 V100 H0 Z",
                                        "M0 60 Q 25 65, 50 60 T 100 60 V100 H0 Z"
                                    ]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: isHovered ? 3 : 6,
                                ease: "easeInOut"
                            }}
                        />
                    </svg>
                </motion.div>
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center p-8 z-10 text-center">
                <motion.div
                    style={{ x: magneticX, y: magneticY }}
                    className="mb-6 p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner group-hover:bg-red-500/10 group-hover:border-red-500/30 transition-colors duration-500"
                >
                    <Droplets className="w-10 h-10 text-red-500 group-hover:text-red-400 group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] transition-all duration-300" />
                </motion.div>

                <h3 className="text-xl font-bold text-white tracking-wide uppercase group-hover:scale-105 transition-transform duration-500">
                    {title}
                </h3>

                <div className="mt-2 h-1 w-12 bg-red-600/30 rounded-full group-hover:w-20 group-hover:bg-red-500 transition-all duration-500" />

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isHovered ? 1 : 0.6, y: isHovered ? 0 : 5 }}
                    className="mt-4 text-gray-400 text-sm font-medium tracking-tight"
                >
                    {isHovered ? "Access Real-time Stock" : "Stock & Demand"}
                </motion.p>
            </div>

            {/* Decorative details */}
            <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-red-500/20 group-hover:bg-red-500/50 transition-colors" />
            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white/5 group-hover:bg-white/20 transition-colors" />
        </motion.div>
    );
};

export default LiquidInventoryCard;
