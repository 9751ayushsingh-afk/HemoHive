
"use client";

import { motion } from "framer-motion";

import dynamic from "next/dynamic";

const Antigravity = dynamic(() => import("@/components/Antigravity"), { ssr: false });

const HeatmapPreview = () => {
  return (
    <div className="bg-white relative py-24 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Antigravity count={150} />
      </div>
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-black mb-12 relative z-10">
          Live Demand Heatmap
        </h2>
        <div className="relative w-full h-[500px] bg-accent rounded-lg overflow-hidden">
          {/* Placeholder for map background */}
          <div className="absolute inset-0 bg-secondary" />

          {/* Animated pulses */}
          <motion.div
            className="absolute top-1/4 left-1/4 bg-primary/50 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-12 h-12 bg-hemohive-red/50 rounded-full"
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
          <motion.div
            className="absolute top-2/3 left-1/3 w-20 h-20 bg-hemohive-red/50 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default HeatmapPreview;
