'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const DeveloperSketchReveal = () => {
    // Stage 1: Card Fade In
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setLoaded(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const developers = [
        {
            name: "AYUSH SINGH",
            role: "Founder & Lead Architect",
            img: "https://res.cloudinary.com/drwfe1mhk/image/upload/f_auto,q_auto/hemohive_assets/ayush_dev",
            id: "dev-1"
        },
        {
            name: "ANSH SHRIVASTAV",
            role: "Co-Founder & Operator",
            img: "/ansh_dev_rect.jpg",
            id: "dev-2"
        }
    ];

    return (
        <section className="relative w-full min-h-screen bg-white text-black flex flex-col md:flex-row overflow-hidden">

            {/* GLOBAL SVG FILTERS */}
            <svg className="absolute w-0 h-0 pointer-events-none">
                <defs>
                    <filter id="paper-sketch">
                        {/* 1. Generate Noise */}
                        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />

                        {/* 2. Displace the image with noise (Wiggly Lines) */}
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" result="wiggle" />

                        {/* 3. High Contrast for 'Pencil' look (Thresholding) -> Actually CSS contrast is safer/easier to tune */}
                    </filter>

                    <filter id="pencil-texture">
                        <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="3" result="noise" />
                        <feColorMatrix type="saturate" values="0" />
                        <feBlend in="SourceGraphic" mode="multiply" />
                    </filter>
                </defs>
            </svg>

            {developers.map((dev, index) => (
                <DeveloperCard
                    key={dev.id}
                    data={dev}
                    delay={index * 0.3}
                    loaded={loaded}
                />
            ))}
        </section>
    );
};

const DeveloperCard = ({ data, delay, loaded }: { data: any, delay: number, loaded: boolean }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="relative w-full md:w-1/2 h-[50vh] md:h-screen border-r border-neutral-200 last:border-r-0 group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 1. LAYER BOTTOM: REAL PHOTO (Visible when revealed) */}
            <div className="absolute inset-0 flex items-center justify-center p-10 z-0">
                <div className="relative w-full h-full max-w-md max-h-[600px] overflow-hidden shadow-sm">
                    <img
                        src={data.img}
                        alt={data.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                    />
                </div>
            </div>

            {/* 2. LAYER TOP: SKETCH VERSION (Covers the real photo initially) */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center p-10 z-10 pointer-events-none bg-white" // bg-white to hide bottom layer? No, we need transparency
                // Actually, if we just stack them:
                // If opacity of Top is 1, we see Top. If 0, we see Bottom.
                initial={{ opacity: 0 }}
                animate={{ opacity: loaded ? (isHovered ? 0 : 1) : 0 }} // Fade OUT on Hover
                transition={{ duration: 0.8, ease: "easeInOut" }}
            >
                <div className="relative w-full h-full max-w-md max-h-[600px] overflow-hidden shadow-sm bg-white">
                    {/* THE SKETCH IMAGE */}
                    <img
                        src={data.img}
                        alt={data.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                        style={{
                            // FILTER STACK:
                            // 1. Grayscale (No color)
                            // 2. Contrast (Make blacks darker, whites brighter -> Pencil)
                            // 3. Brightness (Fade out subtle greys)
                            // 4. SVG Filter (Wiggle lines for hand-drawn feel)
                            filter: 'grayscale(100%) contrast(150%) brightness(1.1) url(#paper-sketch)',
                            mixBlendMode: 'multiply' // Blend nicely if needed
                        }}
                    />
                </div>
            </motion.div>


            {/* 3. TEXT LAYER */}
            <div className="absolute bottom-10 left-10 z-20 pointer-events-none overflow-hidden mix-blend-multiply">
                {/* NAME */}
                <motion.h2
                    initial={{ y: "100%" }}
                    animate={{ y: loaded ? 0 : "100%" }}
                    transition={{ duration: 0.8, delay: delay + 0.5 }}
                    className="text-4xl md:text-6xl font-bold tracking-tighter text-black"
                >
                    {data.name}
                </motion.h2>

                {/* ROLE */}
                <div className="h-10 overflow-hidden relative mt-2">
                    <motion.p
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{
                            y: isHovered ? 0 : "100%",
                            opacity: isHovered ? 1 : 0
                        }}
                        transition={{ duration: 0.4 }}
                        className="text-lg md:text-xl font-mono text-neutral-500 tracking-widest uppercase font-semibold"
                    >
                        {data.role}
                    </motion.p>
                </div>

                {/* Tip for user (Optional, maybe remove for cleaner look) */}
            </div>

        </div>
    );
}

export default DeveloperSketchReveal;
