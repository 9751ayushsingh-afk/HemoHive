'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Power, Check } from 'lucide-react';

interface SwipeToOnlineProps {
    isOnline: boolean;
    onToggle: () => void;
}

export const SwipeToOnline = ({ isOnline, onToggle }: SwipeToOnlineProps) => {
    return (
        <div className="relative h-16 w-full rounded-[2rem] overflow-hidden select-none touch-none shadow-sm border border-zinc-100">
            {/* Track Background */}
            <motion.div
                className={`absolute inset-0 flex items-center justify-center transition-colors duration-500 ${isOnline ? 'bg-emerald-500' : 'bg-zinc-100'}`}
                initial={false}
                animate={{ backgroundColor: isOnline ? '#10B981' : '#F4F4F5' }}
            >
                <div className="relative z-10 font-bold tracking-widest text-sm uppercase">
                    {/* Text Container with formatted text */}
                    <span className={`transition-colors duration-300 ${isOnline ? 'text-white' : 'text-zinc-400'}`}>
                        {isOnline ? 'You are Online' : 'Swipe to Start'}
                    </span>

                    {/* Shimmer Effect for "Swipe to Start" */}
                    {!isOnline && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2 h-full skew-x-12 animate-[shimmer_2s_infinite]"></div>
                    )}
                </div>
            </motion.div>

            {/* Sliding Handle */}
            <motion.div
                className="absolute top-1 bottom-1 w-14 bg-white rounded-full shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing z-20"
                initial={{ x: 4 }} // Start position (left)
                animate={{
                    x: isOnline ? 'calc(100% - 60px)' : 4,
                    width: isOnline ? 56 : 56, // Constant width
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 300 }} // We'll rely on onDragEnd logic mostly
                dragElastic={0.05}
                dragSnapToOrigin={true} // Snap back if not completed
                onDragEnd={(e, info) => {
                    // Simple threshold logic: if dragged more than 50% width
                    const threshold = 100; // Pixel distance to trigger
                    if (!isOnline && info.offset.x > threshold) {
                        onToggle();
                    } else if (isOnline && info.offset.x < -threshold) {
                        onToggle();
                    }
                }}
            // We use layoutId to prevent layout thrashing if we were unmounting
            >
                <motion.div
                    animate={{ rotate: isOnline ? 0 : 0 }}
                    className={isOnline ? 'text-emerald-500' : 'text-zinc-400'}
                >
                    {isOnline ? <Check size={24} strokeWidth={3} /> : <Power size={24} strokeWidth={3} />}
                </motion.div>
            </motion.div>

            {/* Click Fallback Overlay (Optional, for easy testing) */}
            <div
                className="absolute inset-0 z-30 cursor-pointer opacity-0"
                onClick={onToggle}
                onAuxClick={() => { }} // dummy
            />
        </div>
    );
};
