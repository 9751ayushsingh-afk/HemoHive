"use client";

import React from "react";
import dynamic from "next/dynamic";
import AnimatedText from '../components/AnimatedText';
import Link from "next/link";
import { motion } from "framer-motion";

// Dynamically import components

const StickyScrollReveal = dynamic(() => import("../components/StickyScrollReveal"), { ssr: false });
const ChaosScroll = dynamic(() => import("../components/organisms/ChaosScroll"), { ssr: false });
const HowItWorks = dynamic(() => import("../components/organisms/HowItWorks"), { ssr: false });
const WhatWeAre = dynamic(() => import("../components/organisms/WhatWeAre"), { ssr: false });
const Footer = dynamic(() => import("../components/organisms/Footer"), { ssr: false });
import { useMobile } from "../hooks/use-mobile";
const MobileHero = dynamic(() => import("../components/MobileHero"), { ssr: false });
const LiquidEther = dynamic(() => import("../components/LiquidEther"), { ssr: false });

const Home = () => {
  const isMobile = useMobile();

  return (
    <div className="bg-black text-white">
      <div className="relative h-screen">
        {isMobile ? (
          <MobileHero />
        ) : (
          <LiquidEther
            colors={['#1a0505', '#8a0000', '#ff0022', '#ff4d4d']}
            mouseForce={30}
            cursorSize={120}
            isViscous={true}
            viscous={45}
            dt={0.018}
            BFECC={true}
            iterationsViscous={40}
            iterationsPoisson={32}
            autoIntensity={3.0}
          />
        )}

        <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
          <div className="text-center">
            <>
              <AnimatedText text="HemoHive" el="h1" className="text-7xl md:text-9xl font-bold font-accent tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400" />
              <AnimatedText text="When Every Second Matters, We Deliver." el="h2" className="text-2xl md:text-3xl mt-6 font-accent tracking-tight text-neutral-300" />
              <motion.div
                className="mt-8 flex justify-center items-center gap-8 pointer-events-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Link
                  href="/register"
                  className="glowing-edge relative inline-flex items-center justify-center p-4 px-6 py-3 overflow-hidden font-medium text-white transition duration-300 ease-out bg-secondary rounded-full shadow-md group"
                >
                  <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-accent group-hover:translate-x-0 ease">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </span>
                  <span className="absolute flex items-center justify-center w-full h-full text-white transition-all duration-300 transform group-hover:translate-x-full ease">Get Started</span>
                  <span className="relative invisible">Get Started</span>
                </Link>
                <a href="#" className="text-white font-bold hover:underline">Learn More</a>
              </motion.div>
            </>
          </div>
        </div>
      </div>

      <StickyScrollReveal />

      <main>
        <HowItWorks />
        <WhatWeAre />
        <ChaosScroll />
      </main>

      <Footer />
    </div>
  );
};

export default Home;