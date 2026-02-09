"use client";
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(MotionPathPlugin);

const BeeLoader = ({ onAnimationComplete }) => {
  const beeRef = useRef(null);
  const trailRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      defaults: { duration: 2, ease: "power2.inOut" },
    });

    // Bee flight path animation
    tl.to(beeRef.current, {
      duration: 4,
      motionPath: {
        path: "M100,400 C200,150 600,150 700,400 S1000,650 1100,400",
        curviness: 1.5,
        autoRotate: true,
      },
      onUpdate: () => {
        const pathLength = trailRef.current.getTotalLength();
        const progress = tl.progress();
        trailRef.current.style.strokeDasharray = pathLength;
        trailRef.current.style.strokeDashoffset = pathLength * (1 - progress);
      },
    });

    // Bee lands on the “H”
    tl.to(beeRef.current, {
      duration: 1,
      y: -20,
      scale: 1.1,
      ease: "bounce.out",
    });

    // Logo reveal
    tl.to(
      logoRef.current,
      { opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" },
      "-=0.5"
    );

    // Fade out loader
    tl.to(".loader-container", {
      opacity: 0,
      duration: 1,
      delay: 1,
      onComplete: onAnimationComplete,
    });
  }, []);

  return (
    <motion.div
      className="loader-container flex items-center justify-center h-screen w-screen bg-gradient-to-b from-[#0B0B0B] to-[#1A0000]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      <svg width="100%" height="100%" viewBox="0 0 1200 600">
        {/* Trail Path */}
        <path
          ref={trailRef}
          d="M100,400 C200,150 600,150 700,400 S1000,650 1100,400"
          stroke="#FFD54F"
          strokeWidth="3"
          fill="none"
          strokeDasharray="10 10"
          opacity="0.6"
          style={{ filter: "drop-shadow(0px 0px 4px #FFD54F)" }}
        />

        {/* Bee Icon */}
        <g ref={beeRef}>
          <circle cx="0" cy="0" r="12" fill="#FFD54F" stroke="#000" strokeWidth="2" />
          <circle cx="-6" cy="-8" r="6" fill="#FFF176" />
          <circle cx="6" cy="-8" r="6" fill="#FFF176" />
        </g>
      </svg>

      {/* HemoHive Logo */}
      <motion.div
        ref={logoRef}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0, scale: 0.8 }}
        className="absolute bottom-24 text-center"
      >
        <h1 className="text-6xl font-bold text-[#F9B208] tracking-wider">
          Hemo<span className="text-[#D72638]">Hive</span>
        </h1>
        <p className="text-gray-400 mt-2 text-lg">Delivering Hope, Saving Lives</p>
      </motion.div>
    </motion.div>
  );
};

export default BeeLoader;