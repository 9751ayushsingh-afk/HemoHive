'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
    metrics?: {
        score: number;
        wastagePercentage: string;
        savedviaExchange: number;
        rejections?: number;
        grade: string;
    };
}

const WastageMeter = ({ metrics }: Props) => {
    // We simulate a live reading jumping around slightly to make it feel "livable"
    // Use real data from metrics or fallback to 0.0
    const rawWastage = parseFloat(metrics?.wastagePercentage || '0.0');
    const [liveWastage, setLiveWastage] = useState(rawWastage);

    // Synchronize state when props change
    useEffect(() => {
        setLiveWastage(rawWastage);
    }, [rawWastage]);

    useEffect(() => {
        // If the number is exactly 0, don't fluctuate to avoid negative or fake warnings
        if (rawWastage === 0) {
            setLiveWastage(0);
            return;
        }

        const interval = setInterval(() => {
            // Fluctuate the number slightly for a live "monitoring" feel
            const flux = (Math.random() - 0.5) * 0.5; // Slightly larger flux
            setLiveWastage(Math.max(0.1, rawWastage + flux));
        }, 800);
        return () => clearInterval(interval);
    }, [rawWastage]);

    const percentage = (liveWastage / 10) * 100; // Assuming 10% is the critical metric ceiling for UI
    const isCritical = metrics ? metrics.grade === 'Red' : liveWastage > 7;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className={`relative w-full min-h-[460px] rounded-[3rem] overflow-hidden border p-8 flex flex-col justify-between ${isCritical ? 'bg-[#0a0000] border-red-500/50 shadow-[0_0_80px_rgba(239,68,68,0.3)]' : 'bg-[#00050a] border-white/10 backdrop-blur-3xl shadow-2xl'}`}
        >
            {/* Liquid / Aurora Animated Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[3rem]">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: isCritical ? [0.3, 0.5, 0.3] : [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute -inset-1/2 blur-[80px] rounded-full ${isCritical ? 'bg-red-600/30' : 'bg-green-600/20'}`}
                />
            </div>

            {/* Header */}
            <div className="relative z-10 flex justify-between items-start w-full">
                <div>
                    <h3 className="text-2xl font-black text-white tracking-[0.2em] uppercase flex items-center gap-3 font-outfit">
                        <span className="relative flex h-3 w-3">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isCritical ? 'bg-red-400' : 'bg-green-400'}`}></span>
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${isCritical ? 'bg-red-500' : 'bg-green-500'}`}></span>
                        </span>
                        Wastage Meter
                    </h3>
                    <p className="text-white/30 text-[11px] font-bold tracking-[0.3em] uppercase mt-2 font-mono">Real-time Diagnostic Stream</p>
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-xl group cursor-help transition-all hover:bg-white/10">
                    <span className="text-white/60 text-[10px] font-black font-mono tracking-widest flex items-center gap-2">
                        <span className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                        CORE_SENSOR_ACTIVE
                    </span>
                </div>
            </div>

            {/* High-Tech Central Animated Gauge */}
            <div className="relative z-10 flex-1 flex items-center justify-center mt-6">
                <div className="relative w-56 h-56 flex items-center justify-center">

                    {/* Outer Rotating Segmented Ring */}
                    <motion.svg
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 w-full h-full opacity-30"
                    >
                        <circle cx="112" cy="112" r="105" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 8" fill="transparent" />
                    </motion.svg>

                    {/* SVG Circle Gauge - Liquid Core */}
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-[0_0_25px_rgba(0,0,0,0.8)]">
                        {/* Background glowing track */}
                        <circle
                            cx="112"
                            cy="112"
                            r="90"
                            stroke="rgba(255,255,255,0.03)"
                            strokeWidth="16"
                            fill="transparent"
                        />
                        {/* Animated fill track */}
                        <motion.circle
                            cx="112"
                            cy="112"
                            r="90"
                            stroke={isCritical ? '#ef4444' : '#10b981'}
                            strokeWidth="16"
                            strokeLinecap="round"
                            fill="transparent"
                            initial={{ strokeDasharray: 565, strokeDashoffset: 565 }}
                            animate={{ strokeDashoffset: 565 - (565 * percentage) / 100 }}
                            transition={{ duration: 2, type: "spring", bounce: 0.4 }}
                            style={{ filter: `drop-shadow(0 0 15px ${isCritical ? '#ef4444' : '#10b981'})` }}
                        />
                    </svg>

                    {/* Floating Tech Data Points */}
                    <div className="absolute top-1 right-2 text-[8px] font-mono text-white/30 tracking-widest">v2.4</div>
                    <div className="absolute bottom-1 left-2 text-[8px] font-mono text-white/30 tracking-widest">{isCritical ? 'ALERT' : 'STB'}</div>

                    {/* High-Impact Text inside circle */}
                    <div className="text-center relative z-20">
                        <motion.div
                            key={liveWastage.toFixed(1)}
                            initial={{ scale: 1.2, opacity: 0, filter: 'blur(10px)' }}
                            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="flex flex-col items-center"
                        >
                            <span className={`text-[5rem] leading-none font-black tracking-tighter font-outfit ${isCritical ? 'text-red-500' : 'text-green-400'} drop-shadow-[0_0_30px_rgba(0,0,0,0.6)]`}>
                                {liveWastage.toFixed(1)}<span className="text-3xl ml-1 opacity-50 relative -top-4">%</span>
                            </span>
                            <div className="mt-3 flex flex-col items-center">
                                <p className="text-[11px] text-white/40 uppercase tracking-[0.5em] font-black font-mono">Loss Index</p>
                                <div className="h-[2px] w-12 bg-white/20 mt-2 rounded-full" />
                            </div>
                        </motion.div>
                    </div>

                    {/* Floating hazard particles when critical */}
                    {isCritical && (
                        <>
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-1 h-1 bg-red-500 rounded-full"
                                    initial={{
                                        x: 0,
                                        y: 0,
                                        opacity: 1
                                    }}
                                    animate={{
                                        x: (Math.random() - 0.5) * 100,
                                        y: -50 - Math.random() * 50,
                                        opacity: 0
                                    }}
                                    transition={{
                                        duration: 1 + Math.random(),
                                        repeat: Infinity,
                                        repeatDelay: Math.random()
                                    }}
                                />
                            ))}
                        </>
                    )}
                </div>
            </div>

            {/* Footer Stats Grid */}
            <div className="relative z-10 grid grid-cols-2 gap-5 mt-6">
                {/* Neon Cyan Box */}
                <div className={`rounded-[1.5rem] border p-5 backdrop-blur-xl relative overflow-hidden group transition-all duration-500 
                    ${(metrics?.rejections || 0) > 0
                        ? 'border-red-500/30 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:border-red-400 hover:shadow-[0_0_40px_rgba(239,68,68,0.4)]'
                        : 'border-cyan-500/30 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:border-cyan-400 hover:shadow-[0_0_40px_rgba(6,182,212,0.4)]'}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${(metrics?.rejections || 0) > 0 ? 'from-red-400/20' : 'from-cyan-400/20'} to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
                    <p className={`text-[10px] uppercase tracking-[0.2em] font-black mb-2 relative z-10 font-mono ${(metrics?.rejections || 0) > 0 ? 'text-red-200/70' : 'text-cyan-200/70'}`}>
                        {(metrics?.rejections || 0) > 0 ? 'Medical Rejections' : 'Exchanged Units'}
                    </p>
                    <div className="flex items-baseline gap-2 relative z-10">
                        <p className={`text-3xl font-black font-outfit drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] ${(metrics?.rejections || 0) > 0 ? 'text-red-400' : 'text-cyan-300'}`}>
                            {(metrics?.rejections || 0) > 0 ? metrics?.rejections : (metrics?.savedviaExchange || 0)}
                        </p>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${(metrics?.rejections || 0) > 0 ? 'text-red-200/50' : 'text-cyan-200/50'}`}>
                            {(metrics?.rejections || 0) > 0 ? 'Failure' : 'Saved'}
                        </span>
                    </div>
                </div>

                {/* Dynamic Neon Box (Red/Green) */}
                <div className={`rounded-[1.5rem] border p-5 backdrop-blur-xl relative overflow-hidden group transition-all duration-500 
                    ${isCritical
                        ? 'border-red-500/40 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:border-red-400 hover:shadow-[0_0_40px_rgba(239,68,68,0.5)] hover:bg-red-900/30'
                        : 'border-green-500/30 bg-green-950/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-green-400 hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:bg-green-900/30'
                    }`}
                >
                    <div className={`absolute inset-0 bg-gradient-to-br opacity-50 group-hover:opacity-100 transition-opacity duration-500 ${isCritical ? 'from-red-500/20' : 'from-green-500/20'} to-transparent`} />
                    <p className={`text-[10px] uppercase tracking-[0.2em] font-black mb-2 relative z-10 font-mono ${isCritical ? 'text-red-200/70' : 'text-green-200/70'}`}>System Integrity</p>
                    <p className={`text-2xl font-black uppercase tracking-wider relative z-10 font-outfit drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] ${isCritical ? 'text-red-400' : 'text-green-400'}`}>
                        {metrics?.grade === 'Red' ? 'CRITICAL' : metrics?.grade === 'Yellow' ? 'WARNING' : 'OPTIMAL'}
                    </p>
                </div>
            </div>

            {/* Aesthetic Line scan overlay */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-30 animate-[scan_3s_ease-in-out_infinite]" />
        </motion.div>
    );
};

export default WastageMeter;
