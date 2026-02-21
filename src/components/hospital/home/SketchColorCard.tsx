'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import NextImage from 'next/image';

interface SketchColorCardProps {
    title: string;
    href: string;
    sketchImage: string;
    colorImage: string;
    description: string;
}

type RevealSide = 'top' | 'bottom' | 'left' | 'right';

const SketchColorCard: React.FC<SketchColorCardProps> = ({
    title,
    href,
    sketchImage,
    colorImage,
    description
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [revealSide, setRevealSide] = useState<RevealSide>('left');

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate distances to each edge
        const distTop = y;
        const distBottom = rect.height - y;
        const distLeft = x;
        const distRight = rect.width - x;

        // Find closest edge
        const minDist = Math.min(distTop, distBottom, distLeft, distRight);

        if (minDist === distTop) setRevealSide('top');
        else if (minDist === distBottom) setRevealSide('bottom');
        else if (minDist === distLeft) setRevealSide('left');
        else if (minDist === distRight) setRevealSide('right');

        setIsHovered(true);
    };

    const getClipPath = () => {
        if (!isHovered) {
            switch (revealSide) {
                case 'top': return "inset(0 0 100% 0)";
                case 'bottom': return "inset(100% 0 0 0)";
                case 'left': return "inset(0 100% 0 0)";
                case 'right': return "inset(0 0 0 100%)";
            }
        }
        return "inset(0 0 0 0)";
    };

    const getShineVariants = () => {
        switch (revealSide) {
            case 'left':
                return {
                    left: isHovered ? ["-20%", "120%"] : "-20%",
                    top: "0%",
                    width: "30%",
                    height: "100%",
                    rotate: "12deg",
                    background: "linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)"
                };
            case 'right':
                return {
                    left: isHovered ? ["120%", "-20%"] : "120%",
                    top: "0%",
                    width: "30%",
                    height: "100%",
                    rotate: "-12deg",
                    background: "linear-gradient(to left, transparent, rgba(255,255,255,0.4), transparent)"
                };
            case 'top':
                return {
                    top: isHovered ? ["-20%", "120%"] : "-20%",
                    left: "0%",
                    width: "100%",
                    height: "30%",
                    rotate: "0deg",
                    background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.4), transparent)"
                };
            case 'bottom':
                return {
                    top: isHovered ? ["120%", "-20%"] : "120%",
                    left: "0%",
                    width: "100%",
                    height: "30%",
                    rotate: "0deg",
                    background: "linear-gradient(to top, transparent, rgba(255,255,255,0.4), transparent)"
                };
        }
    };

    return (
        <Link href={href} className="block w-full h-full">
            <motion.div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setIsHovered(false)}
                className="relative w-full h-full min-h-[280px] overflow-hidden rounded-[2rem] bg-gray-950 border border-white/5 shadow-2xl cursor-pointer group"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
                {/* Base Layer: Sketch Image */}
                <div className="absolute inset-0 z-0">
                    <NextImage
                        src={sketchImage}
                        alt={`${title} Sketch`}
                        fill
                        className="object-cover opacity-80 group-hover:opacity-40 transition-opacity duration-700"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
                </div>

                {/* Top Layer: Color Image with Multi-Directional Reveal */}
                <motion.div
                    className="absolute inset-0 z-10 overflow-hidden"
                    initial={{ clipPath: "inset(0 100% 0 0)" }}
                    animate={{ clipPath: getClipPath() }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <NextImage
                        src={colorImage}
                        alt={`${title} Color`}
                        fill
                        className="object-cover"
                    />

                    {/* Directional Shine/Flare */}
                    <motion.div
                        className="absolute z-20 pointer-events-none"
                        animate={getShineVariants()}
                        transition={{
                            duration: 0.8,
                            delay: 0.1,
                            ease: "easeInOut",
                        }}
                    />
                </motion.div>

                {/* Decorative Overlays */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20" />

                {/* Content */}
                <div className="relative z-30 h-full flex flex-col justify-end p-8">
                    <motion.div
                        animate={{ y: isHovered ? 0 : 5 }}
                        className="space-y-2"
                    >
                        <h2 className="text-2xl font-bold text-white tracking-tight group-hover:text-red-500 transition-colors duration-300 font-outfit">
                            {title}
                        </h2>

                        <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: isHovered ? 1 : 0, height: isHovered ? "auto" : 0 }}
                            className="text-gray-400 text-sm font-medium leading-relaxed overflow-hidden font-sans tracking-tight"
                        >
                            {description}
                        </motion.p>
                    </motion.div>
                </div>

                {/* reactive Glow */}
                <div className="absolute inset-0 border border-white/10 rounded-[2rem] z-40 pointer-events-none group-hover:border-red-500/50 transition-colors duration-500" />

                {/* Dynamic Direction indicator (Subtle corner pulse) */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`absolute z-50 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]
              ${revealSide === 'top' ? 'top-4 left-1/2 -translate-x-1/2' : ''}
              ${revealSide === 'bottom' ? 'bottom-4 left-1/2 -translate-x-1/2' : ''}
              ${revealSide === 'left' ? 'left-4 top-1/2 -translate-y-1/2' : ''}
              ${revealSide === 'right' ? 'right-4 top-1/2 -translate-y-1/2' : ''}
            `}
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </Link>
    );
};

export default SketchColorCard;
