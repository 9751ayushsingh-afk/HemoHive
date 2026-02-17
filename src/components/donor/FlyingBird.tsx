'use client';

import React from 'react';
import { motion } from 'framer-motion';

// REVERT: LIGHTWEIGHT SLEEK BIRD (Swallow/Swift Design)
// Feature: Ground Shadows on Road (Projected)
// Feature: Clean Fade Out at Left Boundary (Avoid mid-screen fade)

export const FlyingBird = ({ delay, y, scale }: { delay: number, y: number, scale: number }) => {
    // Faster, darting flight pattern typical of smaller birds
    const uniqueDuration = 15 + Math.random() * 8;

    return (
        <motion.div
            initial={{ x: "110vw", opacity: 0 }}
            animate={{
                x: ["110vw", "-20vw"], // Clean exit to left
                y: [y, y + 30, y - 10, y + 40, y],
                opacity: [0, 1, 1, 1, 0] // Fade in -> Stay Visible -> Fade Out at End
            }}
            transition={{
                duration: uniqueDuration,
                repeat: Infinity,
                delay: delay,
                ease: "linear",
                times: [0, 0.1, 0.5, 0.9, 1] // Ensure opacity stays at 1 for 90% of flight
            }}
            className="absolute left-0 z-[100] pointer-events-none flex items-center justify-center w-full"
            style={{
                top: `${y}px`,
                transform: `scale(${scale * 0.8}) scaleX(-1)` // Smaller scale for elegance
            }}
        >
            <div className="relative">
                {/* 1. ACTUAL BIRD */}
                <motion.div
                    animate={{
                        y: [0, -5, 0],
                        rotate: [-1, 2, -1]
                    }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="relative w-16 h-16 z-20" // Bird is above
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
                        {/* SINGLE PATH WING FLAP: Elegant 'M' Shape */}
                        <motion.path
                            fill="none"
                            stroke="#1e293b" // Slate-800
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M 10 50 Q 30 20 50 50 Q 70 20 90 50" // Base 'M' (Wings Up)
                            animate={{
                                d: [
                                    "M 10 40 Q 30 10 50 50 Q 70 10 90 40", // High Upstroke (V-Shape)
                                    "M 10 50 Q 30 40 50 50 Q 70 40 90 50", // Mid Stroke (Straight)
                                    "M 10 60 Q 30 70 50 50 Q 70 70 90 60"  // Downstroke (Arc)
                                ]
                            }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                ease: "easeInOut",
                                repeatType: "reverse"
                            }}
                        />

                        {/* Small Body (Just a hint) */}
                        <circle cx="50" cy="50" r="2" fill="#1e293b" />
                    </svg>
                </motion.div>

                {/* 2. PROJECTED GROUND SHADOW (On Road) */}
                {/* Positioned far below (approx 320px) to hit road area */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.2 }}
                    transition={{ delay: 1, duration: 2 }}
                    className="absolute top-[320px] left-2 w-12 h-4 bg-black/40 rounded-full blur-[2px] z-10"
                    style={{
                        transform: 'scaleY(0.5) skewX(40deg)', // Flattened parallax perspective
                    }}
                >
                    {/* Shadow Pulse matches wing flap */}
                    <motion.div
                        animate={{ scaleX: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
                        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
                        className="w-full h-full bg-black/20 rounded-full"
                    />
                </motion.div>
            </div>
        </motion.div>
    );
};
