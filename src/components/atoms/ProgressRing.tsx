"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
  animate?: boolean;
  className?: string;
}

const ProgressRing = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = "#E53E3E", // Blood red color
  backgroundColor = "#F0F0F0",
  children,
  animate = true,
  className = "",
}: ProgressRingProps) => {
  const [currentProgress, setCurrentProgress] = useState(0);
  
  // Calculate the center point and radius
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  
  // Calculate the circumference of the circle
  const circumference = 2 * Math.PI * radius;
  
  // Calculate the stroke dash offset based on the progress
  const strokeDashoffset = circumference - (currentProgress / 100) * circumference;
  
  // Animation variants
  const circleVariants = {
    hidden: { strokeDashoffset: circumference },
    visible: { 
      strokeDashoffset,
      transition: { duration: 1.5, ease: "easeInOut" as const }
    }
  };

  useEffect(() => {
    if (animate) {
      setCurrentProgress(progress);
    } else {
      setCurrentProgress(progress);
    }
  }, [progress, animate]);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial="hidden"
          animate="visible"
          variants={circleVariants}
          style={{ 
            transformOrigin: "center",
            rotate: "-90deg"
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default ProgressRing;