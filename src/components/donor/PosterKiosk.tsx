'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Trophy, AlertCircle, Heart, MapPin, Clock, ArrowRight, Ambulance, Wind } from 'lucide-react';
import { FlyingBird } from './FlyingBird';

const POSTERS = [
    {
        id: 1,
        type: 'event',
        title: "Mega Blood Drive",
        subtitle: "Join the movement to save lives!",
        date: "Sun, Oct 13 â€¢ 9:00 AM",
        location: "78,NEWADA SAMOGAR T.S.L NAINI, Prayagraj",
        icon: Calendar,
        color: "from-blue-600 to-indigo-700",
        image: "https://images.unsplash.com/photo-1615461168078-83e8cbec2044?auto=format&fit=crop&q=80&w=1000",
        action: "Register Now"
    },
    {
        id: 2,
        type: 'recognition',
        title: "Star Donor: AYUSH SINGH",
        subtitle: "Saved 15 lives this year!",
        quote: "\"It's the easiest way to be a hero.\"",
        icon: Trophy,
        color: "from-amber-500 to-orange-600",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1000",
        action: "View Leaderboard"
    },
    {
        id: 3,
        type: 'alert',
        title: "URGENT NEED: O-",
        subtitle: "Critical shortage at KAMLA NEHRU.",
        detail: "Your donation is needed immediately.",
        icon: AlertCircle,
        color: "from-red-600 to-rose-700",
        image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=1000",
        action: "Find Center"
    },
    {
        id: 4,
        type: 'tip',
        title: "Health Tip: Iron Up!",
        subtitle: "Boost your hemoglobin naturally.",
        detail: "Spinach, lentils, and red meat help you recover faster.",
        icon: Heart,
        color: "from-emerald-500 to-teal-600",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1000",
        action: "More Tips"
    }
];

const AnimatedLeg = ({ isLeft }: { isLeft: boolean }) => (
    <div className={`w-12 h-44 bg-gradient-to-b from-slate-300 via-slate-100 to-slate-400 rounded-b-xl shadow-2xl relative overflow-hidden border-x border-white/80 ${isLeft ? 'rounded-tl-md' : 'rounded-tr-md'}`}>
        {/* Base Metallic Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-30 mix-blend-overlay" />

        {/* Static Specular Highlight */}
        <div className={`absolute ${isLeft ? 'left-2' : 'right-2'} top-0 bottom-0 w-[3px] bg-white blur-[1px] opacity-80`} />
        <div className={`absolute ${isLeft ? 'right-2' : 'left-2'} top-0 bottom-0 w-[1px] bg-black/10 blur-[1px]`} />

        {/* GOD LEVEL: Moving Shine Animation */}
        <motion.div
            animate={{
                y: ['-100%', '200%'],
                opacity: [0, 0.8, 0]
            }}
            transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: Math.random() * 2,
                ease: "easeInOut"
            }}
            className="absolute inset-0 w-full h-[150%] bg-gradient-to-b from-transparent via-white/60 to-transparent skew-y-12 blur-md"
        />
    </div>
);

// Realistic Pine Tree Component (Layered Triangles with Texture)
const RealisticPineTree = ({ delay, x, scale = 1, flip = false, blur = 0, z = 10, bottom = "bottom-0" }: { delay: number, x: string, scale?: number, flip?: boolean, blur?: number, z?: number, bottom?: string }) => (
    <motion.div
        initial={{ rotate: -1 }}
        animate={{ rotate: 1 }}
        transition={{ duration: 4 + Math.random(), repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: delay }}
        className={`absolute ${bottom} ${x} z-${z} origin-bottom ${flip ? '-scale-x-100' : ''}`}
        style={{ scale, filter: `blur(${blur}px)`, zIndex: z }}
    >
        <div className="relative flex flex-col items-center drop-shadow-2xl">
            {/* Tree Layers (Top to Bottom) - Slightly Brighter for Visibility */}
            <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[40px] border-l-transparent border-r-transparent border-b-emerald-700 translate-y-2 z-30 relative">
                <div className="absolute inset-0 border-b-emerald-600 -ml-[20px] opacity-50" style={{ clipPath: 'polygon(50% 0, 100% 100%, 50% 100%)' }}></div>
            </div>
            <div className="w-0 h-0 border-l-[30px] border-r-[30px] border-b-[50px] border-l-transparent border-r-transparent border-b-emerald-800 -mt-2 z-20 relative">
                <div className="absolute inset-0 border-b-emerald-700 -ml-[30px] opacity-50" style={{ clipPath: 'polygon(50% 0, 100% 100%, 50% 100%)' }}></div>
            </div>
            <div className="w-0 h-0 border-l-[40px] border-r-[40px] border-b-[70px] border-l-transparent border-r-transparent border-b-emerald-900 -mt-4 z-10 relative">
                <div className="absolute inset-0 border-b-emerald-800 -ml-[40px] opacity-50" style={{ clipPath: 'polygon(50% 0, 100% 100%, 50% 100%)' }}></div>
            </div>
            <div className="w-0 h-0 border-l-[50px] border-r-[50px] border-b-[80px] border-l-transparent border-r-transparent border-b-emerald-950 -mt-6 z-0 relative">
                <div className="absolute inset-0 border-b-emerald-900 -ml-[50px] opacity-50" style={{ clipPath: 'polygon(50% 0, 100% 100%, 50% 100%)' }}></div>
            </div>

            {/* Trunk */}
            <div className="w-6 h-12 bg-gradient-to-r from-stone-800 to-stone-700 -mt-2 rounded-b-lg shadow-inner" />
        </div>
    </motion.div>
);

// Realistic Shrub Component
const Shrub = ({ x, scale = 1, delay = 0 }: { x: string, scale?: number, delay?: number }) => (
    <motion.div
        initial={{ scale: scale }}
        animate={{ scale: [scale, scale * 1.05, scale] }}
        transition={{ duration: 3, repeat: Infinity, delay: delay }}
        className={`absolute bottom-24 ${x} z-20 drop-shadow-xl`}
    >
        <div className="relative">
            <div className="w-16 h-12 bg-emerald-900 rounded-full absolute bottom-0 left-0 opacity-90" />
            <div className="w-14 h-14 bg-emerald-950 rounded-full absolute bottom-2 left-4 opacity-80" />
            <div className="w-12 h-10 bg-green-900 rounded-full absolute bottom-1 right-2 opacity-85" />
        </div>
    </motion.div>
);

// Atmospheric Particle System (Dust/Pollen)
const ParticleNode = ({ delay }: { delay: number }) => (
    <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{
            y: -200,
            opacity: [0, 0.6, 0],
            x: [-20, 20, -10]
        }}
        transition={{
            duration: 5 + Math.random() * 4,
            repeat: Infinity,
            delay: delay,
            ease: "linear"
        }}
        className="absolute w-1 h-1 bg-white rounded-full blur-[0.5px]"
        style={{ left: `${Math.random() * 100}%` }}
    />
);

const MovingAmbulance = () => {
    return (
        <motion.div
            initial={{ x: -1000, opacity: 0 }}
            animate={{
                x: 2000,
                opacity: [0, 1, 1, 0]
            }}
            transition={{
                x: {
                    duration: 6,
                    repeat: Infinity,
                    repeatDelay: 2.5,
                    ease: "easeIn",
                    delay: 0.5
                },
                opacity: {
                    duration: 6,
                    repeat: Infinity,
                    repeatDelay: 2.5,
                    times: [0, 0.05, 0.9, 1],
                    ease: "linear",
                    delay: 0.5
                }
            }}
            className="absolute bottom-8 z-[45] flex items-center gap-1 scale-90"
        >
            {/* ULTRA-REALISM: Dynamic Environmental Lighting (Moving Glow) */}
            {/* This casts a red/blue tint on the road and trees as the ambulance passes */}
            <div className="absolute -top-[200px] -left-[100px] w-[400px] h-[400px] bg-gradient-to-b from-red-500/20 via-transparent to-blue-500/20 rounded-full blur-[80px] mix-blend-overlay pointer-events-none animate-pulse" />

            {/* Enhanced Siren Light Effect - Strobe (Fixed TS Error by removing 'steps(2)') */}
            <motion.div
                animate={{ opacity: [0, 1, 0, 1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, times: [0, 0.2, 0.5, 0.8, 1] }}
                className="absolute -top-10 left-4 w-24 h-24 bg-red-600/60 rounded-full blur-[30px] mix-blend-screen"
            />
            <motion.div
                animate={{ opacity: [0, 1, 0, 1, 0] }}
                transition={{ duration: 0.5, delay: 0.25, repeat: Infinity, times: [0, 0.2, 0.5, 0.8, 1] }}
                className="absolute -top-10 right-0 w-24 h-24 bg-blue-600/60 rounded-full blur-[30px] mix-blend-screen"
            />
            {/* Intense Center Flash */}
            <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.1, repeat: Infinity }}
                className="absolute -top-2 left-10 w-8 h-8 bg-white/90 rounded-full blur-xl mix-blend-overlay"
            />


            {/* Car Body */}
            <div className="relative w-36 h-20 bg-slate-50 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex items-center justify-center border-b-4 border-slate-300 overflow-hidden transform-gpu">
                {/* Reflection on Car Body */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent skew-x-12 opacity-50" />

                <div className="absolute bottom-3 left-0 w-full h-2 bg-red-600 opacity-90" />
                <div className="absolute top-1/2 left-2 text-red-700 font-black uppercase tracking-widest text-[10px] z-10 shadow-sm">HemoHive Ambulance</div>

                <div className="absolute top-2 left-2 w-8 h-8 bg-sky-400/30 rounded-sm border border-sky-400/50 backdrop-blur-sm" />
                <div className="absolute top-2 right-10 w-14 h-8 bg-sky-400/30 rounded-sm border border-sky-400/50 backdrop-blur-sm" />

                <div className="absolute top-4 right-4 w-7 h-7 bg-red-600 rounded-full flex items-center justify-center shadow-lg border border-white/20 z-20">
                    <div className="w-4 h-1.5 bg-white absolute shadow-[0_0_5px_white]" />
                    <div className="w-1.5 h-4 bg-white absolute shadow-[0_0_5px_white]" />
                </div>
            </div>

            <div className="absolute -bottom-3 left-5 w-7 h-7 bg-slate-900 rounded-full border-2 border-slate-500 animate-spin-slow shadow-2xl z-10 flex items-center justify-center">
                <div className="w-2 h-2 bg-slate-600 rounded-full" />
            </div>
            <div className="absolute -bottom-3 right-8 w-7 h-7 bg-slate-900 rounded-full border-2 border-slate-500 animate-spin-slow shadow-2xl z-10 flex items-center justify-center">
                <div className="w-2 h-2 bg-slate-600 rounded-full" />
            </div>
        </motion.div>
    );
};

const MovingBike = () => {
    return (
        <motion.div
            initial={{ x: -1000, opacity: 0 }}
            animate={{
                x: 2000,
                opacity: [0, 1, 1, 0]
            }}
            transition={{
                x: {
                    duration: 5,
                    repeat: Infinity,
                    repeatDelay: 2.5,
                    delay: 2.5,
                    ease: "linear"
                },
                opacity: {
                    duration: 5,
                    repeat: Infinity,
                    repeatDelay: 2.5,
                    delay: 2.5,
                    times: [0, 0.05, 0.95, 1],
                    ease: "linear"
                }
            }}
            className="absolute bottom-10 z-[45] flex items-center justify-center scale-90"
        >
            <div className="relative w-16 h-10">
                <div className="absolute bottom-4 left-4 w-8 h-10 bg-slate-800 rounded-full transform -skew-x-12 z-10" />
                <div className="absolute top-0 left-6 w-5 h-5 bg-white rounded-full border-2 border-slate-800 z-20" />

                <div className="absolute bottom-0 left-0 w-16 h-6 bg-red-600 rounded-lg shadow-lg flex items-center border border-red-400">
                    <div className="absolute -right-1 top-1 w-2 h-2 bg-yellow-400 rounded-full blur-[1px]" />
                </div>

                <div className="absolute -bottom-2 left-0 w-6 h-6 bg-slate-900 rounded-full border-2 border-slate-500 animate-spin-slow" />
                <div className="absolute -bottom-2 right-0 w-6 h-6 bg-slate-900 rounded-full border-2 border-slate-500 animate-spin-slow" />

                <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.2, repeat: Infinity }}
                    className="absolute -top-4 right-0 w-6 h-6 bg-blue-500 rounded-full blur-md"
                />
            </div>
        </motion.div>
    );
}

// 1. Rain System
const RainDrop = ({ delay, x }: { delay: number, x: number }) => (
    <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{
            y: 500,
            opacity: [0, 0.5, 0]
        }}
        transition={{
            duration: 0.8 + Math.random() * 0.5,
            repeat: Infinity,
            delay: delay,
            ease: "linear"
        }}
        className="absolute top-0 w-[1px] h-12 bg-gradient-to-b from-transparent to-blue-200/50 rotate-[15deg]"
        style={{ left: `${x}%` }}
    />
);

// 2. Distant City Bokeh (Background Depth)
const CityBokeh = ({ delay, x, y, color }: { delay: number, x: number, y: number, color: string }) => (
    <motion.div
        initial={{ opacity: 0.2, scale: 0.8 }}
        animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [0.8, 1.2, 0.8]
        }}
        transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: delay,
            ease: "easeInOut"
        }}
        className={`absolute rounded-full blur-[3px] ${color}`}
        style={{
            left: `${x}%`,
            top: `${y}%`,
            width: `${Math.random() * 10 + 4}px`,
            height: `${Math.random() * 10 + 4}px`
        }}
    />
);

// 3. Sunny Day God Rays
const SunGodRays = ({ delay }: { delay: number }) => (
    <motion.div
        initial={{ opacity: 0, rotate: 0 }}
        animate={{
            opacity: [0.4, 0.6, 0.4],
            rotate: 360
        }}
        transition={{
            opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 60, repeat: Infinity, ease: "linear" }
        }}
        className="absolute -top-[50%] -right-[20%] w-[150%] h-[150%] z-[1] pointer-events-none"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100/20 via-orange-100/5 to-transparent skew-x-12 blur-3xl rounded-full mix-blend-overlay" />
        {/* Ray beams */}
        {[...Array(6)].map((_, i) => (
            <div key={i}
                className="absolute top-1/2 left-1/2 w-full h-12 bg-gradient-to-r from-white/10 to-transparent origin-left blur-xl"
                style={{ transform: `rotate(${i * 60}deg) translateY(-50%)` }}
            />
        ))}
    </motion.div>
);


// 4. Flying Birds (Sunny Day Liveness)
// Moved to external component: src/components/donor/FlyingBird.tsx

// 5. Moving Clouds (Cloudy Day Liveness)
// Parallax drifting clouds with soft opacity
// HYPER-REALISTIC FRACTAL CLOUDS - No Circles!
// Uses SVG Filters (Turbulence + Displacement) to generate organic vapor texture.
// 5. Moving Clouds (Cloudy Day Liveness)
// "Soft Vapor" Clouds - Using heavy blur + subtle noise texture to avoid "continent" look
// 5. Moving Clouds (Cloudy Day Liveness)
// Detailed "Fluffy" Cloud Image
// Using a high-quality transparent PNG similar to the requested Flaticon asset
const MovingCloud = ({ delay, y, scale, duration }: { delay: number, y: number, scale: number, duration: number }) => {
    return (
        <motion.div
            initial={{ x: -250, opacity: 0 }}
            animate={{
                x: '110vw',
                opacity: [0, 1, 1, 0]
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay, // Only initial delay
                ease: "linear"
            }}
            className="absolute left-0 z-[60] pointer-events-none"
            style={{ top: `${y}%` }}
        >
            <div className="relative w-[150px]" style={{ transform: `scale(${scale})` }}>
                {/* Main Cloud Image - Detailed Puffy White Cloud */}
                <img
                    src="https://cdn-icons-png.flaticon.com/512/414/414927.png" // The direct requested image URL
                    alt="Cloud"
                    className="w-full h-auto drop-shadow-xl opacity-90"
                />
            </div>
        </motion.div>
    );
};


const PosterKiosk = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    // Weather State: 'NIGHT' (Rain) -> 'SUNNY' (Day) -> 'CLOUDY' (Overcast)
    const [weather, setWeather] = useState<'NIGHT' | 'SUNNY' | 'CLOUDY'>('NIGHT');

    // Stable random values for clouds prevents re-render jumping
    const stableClouds = React.useMemo(() => Array.from({ length: 2 }).map((_, i) => ({
        id: i,
        delay: i * 8, // Spaced out
        y: 5 + Math.random() * 15, // Keep high in sky (5-20%)
        scale: 0.4 + Math.random() * 0.3, // Small scale
        duration: 45 + Math.random() * 10 // Slow, smooth movement
    })), []);

    // Stable random values for birds to prevent jumpy movement on poster change
    const stableBirds = React.useMemo(() => Array.from({ length: 6 }).map((_, i) => ({ // Keeping 6 birds
        id: i,
        delay: i * 2, // Spaced slightly more
        y: 40 + Math.random() * 60, // Vary height
        scale: 1.2 + Math.random() // Vary size
    })), []);

    // Poster Rotation (Separate effect)
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % POSTERS.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    // Continuous Weather Cycle: Night (15s) -> Sunny (15s) -> Cloudy (15s) -> Repeat
    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (weather === 'NIGHT') {
            // Night -> Sun after 15s
            timeout = setTimeout(() => setWeather('SUNNY'), 15000);
        } else if (weather === 'SUNNY') {
            // Sun -> Cloudy after 15s
            timeout = setTimeout(() => setWeather('CLOUDY'), 15000);
        } else if (weather === 'CLOUDY') {
            // Cloudy -> Night after 15s (Loop)
            timeout = setTimeout(() => setWeather('NIGHT'), 15000);
        }

        return () => clearTimeout(timeout);
    }, [weather]); // Re-run whenever weather changes

    // Derived States for easier rendering
    const isNight = weather === 'NIGHT';
    const isSunny = weather === 'SUNNY';
    const isCloudy = weather === 'CLOUDY';

    return (
        <div className="relative w-full h-[480px] flex flex-col items-center justify-end perspective-1000 group overflow-hidden rounded-[32px] border border-white/5 transition-colors duration-[3000ms]"
            style={{
                backgroundColor: isSunny ? '#38bdf8' : (isCloudy ? '#94a3b8' : '#0f172a')
            }}
        >

            {/* BACKGROUND LAYER: Sky & City Lights */}

            {/* 1. Dark Night Sky (Visible only in NIGHT) */}
            <motion.div
                animate={{ opacity: isNight ? 1 : 0 }}
                transition={{ duration: 3 }}
                className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950/30 z-0"
            />

            {/* 2. Sunny Day Sky (Visible only in SUNNY) */}
            <motion.div
                animate={{ opacity: isSunny ? 1 : 0 }}
                transition={{ duration: 3 }}
                className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-blue-200 z-0"
            />

            {/* 3. Cloudy Sky (Visible only in CLOUDY) */}
            <motion.div
                animate={{ opacity: isCloudy ? 1 : 0 }}
                transition={{ duration: 3 }}
                className="absolute inset-0 bg-gradient-to-b from-slate-400 via-slate-300 to-slate-200 z-0"
            />

            {/* LIVE BIRDS (Sunny & Cloudy) */}
            {/* In Cloudy, maybe they fly lower or differently? For now, keep them same but always visible in day modes */}
            {/* Actually, let's keep them in both day modes. */}
            {(isSunny || isCloudy) && (
                <div className="absolute inset-0 pointer-events-none z-[100]">
                    {stableBirds.map((bird) => (
                        <FlyingBird key={bird.id} delay={bird.delay} y={bird.y} scale={bird.scale} />
                    ))}
                </div>
            )}

            {/* DRIFTING CLOUDS (Only in CLOUDY) */}
            {isCloudy && (
                <div className="absolute inset-0 pointer-events-none z-[50]">
                    {stableClouds.map((cloud) => (
                        <MovingCloud
                            key={cloud.id}
                            delay={cloud.delay}
                            y={cloud.y}
                            scale={cloud.scale}
                            duration={cloud.duration}
                        />
                    ))}
                </div>
            )}

            {/* Sun & God Rays (Visible only when Sunny) */}
            <motion.div
                animate={{ opacity: isSunny ? 1 : 0, scale: isSunny ? 1 : 0.8 }}
                transition={{ duration: 3 }}
                className="absolute inset-0 z-[1]"
            >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-200 rounded-full blur-[40px] mix-blend-screen opacity-80" />
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-300/30 rounded-full blur-[80px] mix-blend-screen" />
                <SunGodRays delay={0} />
            </motion.div>

            {/* Distant City Bokeh Grid (Visible in Night & Cloudy - Fainter in Cloudy) */}
            <motion.div
                animate={{ opacity: isNight ? 0.6 : (isCloudy ? 0.2 : 0) }}
                transition={{ duration: 2 }}
                className="absolute top-1/3 left-0 w-full h-1/3 z-0"
            >
                {[...Array(15)].map((_, i) => (
                    <CityBokeh
                        key={i}
                        delay={i * 0.5}
                        x={Math.random() * 100}
                        y={Math.random() * 100}
                        color={Math.random() > 0.5 ? "bg-amber-500/30" : "bg-red-500/20"}
                    />
                ))}
            </motion.div>

            {/* 0. Atmosphere: Floating Dust Particles */}
            <motion.div
                animate={{
                    opacity: isNight ? 1 : 0.6,
                    color: isSunny ? '#fcd34d' : '#ffffff'
                }}
                className="absolute inset-0 z-50 pointer-events-none overflow-hidden"
            >
                {[...Array(8)].map((_, i) => <ParticleNode key={i} delay={i} />)}
            </motion.div>

            {/* RAIN LAYER (Foreground) - Only in NIGHT */}
            <motion.div
                animate={{ opacity: isNight ? 0.3 : 0 }}
                transition={{ duration: 2 }}
                className="absolute inset-0 z-[60] pointer-events-none overflow-hidden"
            >
                {[...Array(20)].map((_, i) => (
                    <RainDrop key={i} delay={Math.random() * 2} x={Math.random() * 100} />
                ))}
            </motion.div>


            {/* 0.5 Green Grass Edge (Background) */}
            <motion.div
                animate={{
                    background: isSunny
                        ? 'linear-gradient(to top, #15803d, #86efac)' // Bright Green (Sun)
                        : (isCloudy
                            ? 'linear-gradient(to top, #1e293b, #64748b)' // Desaturated Blue-Grey Green (Cloudy)
                            : 'linear-gradient(to top, #022c22, rgba(6, 78, 59, 0.2))') // Dark Emerald (Night)
                }}
                transition={{ duration: 3 }}
                className="absolute bottom-24 w-full h-12 z-0"
            />

            {/* 1. Kiosk Stand Layer */}

            {/* OLD SHADOW (Ambient blob) - Keep for occlusion or Cloudy Day */}
            {/* In Cloudy, this serves as the soft ambient shadow */}
            <motion.div
                animate={{ opacity: isCloudy ? 0.6 : (isSunny ? 0.2 : 0.7) }}
                className="absolute bottom-32 w-[70%] h-8 bg-black/80 blur-lg rounded-[100%] z-[25]"
            />

            {/* NEW: REALISTIC SUN SHADOW (Directional) on ROAD */}
            {/* Only visible in Sun. */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isSunny ? 0.5 : 0 }}
                transition={{ duration: 3 }}
                className="absolute bottom-4 left-[15%] w-[60%] h-16 bg-black/60 blur-lg rounded-[100%] z-[22] transform skew-x-[50deg] origin-bottom-right mix-blend-multiply pointer-events-none"
            />


            <div className="absolute bottom-32 flex justify-between w-[50%] px-4 z-[26]">
                <AnimatedLeg isLeft={true} />
                <AnimatedLeg isLeft={false} />
            </div>

            <div className="absolute bottom-36 w-[45%] h-6 bg-gradient-to-b from-slate-200 via-white to-slate-400 rounded-full shadow-lg z-[27] border-t border-white" />

            {/* 2. The Road (Foreground z-20) */}
            <motion.div
                animate={{
                    // Slate-700 (Sun), Slate-600 (Cloudy - flatter), Slate-900 (Night)
                    backgroundColor: isSunny ? '#334155' : (isCloudy ? '#475569' : '#0f172a')
                }}
                transition={{ duration: 3 }}
                className="absolute bottom-0 w-full h-28 z-20 border-t-4 border-slate-700 shadow-2xl overflow-hidden"
            >
                {/* Asphalt Texture */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asphalt-dark.png')] opacity-70 mix-blend-overlay" />

                {/* Wet Road / Puddle Reflections */}
                <motion.div
                    animate={{ opacity: isSunny ? 0.6 : (isCloudy ? 0.2 : 0.4) }} // Less reflective in Cloudy
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-900/10 to-transparent skew-x-[-30deg] mix-blend-overlay"
                />
                <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Wet Puddles */}
                <motion.div
                    animate={{
                        backgroundColor: isSunny ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        opacity: isCloudy ? 0.3 : 1
                    }}
                    transition={{ duration: 3 }}
                    className="absolute top-4 left-1/4 w-32 h-8 blur-md rounded-full transform rotate-3"
                />

                {/* Sun Glare on Wet Road (Only in Sun) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isSunny ? 0.3 : 0 }}
                    transition={{ duration: 2 }}
                    className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-orange-200/20 to-transparent mix-blend-overlay pointer-events-none"
                />

                {/* Dashboard / Kiosk Reflection */}
                <motion.div
                    animate={{ opacity: isCloudy ? 0.05 : [0.1, 0.2, 0.1] }} // Faint reflection in cloudy
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 w-[60%] h-20 bg-blue-400/10 blur-[30px] rounded-full scale-y-50 mix-blend-screen"
                />

                <div className="absolute top-1/2 left-0 w-full h-4 flex justify-between px-4 opacity-50">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="w-16 h-2 bg-slate-400/50 skew-x-12 shadow-[0_0_5px_rgba(255,255,255,0.2)]" />
                    ))}
                </div>
            </motion.div>

            {/* 3. Moving Vehicles */}
            <MovingAmbulance />
            <MovingBike />

            {/* 4. Realistic Nature */}
            {/* Background/Midground Shrubs */}
            <motion.div
                animate={{
                    // Bright/Sat (Sun), Desaturated/Flat (Cloudy), Dark (Night)
                    filter: isSunny ? 'brightness(1.2) saturate(1.2)' : (isCloudy ? 'brightness(0.9) saturate(0.6) contrast(0.9)' : 'brightness(1) saturate(1)')
                }}
                transition={{ duration: 3 }}
                className="absolute inset-0 z-20 pointer-events-none"
            >
                <Shrub x="left-4" scale={0.8} delay={1} />
                <Shrub x="right-10" scale={0.9} delay={0.5} />
                <Shrub x="left-[30%]" scale={0.6} delay={2} />
            </motion.div>

            {/* Trees Wrapper */}
            <motion.div
                animate={{
                    filter: isSunny ? 'brightness(1.1) saturate(1.3)' : (isCloudy ? 'brightness(0.8) saturate(0.7) contrast(0.9)' : 'brightness(1) saturate(1)')
                }}
                transition={{ duration: 3 }}
                className="absolute inset-0 z-50 pointer-events-none"
            >
                <RealisticPineTree delay={0} x="-left-14" scale={1.3} blur={1.5} z={50} bottom="bottom-[-20px]" />
                <RealisticPineTree delay={1.5} x="-right-16" scale={1.4} flip={true} blur={2} z={50} bottom="bottom-[-30px]" />
            </motion.div>
            <motion.div
                animate={{
                    filter: isSunny ? 'brightness(1.1) saturate(1.3)' : (isCloudy ? 'brightness(0.8) saturate(0.7) contrast(0.9)' : 'brightness(1) saturate(1)')
                }}
                transition={{ duration: 3 }}
                className="absolute inset-0 z-10 pointer-events-none"
            >
                <RealisticPineTree delay={2} x="left-10" scale={0.6} blur={1} z={10} bottom="bottom-24" />
                <RealisticPineTree delay={3} x="right-20" scale={0.7} blur={0.5} z={10} bottom="bottom-24" />
            </motion.div>


            {/* 5. The Main Wide Screen Unit */}
            <div className="relative z-[30] w-full h-[280px] mb-48 bg-slate-900 rounded-[28px] p-3 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8)] border border-slate-700/50 ring-1 ring-white/10 overflow-hidden transform-gpu group-hover:scale-[1.005] transition-transform duration-500"
                style={{
                    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
                }}
            >
                {/* ... existing screen content ... */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent skew-x-[-20deg] pointer-events-none z-30" />

                <div className="relative w-full h-full bg-black rounded-[20px] overflow-hidden shadow-inner ring-1 ring-white/5">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            className="absolute inset-0 w-full h-full"
                        >
                            <HorizontalPosterContent poster={POSTERS[currentIndex]} />
                        </motion.div>
                    </AnimatePresence>

                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-20 pointer-events-none rounded-[20px] z-20" />

                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-30">
                        {POSTERS.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-white shadow-[0_0_8px_white]' : 'w-2 bg-white/30'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Start: Horizontal Poster Layout - REDESIGNED FOR "VIBRANT & NICHE" AESTHETIC
const HorizontalPosterContent = ({ poster }: { poster: typeof POSTERS[0] }) => {
    const Icon = poster.icon;

    return (
        <div className="relative w-full h-full flex flex-row overflow-hidden bg-slate-900 group/poster">

            {/* Right Side: Image Background with "Ken Burns" Effect */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.1 }}
                    transition={{ duration: 10, ease: "linear" }}
                    className="w-full h-full"
                >
                    <img
                        src={poster.image}
                        alt={poster.title}
                        className="w-full h-full object-cover opacity-50 mix-blend-overlay hover:opacity-100 transition-opacity duration-700"
                    />
                </motion.div>

                {/* Cinematic Vignette & Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent z-10" />
                <div className={`absolute inset-0 bg-gradient-to-br ${poster.color} opacity-20 mix-blend-color-dodge z-10 pointer-events-none`} />

                {/* Noise Texture for "Print" Feel */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay z-10 pointer-events-none" />
            </div>

            {/* Left Side: Content Area */}
            {/* Added pb-10 + pt-4 to prevent button clipping at the bottom while keeping vertical centering */}
            {/* Left Side: Content Area */}
            {/* Using flex-col justify-between to ensure top/bottom spacing is safe and content doesn't push out */}
            <div className="relative z-20 w-[90%] h-full flex flex-col justify-between px-8 py-6 text-white">

                {/* Top Section: Badge */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex items-center gap-3"
                >
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${poster.color} shadow-[0_0_12px_rgba(255,255,255,0.15)] border border-white/10`}>
                        <Icon className="w-3.5 h-3.5 text-white fill-white/20" />
                    </div>
                    <div className="px-2 py-0.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/90">{poster.type}</span>
                    </div>
                </motion.div>

                {/* Middle Section: Main Content (Centered vertically in available space) */}
                <div className="flex flex-col justify-center flex-grow py-2">
                    {/* Title */}
                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, ease: "circOut", delay: 0.1 }}
                        className="text-3xl lg:text-4xl font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 drop-shadow-sm pb-1 mb-2"
                    >
                        {poster.title}
                    </motion.h2>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, ease: "circOut", delay: 0.2 }}
                        className="text-sm lg:text-base font-medium text-slate-300 border-l-2 border-white/20 pl-3 line-clamp-3 max-w-lg italic leading-relaxed mb-4"
                    >
                        {poster.subtitle}
                    </motion.p>

                    {/* Key Info Details - Glassmorphic Cards */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center flex-wrap gap-2 text-[10px] lg:text-xs font-mono text-slate-300"
                    >
                        {poster.date && (
                            <div className="flex items-center gap-1.5 bg-slate-800/60 border border-white/5 px-2.5 py-1 rounded-md backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
                                <Clock className="w-3 h-3 text-sky-400" />
                                <span className="tracking-tight">{poster.date}</span>
                            </div>
                        )}
                        {poster.location && (
                            <div className="flex items-center gap-1.5 bg-slate-800/60 border border-white/5 px-2.5 py-1 rounded-md backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
                                <MapPin className="w-3 h-3 text-emerald-400" />
                                <span className="tracking-tight">{poster.location}</span>
                            </div>
                        )}
                        {poster.detail && !poster.location && !poster.date && (
                            <div className="bg-slate-800/60 border border-white/5 px-2.5 py-1 rounded-md backdrop-blur-sm">
                                <span className="italic text-slate-400">{poster.detail}</span>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Bottom Section: Action Button (Ensured safe padding) */}
                <motion.div>
                    <motion.button
                        initial={{ scale: 0.9, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative w-fit group overflow-hidden bg-white text-slate-950 px-5 py-2 rounded-full font-bold text-[10px] lg:text-xs uppercase tracking-wide shadow-[0_4px_15px_rgba(255,255,255,0.2)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.4)] transition-all"
                    >
                        <span className="relative z-10 flex items-center gap-1.5">
                            {poster.action}
                            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                        </span>

                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent z-0" />
                    </motion.button>
                </motion.div>
            </div>

            {/* Decorative Geometric Elements */}
            <div className="absolute top-4 right-4 z-20 flex gap-1">
                <div className="w-1 h-1 bg-white/50 rounded-full" />
                <div className="w-1 h-1 bg-white/30 rounded-full" />
                <div className="w-1 h-1 bg-white/10 rounded-full" />
            </div>

        </div>
    );
};

export default PosterKiosk;
