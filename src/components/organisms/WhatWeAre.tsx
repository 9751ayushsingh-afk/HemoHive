"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import dynamic from "next/dynamic";

const Antigravity = dynamic(() => import("../Antigravity"), { ssr: false });

const WhatWeAre = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);

    useEffect(() => {
        if (isInView && videoRef.current) {
            videoRef.current.play().catch(e => console.log("Autoplay prevented", e));
        }
    }, [isInView]);

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    };

    return (
        <section ref={ref} className="relative py-32 bg-black overflow-hidden text-white">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0 opacity-40">
                <Antigravity count={150} />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-neutral-500"
                    >
                        Who We Are
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed"
                    >
                        More than just a platform. We are the lifeline that connects need with hope.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="relative max-w-6xl mx-auto rounded-xl overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.05)] border border-neutral-800 bg-neutral-900/50 aspect-video group"
                >
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        loop
                        muted={isMuted}
                        playsInline
                        controls={false} // Custom controls or just simple click to toggle
                    // poster="can_add_poster_if_needed"
                    >
                        <source src="https://res.cloudinary.com/drwfe1mhk/video/upload/v1771395438/hemohive_assets/what_we_are_video.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                    {/* Custom Controls / Indicators */}
                    <div className="absolute bottom-6 left-6 z-20 flex items-center gap-4">
                        <button
                            onClick={toggleMute}
                            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
                        >
                            {isMuted ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                            )}
                        </button>
                    </div>

                    {/* Play/Pause Overlay on Click */}
                    <div
                        className="absolute inset-0 z-10 cursor-pointer"
                        onClick={toggleMute}
                    />
                </motion.div>
            </div>
        </section>
    );
};

export default WhatWeAre;
