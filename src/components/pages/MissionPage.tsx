'use client';
import React, { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';

const MissionPage = () => {
    const { scrollY } = useScroll();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({
                x: (e.clientX / window.innerWidth - 0.5) * 20, // -10 to 10 deg tilt
                y: (e.clientY / window.innerHeight - 0.5) * 10
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="relative w-full !bg-white overflow-hidden">

            {/* FIXED BACKGROUND */}
            <div
                className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    perspective: '1000px',
                    overflow: 'hidden'
                }}
            >
                {/* FLOATING PARTICLES */}
                <motion.div
                    className="absolute inset-0"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{
                        rotateX: mousePos.y * 0.2,
                        rotateY: mousePos.x * 0.2,
                    }}
                >
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-neutral-300 font-bold text-2xl select-none"
                            initial={{
                                x: Math.random() * window.innerWidth,
                                y: window.innerHeight + 100,
                                opacity: 0,
                                scale: 0.5,
                            }}
                            animate={{
                                y: -100,
                                opacity: [0, 0.6, 0],
                            }}
                            transition={{
                                duration: Math.random() * 10 + 15,
                                repeat: Infinity,
                                delay: Math.random() * 5,
                                ease: "linear"
                            }}
                            style={{
                                left: `${Math.random() * 100}%`,
                            }}
                        >
                            +
                        </motion.div>
                    ))}
                </motion.div>

                {/* Main Grid Plane */}
                <motion.div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, #999999 3px, transparent 3px),
                            linear-gradient(to bottom, #999999 3px, transparent 3px)
                        `,
                        backgroundSize: '150px 150px',
                        width: '200vw',
                        height: '200vh',
                        top: '-50%',
                        left: '-50%',
                        transformOrigin: '50% 100%',
                    }}
                    animate={{
                        backgroundPosition: ["0px 0px", "0px 150px"],
                        rotateX: 60 + mousePos.y * 0.5,
                        rotateY: mousePos.x * 0.2
                    }}
                    transition={{
                        backgroundPosition: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                        },
                        rotateX: { type: "spring", stiffness: 100, damping: 30 },
                        rotateY: { type: "spring", stiffness: 100, damping: 30 }
                    }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent z-10" />
            </div>

            {/* SECTION 1: INTRO (Header + Doodle) */}
            <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-20">
                <motion.h1
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-7xl md:text-9xl text-black mb-6 font-accent italic tracking-tight text-center"
                >
                    Our Mission
                </motion.h1>

                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.8, ease: "easeInOut" }}
                    className="w-full max-w-xs h-[2px] bg-black mx-auto mb-10"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    className="mb-12 relative w-64 h-64 mx-auto"
                >
                    <img
                        src="/mission_first_boy.png"
                        alt="Mission Doodle"
                        className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
                        style={{ mixBlendMode: 'multiply' }}
                    />
                </motion.div>

                <div className="overflow-hidden text-center">
                    <motion.p
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-lg md:text-2xl text-neutral-800 font-medium leading-relaxed max-w-3xl mx-auto"
                        style={{ fontFamily: '"JetBrains Mono", monospace' }}
                    >
                        Building the <span className="text-black font-bold">digital nervous system</span> for India's blood supply.
                        Precise. Transparent. <span className="italic">Infinite.</span>
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        className="mt-8 flex justify-center gap-4 text-xs font-bold tracking-widest uppercase text-neutral-400"
                        style={{ fontFamily: '"Inter", sans-serif' }}
                    >
                        <span>[ EST. 2025 ]</span>
                        <span>•</span>
                        <span>[ SYSTEM ACTIVE ]</span>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 2: MANIFESTO (Text Left / Image Right) */}
            <section className="relative z-10 min-h-screen flex items-center justify-center px-6 md:px-20 py-20">
                <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    {/* LEFT: TEXT */}
                    <div className="flex flex-col gap-8">
                        <motion.h2
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="text-5xl md:text-7xl font-accent text-black leading-tight italic"
                        >
                            We Exist Because <br />
                            <span className="relative inline-block">
                                <span className="not-italic font-black relative z-10">Time Decides Life.</span>
                                {/* Hand-Drawn Circle SVG */}
                                <svg
                                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] z-0 pointer-events-none text-red-600"
                                    viewBox="0 0 300 120"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <motion.path
                                        d="M10,60 Q150,-10 290,60 T10,60"
                                        stroke="currentColor"
                                        strokeWidth="5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        whileInView={{ pathLength: 1, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.8, delay: 0.5, ease: "easeInOut" }}
                                    />
                                    {/* Shortened Trail */}
                                    <motion.path
                                        d="M10,60 Q150,130 290,60"
                                        stroke="currentColor"
                                        strokeWidth="5"
                                        strokeLinecap="round"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        whileInView={{ pathLength: 0.6, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: 1.3, ease: "easeOut" }}
                                    />
                                </svg>
                            </span>
                        </motion.h2>

                        <div className="space-y-6 text-lg md:text-xl text-neutral-800" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                            >
                                Every second lost in searching for blood is a second too late for someone in need.
                            </motion.p>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                            >
                                Blood shortages are not rare events. They are daily realities — silent, widespread, and deadly.
                            </motion.p>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.6, duration: 0.6 }}
                                className="font-bold text-black"
                            >
                                Lives are lost not because blood doesn’t exist, but because it doesn’t arrive on time.
                            </motion.p>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.8, duration: 0.6 }}
                                className="text-sm uppercase tracking-widest text-neutral-500 mt-8 border-l-2 border-black pl-4"
                                style={{ fontFamily: '"Inter", sans-serif' }}
                            >
                                That is the problem we chose to take personally.
                            </motion.p>
                        </div>
                    </div>

                    {/* RIGHT: IMAGE */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative w-full bg-neutral-100 rounded-lg overflow-hidden shadow-2xl border border-neutral-200"
                    >
                        <img
                            src="/mission_first.png"
                            alt="Manifesto Image"
                            className="w-full h-auto block"
                        />
                    </motion.div>
                </div>
            </section>

            {/* SECTION 3: RESPONSIBILITY (Image Left / Text Right) */}
            <section className="relative z-10 min-h-screen flex items-center justify-center px-6 md:px-20 py-20">
                <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                    {/* LEFT: IMAGE (Order 2 on mobile, Order 1 on desktop) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative w-full bg-neutral-100 rounded-lg overflow-hidden shadow-2xl border border-neutral-200 order-2 md:order-1"
                    >
                        <img
                            src="/mission_responsibility.png"
                            alt="Responsibility Image"
                            className="w-full h-auto block"
                        />
                    </motion.div>

                    {/* RIGHT: TEXT (Order 1 on mobile, Order 2 on desktop) */}
                    <div className="flex flex-col gap-8 order-1 md:order-2">
                        <motion.h2
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="text-5xl md:text-7xl font-accent text-black leading-tight italic"
                        >
                            Our Mission Is Simple. <br />
                            <span className="relative inline-block">
                                <span className="not-italic font-black relative z-10">Our Responsibility Is Not.</span>
                                {/* Yellow Highlighter SVG */}
                                <svg
                                    className="absolute -top-1 -left-8 w-[125%] h-[120%] z-0 pointer-events-none"
                                    viewBox="0 0 400 60"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <motion.path
                                        d="M10,35 Q200,30 390,35"
                                        stroke="#FDE047"
                                        strokeWidth="35"
                                        strokeLinecap="square"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        whileInView={{ pathLength: 1, opacity: 0.8 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                                    />
                                </svg>
                            </span>
                        </motion.h2>

                        <div className="space-y-6 text-lg md:text-xl text-neutral-800" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                            >
                                We are here to ensure that no life is denied blood because systems failed.
                            </motion.p>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                                className="font-bold text-black"
                            >
                                HemoHive is built to move faster than emergencies, smarter than manual coordination, and fairer than broken supply chains.
                            </motion.p>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.6, duration: 0.6 }}
                                className="text-sm uppercase tracking-widest text-neutral-500 mt-8 border-l-2 border-black pl-4"
                                style={{ fontFamily: '"Inter", sans-serif' }}
                            >
                                We are driven by one belief: Access to blood should never depend on luck.
                            </motion.p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4: PRINCIPLES (Text Left / Image Right) */}
            <section className="relative z-10 min-h-screen flex items-center justify-center px-6 md:px-20 py-20">
                <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                    {/* LEFT: TEXT */}
                    <div className="flex flex-col gap-8">
                        <motion.h2
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="text-5xl md:text-7xl font-accent text-black leading-tight italic"
                        >
                            The Principles <br />
                            <span className="relative inline-block">
                                <span className="not-italic font-black relative z-10">That Guide Us.</span>
                                {/* Hand-Drawn Circle SVG */}
                                <svg
                                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] z-0 pointer-events-none text-red-600"
                                    viewBox="0 0 300 120"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <motion.path
                                        d="M10,60 Q150,-10 290,60 T10,60"
                                        stroke="currentColor"
                                        strokeWidth="5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        whileInView={{ pathLength: 1, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.8, delay: 0.5, ease: "easeInOut" }}
                                    />
                                    {/* Shortened Trail */}
                                    <motion.path
                                        d="M10,60 Q150,130 290,60"
                                        stroke="currentColor"
                                        strokeWidth="5"
                                        strokeLinecap="round"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        whileInView={{ pathLength: 0.6, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: 1.3, ease: "easeOut" }}
                                    />
                                </svg>
                            </span>
                        </motion.h2>

                        <div className="space-y-8 text-neutral-800" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="text-xl"
                            >
                                These are not values on a wall. <span className="font-bold">They are decisions we make every day.</span>
                            </motion.p>

                            <ul className="space-y-4 my-8">
                                {[
                                    "Life Over Everything",
                                    "Speed With Purpose",
                                    "Transparency Without Compromise",
                                    "Responsibility Over Convenience",
                                    "Local First. Human Always."
                                ].map((item, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 + (index * 0.1), duration: 0.5 }}
                                        className="text-2xl font-bold flex items-center gap-4 group cursor-default hover:text-black transition-colors"
                                    >
                                        <span className="w-2 h-2 bg-red-600 rounded-full opacity-60 group-hover:opacity-100 group-hover:scale-150 transition-all duration-300" />
                                        {item}
                                    </motion.li>
                                ))}
                            </ul>

                            <div className="space-y-4 pt-6 border-t border-neutral-300">
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.8, duration: 0.6 }}
                                    className="text-lg italic"
                                >
                                    "We build slowly where it matters. We move fast where it saves lives."
                                </motion.p>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 1.0, duration: 0.6 }}
                                    className="text-sm uppercase tracking-widest text-neutral-500 font-bold"
                                    style={{ fontFamily: '"Inter", sans-serif' }}
                                >
                                    Because at the end of every system, there is a human waiting.
                                </motion.p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: IMAGE */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative w-full bg-neutral-100 rounded-lg overflow-hidden shadow-2xl border border-neutral-200"
                    >
                        <img
                            src="/mission_principles.png"
                            alt="Principles Image"
                            className="w-full h-auto block"
                        />
                    </motion.div>
                </div>
            </section>

            {/* SECTION 5: SIGNATURE (Bottom Right) */}
            <section className="relative z-10 py-32 flex flex-col items-end justify-center text-right px-6 md:px-20">
                <div className="relative">
                    {/* Hindi Signature with Write-on Effect */}
                    <motion.div
                        initial={{ clipPath: "polygon(0 0, 0 100%, 0 100%, 0 0)" }}
                        whileInView={{ clipPath: "polygon(0 0, 0 100%, 100% 100%, 100% 0)" }}
                        viewport={{ once: true }}
                        transition={{ duration: 2.5, ease: "linear", delay: 0.5 }}
                        className="text-6xl md:text-8xl font-black text-black mb-6 leading-tight select-none"
                        style={{ fontFamily: '"Kalam", "Tillana", "Noto Serif Devanagari", cursive' }}
                    >
                        आयुष सिंह
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 3.0, duration: 0.8 }}
                    className="flex flex-col items-end gap-2"
                >
                    <span className="text-sm md:text-base font-bold tracking-[0.2em] text-neutral-900 uppercase" style={{ fontFamily: '"Inter", sans-serif' }}>
                        Ayush Singh
                    </span>
                    <span className="text-xs md:text-sm tracking-widest text-neutral-500 uppercase" style={{ fontFamily: '"Inter", sans-serif' }}>
                        Founder of HemoHive
                    </span>
                </motion.div>
            </section>
        </div>
    );
};

export default MissionPage;
