'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Droplets, Info } from 'lucide-react';

interface HolographicBloodBagProps {
    bloodGroup: string;
    units: number;
    status: string;
    expiringSoon: number;
    onClick: () => void;
}

const HolographicBloodBag: React.FC<HolographicBloodBagProps> = ({
    bloodGroup,
    units,
    status,
    expiringSoon,
    onClick
}) => {
    const [isHovered, setIsHovered] = useState(false);

    // Magnetic effect
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    // Tilt effect
    const rotateX = useTransform(mouseY, [-50, 50], [10, -10]);
    const rotateY = useTransform(mouseX, [-50, 50], [-10, 10]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(e.clientX - centerX);
        y.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    // Determine liquid fill level (max 20 units for visual)
    const fillLevel = Math.min(Math.max((units / 20) * 100, 10), 90);

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className="relative group aspect-[4/5] w-full cursor-pointer perspective-1000"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Container Bag Shape */}
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-br from-red-600/20 via-transparent to-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />

                {/* Liquid Surface */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            y: `${100 - fillLevel}%`,
                        }}
                        transition={{ type: "spring", stiffness: 30, damping: 12 }}
                        className="absolute inset-x-0 bottom-0 top-0 w-[200%] -left-1/2"
                    >
                        {/* Liquid Body */}
                        <div className="absolute inset-0 bg-gradient-to-t from-red-700/80 via-red-600/60 to-red-500/40" />

                        {/* Wave SVG */}
                        <svg
                            viewBox="0 0 100 20"
                            className="absolute -top-10 w-full h-20 fill-red-500/40 blur-[1px]"
                            preserveAspectRatio="none"
                        >
                            <motion.path
                                animate={{
                                    d: [
                                        "M0 10 Q 25 5, 50 10 T 100 10 V20 H0 Z",
                                        "M0 10 Q 25 15, 50 10 T 100 10 V20 H0 Z",
                                        "M0 10 Q 25 5, 50 10 T 100 10 V20 H0 Z",
                                    ]
                                }}
                                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                            />
                        </svg>
                    </motion.div>
                </div>

                {/* Content Overlay */}
                <div className="relative h-full flex flex-col p-6 z-10">
                    <div className="flex justify-between items-start">
                        <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/5 flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${units < 5 ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{units < 5 ? 'Low' : 'Stable'}</span>
                        </div>
                        <Droplets className="text-red-500/50 group-hover:text-red-500 transition-colors" size={20} />
                    </div>

                    <div className="flex-grow flex flex-col items-center justify-center">
                        <motion.h2
                            className="text-7xl font-black text-white font-outfit drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                            animate={{ scale: isHovered ? 1.1 : 1 }}
                        >
                            {bloodGroup}
                        </motion.h2>
                        <div className="flex items-baseline gap-1 mt-2">
                            <span className="text-3xl font-bold text-white">{units}</span>
                            <span className="text-sm font-medium text-gray-400">UNITS</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-red-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(units * 5, 100)}%` }}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            {expiringSoon > 0 ? (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-orange-400 uppercase tracking-tight">
                                    <Info size={12} />
                                    {expiringSoon} EXPRY SOON
                                </div>
                            ) : (
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                                    All Units Safe
                                </div>
                            )}
                            <motion.div
                                animate={{ x: isHovered ? 5 : 0 }}
                                className="text-[10px] font-bold text-white uppercase tracking-widest group-hover:text-red-400"
                            >
                                Details →
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Surface Shine */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-30 group-hover:opacity-50 transition-opacity" />
            </div>

            {/* Shadow */}
            <div className="absolute -bottom-4 inset-x-4 h-8 bg-black/40 blur-2xl -z-10 rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
        </motion.div>
    );
};

export default HolographicBloodBag;
