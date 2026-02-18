"use client";

import { motion } from "framer-motion";

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

import Antigravity from "../Antigravity";

const FeatureCards = () => {
    return (
        <div className="relative bg-background py-24 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Antigravity
                    count={300}
                    magnetRadius={20}
                    ringRadius={15}
                    color="#FF1A4B" // Matching the theme
                />
            </div>
            <div className="container mx-auto px-4 relative z-10">
                <h2 className="text-4xl font-bold text-text-dark mb-12">
                    Core Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="bg-white rounded-lg shadow-md overflow-hidden"
                            whileHover={{ y: -10, boxShadow: "0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="relative h-48 w-full">
                                <Image
                                    src={feature.image}
                                    alt={feature.title}
                                    layout="fill"
                                    objectFit="cover"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-black mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-black">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeatureCards;
