"use client";

import { useScroll, useTransform, motion, useSpring } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";

const features = [
    {
        title: "Credit-Based Blood Exchange",
        description: "A decentralized credit system ensuring fair and balanced blood exchange between hospitals.",
        image: "https://res.cloudinary.com/drwfe1mhk/image/upload/f_auto,q_auto/hemohive_assets/credit",
    },
    {
        title: "Guaranteed Logistics",
        description: "Reliable and tracked transportation for time-sensitive blood units.",
        image: "https://res.cloudinary.com/drwfe1mhk/image/upload/f_auto,q_auto/hemohive_assets/delivery",
    },
    {
        title: "Aadhaar-Backed Accountability",
        description: "Verified donor and recipient identity tracking to prevent fraud and ensure traceability.",
        image: "https://res.cloudinary.com/drwfe1mhk/image/upload/f_auto,q_auto/hemohive_assets/aadhar",
    },
    {
        title: "AI-Driven Demand Forecasting",
        description: "Predictive analytics to optimize inventory and prevent shortages before they happen.",
        image: "https://res.cloudinary.com/drwfe1mhk/image/upload/f_auto,q_auto/hemohive_assets/AI_Demand",
    },
    {
        title: "Penalty & Compliance Engine",
        description: "Automated system to ensure adherence to safety protocols and regulatory standards.",
        image: "https://res.cloudinary.com/drwfe1mhk/image/upload/f_auto,q_auto/hemohive_assets/Penalty",
    },
    {
        title: "Hospital Multi-Order Dashboard",
        description: "Centralized interface for hospitals to manage multiple blood unit orders and exchanges efficiently.",
        image: "https://res.cloudinary.com/drwfe1mhk/image/upload/f_auto,q_auto/hemohive_assets/muti-hospital",
    },
    {
        title: "Cold-Chain Monitored Delivery",
        description: "Real-time temperature monitoring during transport to maintain blood quality and safety.",
        image: "https://res.cloudinary.com/drwfe1mhk/image/upload/f_auto,q_auto/hemohive_assets/cold-chain",
    },
    {
        title: "Tier-2 & Tier-3 City First",
        description: "Focused on bridging the healthcare gap in smaller cities and rural areas.",
        image: "https://res.cloudinary.com/drwfe1mhk/image/upload/f_auto,q_auto/hemohive_assets/tier_2_and_tier_3",
    },
];

// Helper to generate consistent random numbers based on index
const getRandom = (index: number) => {
    const seed = index + 1;
    // Simple pseudo-random generators
    const x = Math.sin(seed * 12.9898) * 1000;
    const y = Math.cos(seed * 78.233) * 1000;
    const r = Math.sin(seed * 43.722) * 50;

    // Spread values: X between -800 and 800, Y between -500 and 1500 (start lower)
    return {
        x: (x - Math.floor(x)) * 1600 - 800,
        y: (y - Math.floor(y)) * 1000 + 500, // Bias towards bottom (coming up)
        rotate: (r - Math.floor(r)) * 90 - 45,
    };
};

const ChaosCard = ({
    feature,
    index,
    scrollYProgress,
    isActive,
    onToggle
}: {
    feature: any;
    index: number;
    scrollYProgress: any;
    isActive: boolean;
    onToggle: () => void;
}) => {
    const { x, y, rotate } = getRandom(index);

    // Transform scroll progress (0 -> 1) into motion values
    // 0 = scattered, 1 = strict grid
    // Input range: [0, 0.8] allows it to settle before the very end of the scroll
    const translateX = useTransform(scrollYProgress, [0, 0.8], [x, 0]);
    const translateY = useTransform(scrollYProgress, [0, 0.8], [y, 0]);
    const rotateZ = useTransform(scrollYProgress, [0, 0.8], [rotate, 0]);
    const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]); // Fade in quickly
    const scale = useTransform(scrollYProgress, [0, 0.8], [0.5, 1]);

    // Add some spring physics for smoothness
    const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
    const xSpring = useSpring(translateX, springConfig);
    const ySpring = useSpring(translateY, springConfig);
    const rotateSpring = useSpring(rotateZ, springConfig);

    return (
        <motion.div
            style={{
                x: xSpring,
                y: ySpring,
                rotate: rotateSpring,
                opacity,
                scale,
            }}
            className="group bg-black rounded-xl shadow-2xl overflow-hidden relative z-10 h-80 cursor-pointer"
            onClick={onToggle}
            data-state={isActive ? "active" : "inactive"}
        >
            {/* Background Image filling the card */}
            <div className="absolute inset-0 w-full h-full grayscale group-hover:grayscale-0 group-data-[state=active]:grayscale-0 transition-all duration-700 ease-in-out">
                <Image
                    src={feature.image}
                    alt={feature.title}
                    layout="fill"
                    objectFit="cover"
                    className="transform group-hover:scale-110 group-data-[state=active]:scale-110 transition-transform duration-700"
                />
            </div>

            {/* Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 group-hover:opacity-60 group-data-[state=active]:opacity-60 transition-opacity duration-500" />

            {/* Content Overlay */}
            <div className="relative z-10 h-full flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-2 transform group-hover:-translate-y-1 group-data-[state=active]:-translate-y-1 transition-transform duration-300">
                    {feature.title}
                </h3>
                <p className="text-gray-200 text-sm opacity-0 group-hover:opacity-100 group-data-[state=active]:opacity-100 transform translate-y-4 group-hover:translate-y-0 group-data-[state=active]:translate-y-0 transition-all duration-500 delay-100">
                    {feature.description}
                </p>
            </div>
        </motion.div>
    );
};

const ChaosScroll = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "center center"], // Starts when top of section hits bottom of view, ends when center hits center
    });

    const handleCardClick = (index: number) => {
        setActiveIndex(prev => prev === index ? null : index);
    };

    return (
        <div ref={containerRef} className="bg-background py-32 min-h-screen relative overflow-hidden">

            {/* Title stays static or fades in */}
            <div className="container mx-auto px-4 mb-12 relative z-20 text-center">
                <motion.h2
                    style={{ opacity: scrollYProgress }}
                    className="text-4xl font-bold text-text-dark"
                >
                    Core Features: Order from Chaos
                </motion.h2>
                <motion.p
                    style={{ opacity: scrollYProgress }}
                    className="text-text-muted mt-4"
                >
                    Scroll to Assemble the Solution
                </motion.p>
            </div>

            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <ChaosCard
                            key={index}
                            feature={feature}
                            index={index}
                            scrollYProgress={scrollYProgress}
                            isActive={activeIndex === index}
                            onToggle={() => handleCardClick(index)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChaosScroll;
