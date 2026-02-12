'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion';
import { ChevronRight, Check, ChevronsRight } from 'lucide-react';

interface SwipeToAcceptProps {
    onConfirm: () => void;
    label?: string;
    className?: string;
}

export const SwipeToAccept: React.FC<SwipeToAcceptProps> = ({
    onConfirm,
    label = "Swipe to Accept",
    className = ""
}) => {
    const [confirmed, setConfirmed] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);
    const [sliderWidth, setSliderWidth] = useState(0);

    // Motion values
    const x = useMotionValue(0);
    const controls = useAnimation();

    // Transform animations
    const bgOpacity = useTransform(x, [0, sliderWidth], [0, 1]);
    const textOpacity = useTransform(x, [0, sliderWidth * 0.5], [1, 0]);
    const handleScale = useTransform(x, [0, sliderWidth], [1, 0.9]);
    const shimmerOpacity = useTransform(x, [0, sliderWidth * 0.2], [1, 0]);

    useEffect(() => {
        if (containerRef.current && handleRef.current) {
            setSliderWidth(containerRef.current.offsetWidth - handleRef.current.offsetWidth - 8); // 8px padding buffer
        }
    }, []);

    // Handle drag end
    const handleDragEnd = async (_: any, info: PanInfo) => {
        if (containerRef.current) {
            const width = sliderWidth;
            // Trigger if dragged more than 75%
            if (x.get() > width * 0.75) {
                setConfirmed(true);
                await controls.start({ x: width });
                onConfirm();
            } else {
                controls.start({ x: 0 });
            }
        }
    };

    return (
        <div
            className={`relative h-[4.5rem] rounded-[2.25rem] bg-zinc-100 shadow-[inset_0_2px_6px_rgba(0,0,0,0.1)] border border-zinc-200/80 overflow-hidden select-none touch-none ${className}`}
            ref={containerRef}
        >
            {/* 1. PROGRESS FILL (Gradient) */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-rose-500 to-rose-600"
                style={{ opacity: bgOpacity }}
            />

            {/* 2. TEXT LABEL (With Masked Shimmer) */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                style={{ opacity: textOpacity }}
            >
                <div className="relative">
                    <span className="text-zinc-500 font-extrabold uppercase tracking-widest text-xs md:text-sm flex items-center gap-2">
                        {label} <ChevronsRight size={16} className="text-rose-500 animate-pulse" />
                    </span>
                    {/* Text Shimmer Overlay */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-12"
                        initial={{ x: '-150%' }}
                        animate={{ x: '150%' }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 1 }}
                        style={{ mixBlendMode: 'overlay', opacity: shimmerOpacity }}
                    />
                </div>
            </motion.div>

            {/* 3. SUCCESS STATE */}
            {confirmed && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                >
                    <span className="text-white font-black uppercase tracking-widest text-lg flex items-center gap-2 drop-shadow-md">
                        Accepted <Check size={24} strokeWidth={4} />
                    </span>
                </motion.div>
            )}

            {/* 4. DRAGGABLE HANDLE (Premium Orb) */}
            <motion.div
                ref={handleRef}
                drag={!confirmed ? "x" : false}
                dragConstraints={{ left: 0, right: sliderWidth }}
                dragElastic={0.05}
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                animate={controls}
                style={{ x, scale: handleScale }}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                className="absolute left-1 top-1 bottom-1 w-[4rem] rounded-full bg-white flex items-center justify-center cursor-grab active:cursor-grabbing z-30 group shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_20px_rgba(244,63,94,0.3)] ring-1 ring-white transition-shadow"
            >
                {/* IDLE PULSE ANIMATION (Active when not confirmed) */}
                {!confirmed && (
                    <>
                        <motion.div
                            className="absolute inset-0 rounded-full border-2 border-rose-500/50"
                            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                        />
                        <motion.div
                            className="absolute inset-0 rounded-full border border-rose-500/30"
                            animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut", delay: 0.2 }}
                        />
                    </>
                )}
                <div className="relative flex items-center justify-center w-full h-full">
                    {confirmed ? (
                        <div className="bg-rose-500 rounded-full p-3 shadow-inner">
                            <Check size={24} className="text-white" strokeWidth={4} />
                        </div>
                    ) : (
                        <div className="bg-zinc-50 rounded-full p-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
                            <ChevronRight size={24} className="text-rose-500 group-hover:scale-110 transition-transform" strokeWidth={3} />
                        </div>
                    )}

                    {/* Handle Gloss/Orbacality */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-gradient-to-b from-white to-transparent opacity-80 rounded-full blur-[1px]" />
                </div>
            </motion.div>
        </div>
    );
};
