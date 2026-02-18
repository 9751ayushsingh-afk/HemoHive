'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SplitSystemDevelopers = () => {
    // Stage 0: Initial Load
    // Stage 1: Lines animate in (0-1.5s)
    // Stage 2: Panels revealed + Text (1.5-3.5s)
    // Stage 3: Merge Animation (3.5-5.0s) -> Lines connect
    // Stage 4: Final Text Reveal (5.0s+)
    const [stage, setStage] = useState(0);

    useEffect(() => {
        const timers = [
            setTimeout(() => setStage(1), 500),
            setTimeout(() => setStage(2), 2000),
            setTimeout(() => setStage(3), 4500),
            setTimeout(() => setStage(4), 6000),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <section className="relative w-full h-screen overflow-hidden flex bg-white text-black font-sans selection:bg-black selection:text-white">

            {/* --- CENTRAL DIVIDER (The "Split") --- */}
            <motion.div
                className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-neutral-200 z-10"
                initial={{ opacity: 1, height: 0 }}
                animate={{
                    opacity: stage >= 3 ? 0 : 1,
                    height: "100%"
                }}
                transition={{ duration: 1, ease: "easeInOut" }}
            />

            {/* --- JOINT SVG LAYER (Full Screen Overlay for connection) --- */}
            {stage >= 3 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" overflow="visible">
                    {/* The "Merged" Connection Line */}
                    <motion.path
                        d="M 25% 40% C 25% 60% 50% 50% 50% 50% S 75% 60% 75% 40%" // A connection curve
                    // Actually, let's trace from the developer images to the center text
                    // Left Image center approx (25%, 30%-ish) to Center (50%, 50%) to Right Image (75%, 30%)
                    // Let's just animate the individual lines in their divs for simplicity and robustness, 
                    // OR use this overlay for the "System Line" that forms.
                    />
                </svg>
            )}

            {/* =========================================
                LEFT PANEL: AYUSH SINGH
               ========================================= */}
            <div className="relative w-full md:w-1/2 h-full flex flex-col items-center justify-center p-8 md:p-16 border-r border-transparent">
                {/* Background "Code Rain" Effect (Subtle) */}
                <div className="absolute inset-0 z-0 opacity-[0.05] overflow-hidden pointer-events-none">
                    {[...Array(10)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-[10px] font-mono top-[-20px]"
                            style={{ left: `${Math.random() * 100}%` }}
                            animate={{ y: window.innerHeight + 50 }}
                            transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}
                        >
                            01010101
                        </motion.div>
                    ))}
                </div>

                {/* The "Cable" Line - Left Side */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <svg className="w-full h-full" overflow="visible">
                        <motion.path
                            // Stage < 3: Straight down.
                            // Stage >= 3: Curves to center right (Screen Center).
                            // Screen Center relative to this panel is 100% width, 50% height (approx, where text is)
                            d={stage >= 3
                                ? "M 50% 0 C 50% 40% 100% 40% 100% 50%"
                                : "M 50% 0 L 50% 100%"}
                            fill="none"
                            stroke="black"
                            strokeWidth={stage >= 3 ? 2 : 1}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{
                                pathLength: 1,
                                opacity: stage >= 1 ? (stage >= 3 ? 0.5 : 0.2) : 0,
                                d: stage >= 3 ? "M 50% 0 C 50% 40% 100% 40% 100% 50%" : "M 50% 0 L 50% 100%"
                            }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        />

                        {/* System Node (Packet) */}
                        {stage >= 1 && (
                            <motion.circle
                                r="3"
                                fill="black"
                                style={{ offsetPath: `path("${stage >= 3 ? "M 50% 0 C 50% 40% 100% 40% 100% 50%" : "M 50% 0 L 50% 100%"}")` }}
                                animate={{ offsetDistance: ["0%", "100%"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                        )}
                    </svg>
                </div>

                <div className="z-10 flex flex-col items-center text-center mt-[-10%]"> {/* Lifted slightly */}
                    {/* Image Container */}
                    <motion.div
                        initial={{ opacity: 0, filter: "blur(10px)", scale: 0.9 }}
                        animate={{
                            opacity: stage >= 2 ? 1 : 0,
                            filter: "blur(0px)",
                            scale: 1
                        }}
                        transition={{ duration: 1 }}
                        className="w-48 h-48 md:w-64 md:h-64 mb-8 relative rounded-full overflow-hidden border border-neutral-200 shadow-xl"
                    >
                        <div className="absolute inset-0 bg-neutral-100 z-0" />
                        <img
                            src="/ayush_dev.jpg"
                            alt="Ayush Singh"
                            className="w-full h-full object-cover relative z-10 transition-all duration-700 grayscale hover:grayscale-0"
                        />
                    </motion.div>

                    {/* Text Info */}
                    <div className="overflow-hidden">
                        <motion.h2
                            initial={{ y: "100%" }}
                            animate={{ y: stage >= 2 ? 0 : "100%" }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="text-3xl md:text-5xl font-bold tracking-tighter mb-2"
                        >
                            AYUSH SINGH
                        </motion.h2>
                    </div>
                    <div className="overflow-hidden">
                        <motion.p
                            initial={{ y: "100%" }}
                            animate={{ y: stage >= 2 ? 0 : "100%" }}
                            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="text-sm md:text-base font-mono text-neutral-500 uppercase tracking-widest"
                        >
                            Founder & Lead Architect
                        </motion.p>
                    </div>
                </div>
            </div>


            {/* =========================================
                RIGHT PANEL: ANSH SHRIVASTAV
               ========================================= */}
            <div className="relative w-full md:w-1/2 h-full flex flex-col items-center justify-center p-8 md:p-16">
                {/* Background "Code Rain" Effect (Subtle) */}
                <div className="absolute inset-0 z-0 opacity-[0.05] overflow-hidden pointer-events-none">
                    {[...Array(10)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-[10px] font-mono top-[-20px]"
                            style={{ left: `${Math.random() * 100}%` }}
                            animate={{ y: window.innerHeight + 50 }}
                            transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}
                        >
                            10110010
                        </motion.div>
                    ))}
                </div>

                {/* The "Cable" Line - Right Side */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <svg className="w-full h-full" overflow="visible">
                        <motion.path
                            // Stage < 3: Straight down.
                            // Stage >= 3: Curves to center left (Screen Center).
                            // Screen Center relative to this panel is 0% width, 50% height
                            d={stage >= 3
                                ? "M 50% 0 C 50% 40% 0% 40% 0% 50%"
                                : "M 50% 0 L 50% 100%"}
                            fill="none"
                            stroke="black"
                            strokeWidth={stage >= 3 ? 2 : 1}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{
                                pathLength: 1,
                                opacity: stage >= 1 ? (stage >= 3 ? 0.5 : 0.2) : 0,
                                d: stage >= 3 ? "M 50% 0 C 50% 40% 0% 40% 0% 50%" : "M 50% 0 L 50% 100%"
                            }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        />
                        {/* System Node (Packet) */}
                        {stage >= 1 && (
                            <motion.circle
                                r="3"
                                fill="black"
                                style={{ offsetPath: `path("${stage >= 3 ? "M 50% 0 C 50% 40% 0% 40% 0% 50%" : "M 50% 0 L 50% 100%"}")` }}
                                animate={{ offsetDistance: ["0%", "100%"] }}
                                transition={{ duration: 2.3, repeat: Infinity, ease: "linear", delay: 1 }}
                            />
                        )}
                    </svg>
                </div>

                <div className="z-10 flex flex-col items-center text-center mt-[-10%]">
                    {/* Image Container */}
                    <motion.div
                        initial={{ opacity: 0, filter: "blur(10px)", scale: 0.9 }}
                        animate={{
                            opacity: stage >= 2 ? 1 : 0,
                            filter: "blur(0px)",
                            scale: 1
                        }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="w-48 h-48 md:w-64 md:h-64 mb-8 relative rounded-full overflow-hidden border border-neutral-200 shadow-xl"
                    >
                        <div className="absolute inset-0 bg-neutral-100 z-0" />
                        <img
                            src="/ansh_dev.jpg"
                            alt="Ansh Shrivastav"
                            className="w-full h-full object-cover relative z-10 transition-all duration-700 grayscale hover:grayscale-0"
                        />
                    </motion.div>

                    {/* Text Info */}
                    <div className="overflow-hidden">
                        <motion.h2
                            initial={{ y: "100%" }}
                            animate={{ y: stage >= 2 ? 0 : "100%" }}
                            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="text-3xl md:text-5xl font-bold tracking-tighter mb-2"
                        >
                            ANSH SHRIVASTAV
                        </motion.h2>
                    </div>
                    <div className="overflow-hidden">
                        <motion.p
                            initial={{ y: "100%" }}
                            animate={{ y: stage >= 2 ? 0 : "100%" }}
                            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="text-sm md:text-base font-mono text-neutral-500 uppercase tracking-widest"
                        >
                            Co-Founder & Operator
                        </motion.p>
                    </div>
                </div>
            </div>

            {/* =========================================
                STAGE 4: CENTER MERGE TAGLINE
               ========================================= */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                    opacity: stage >= 4 ? 1 : 0,
                    scale: stage >= 4 ? 1 : 0.9
                }}
                transition={{ duration: 1, delay: 0.2 }}
            >
                <div className="bg-white/95 backdrop-blur-md px-10 py-6 border border-black/10 shadow-2xl flex flex-col items-center">
                    <h3 className="text-2xl md:text-4xl text-black font-semibold text-center tracking-tight">
                        Built together. <span className="italic font-serif">Deployed as one.</span>
                    </h3>

                    {/* Active System Indicator (NOT A LOADER) */}
                    <div className="mt-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-500">System Online</span>
                    </div>

                    {/* Central Vertical Line continuing downwards */}
                    <motion.div
                        className="w-[1px] bg-black h-20 mt-4 origin-top"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                    />
                </div>
            </motion.div>

        </section>
    );
};

export default SplitSystemDevelopers;
