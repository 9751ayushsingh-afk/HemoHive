"use client";

import { motion } from "framer-motion";

export const AnimatedLogo = ({ className = "h-10" }: { className?: string }) => {
    return (
        <div className="relative inline-block overflow-hidden rounded-full"> {/* Rounded full for shimmer containment if needed, or adjust to fit logo shape */}

            {/* Pulse Animation Container */}
            <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="relative z-10"
            >
                <img src="/hemohive_logo.png" alt="HemoHive Logo" className={className} />
            </motion.div>

            {/* Shimmer Effect */}
            <motion.div
                className="absolute inset-0 z-20 pointer-events-none"
                style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                    skewX: "-20deg",
                }}
                animate={{
                    x: ["-150%", "150%"],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 3, // Pauses between shimmers
                    ease: "easeInOut",
                }}
            />
        </div>
    );
};
