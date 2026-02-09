'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface WastageMeterProps {
    score?: number; // 0-100
    wastagePercentage?: number;
    savedCount?: number;
}

const WastageMeter: React.FC<WastageMeterProps> = ({
    score = 85,
    wastagePercentage = 15,
    savedCount = 12
}) => {
    // Color Logic
    const getColor = (s: number) => {
        if (s >= 80) return '#10B981'; // Emerald-500
        if (s >= 50) return '#F59E0B'; // Amber-500
        return '#EF4444'; // Red-500
    };

    const strokeColor = getColor(score);
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200 flex items-center justify-between">

            {/* 1. The Gauge */}
            <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="transform -rotate-90 w-20 h-20">
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke="#E5E7EB"
                        strokeWidth="8"
                        fill="transparent"
                    />
                    <motion.circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke={strokeColor}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-neutral-800">{score}</span>
                    <span className="text-[9px] text-neutral-400 uppercase">Score</span>
                </div>
            </div>

            {/* 2. The Text Stats */}
            <div className="flex-1 ml-4">
                <h3 className="text-sm font-semibold text-neutral-900 mb-1">Exchange Efficiency</h3>
                <p className="text-xs text-neutral-500 leading-tight">
                    Current Wastage: <span className="font-medium text-neutral-800">{wastagePercentage}%</span>
                </p>

                <div className="mt-2 flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs font-bold">
                        {savedCount}
                    </span>
                    <span className="text-xs text-neutral-500">Lives Saved (One-Hop)</span>
                </div>
            </div>

            {/* 3. Action / Status Chip */}
            <div className="flex flex-col items-end">
                <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider"
                    style={{
                        backgroundColor: `${strokeColor}20`,
                        color: strokeColor
                    }}
                >
                    {score >= 80 ? 'Optimal' : score >= 50 ? 'Warning' : 'Critical'}
                </span>
            </div>

        </div>
    );
};

export default WastageMeter;
