'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const PulseBackground = ({ isOnline }: { isOnline: boolean }) => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-gray-50">
            {/* Ambient Gradient Base */}
            <div className={`absolute inset-0 transition-colors duration-1000 ${isOnline ? 'bg-emerald-50/50' : 'bg-gray-50'}`} />

            {/* Blob 1: Primary Status Color - HIDDEN ON MOBILE */}
            <motion.div
                animate={{
                    x: [0, 100, -50, 0],
                    y: [0, -50, 50, 0],
                    scale: [1, 1.2, 0.9, 1],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                className={`hidden md:block absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] opacity-40 mix-blend-multiply transition-colors duration-1000 ${isOnline ? 'bg-emerald-200' : 'bg-rose-200'}`}
            />

            {/* Blob 2: Secondary Accent - HIDDEN ON MOBILE */}
            <motion.div
                animate={{
                    x: [0, -70, 30, 0],
                    y: [0, 80, -40, 0],
                    scale: [1, 1.1, 0.8, 1],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className={`hidden md:block absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[80px] opacity-40 mix-blend-multiply transition-colors duration-1000 ${isOnline ? 'bg-blue-200' : 'bg-indigo-200'}`}
            />

            {/* Blob 3: Moving Accent - HIDDEN ON MOBILE */}
            <motion.div
                animate={{
                    x: [0, 150, -100, 0],
                    y: [0, -100, 100, 0],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
                className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[60px] opacity-30 mix-blend-multiply bg-purple-200"
            />
        </div>
    );
};
