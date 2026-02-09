"use client";

import { motion } from "framer-motion";

const MobileHero = () => {
    // Generate some random floating particles (representing abstract cells)
    const particles = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 20 + 10,
        duration: Math.random() * 10 + 10,
    }));

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
            {/* Deep Atmospheric Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#3a0e16_0%,_#000000_100%)]" />

            {/* Pulsing Gradient Mesh (simulating flow) */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-[conic-gradient(from_0deg_at_50%_50%,_#7F1D1D_0deg,_#FF2D55_120deg,_#000000_240deg,_#7F1D1D_360deg)] blur-3xl opacity-40 mix-blend-screen"
            />

            {/* Floating "Cells" */}
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-red-600 mix-blend-screen blur-md"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: `${p.size}vw`,
                        height: `${p.size}vw`,
                    }}
                    animate={{
                        y: [0, -40, 0],
                        x: [0, Math.random() * 20 - 10, 0],
                        opacity: [0.2, 0.6, 0.2],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Noise Overlay for Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%220.5%22/%3E%3C/svg%3E")' }}
            />

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_100%)] opacity-80" />
        </div>
    );
};

export default MobileHero;
