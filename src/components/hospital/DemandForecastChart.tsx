'use client';

import React, { useEffect, useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Brain, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const BLOOD_COLORS: Record<string, string> = {
    'O+': '#ef4444',
    'A+': '#f97316',
    'B+': '#8b5cf6',
    'AB+': '#ec4899',
    'O-': '#fca5a5',
    'A-': '#fdba74',
    'B-': '#c4b5fd',
    'AB-': '#fbcfe8',
    'default': '#6366f1'
};

interface Props {
    data?: any[];
}

export default function DemandForecastChart({ data: passedData }: Props) {
    const [fetchedData, setFetchedData] = useState<any[]>([]);
    const [loading, setLoading] = useState(!passedData);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (passedData) return;

        const fetchForecast = async () => {
            try {
                const res = await fetch('/api/hospital/forecast');
                const result = await res.json();

                if (result.error) throw new Error(result.error);

                // Handle both new API format and fallback
                if (result.forecast && result.forecast.overall) {
                    setFetchedData(result.forecast.overall);
                } else if (result.forecast) {
                    setFetchedData(result.forecast);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchForecast();
    }, [passedData]);

    const data = passedData || fetchedData;

    if (loading) {
        return (
            <div className="h-64 flex flex-col items-center justify-center space-y-4 bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                    <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-red-500 animate-pulse" />
                </div>
                <p className="text-white/40 text-sm animate-pulse">AI is analyzing demand patterns...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-64 flex flex-col items-center justify-center space-y-2 bg-red-500/5 backdrop-blur-xl rounded-2xl border border-red-500/20">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <p className="text-red-400/80 text-sm">Failed to load AI Forecast</p>
                <button
                    onClick={() => window.location.reload()}
                    className="text-white/40 text-xs hover:text-white transition-colors"
                >
                    Try connecting ML service
                </button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group"
        >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[100px] pointer-events-none -mr-32 -mt-32" />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center space-x-2 text-red-500 mb-1">
                        <Brain className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Neural Predictor v1.0</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Overall Demand Forecast</h3>
                    <p className="text-white/40 text-xs mt-1">Projected units needed for the next 7 days</p>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                    <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-[10px] font-bold text-green-400 uppercase">Interactive Chart</span>
                </div>
            </div>

            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            {['O+', 'A+', 'B+', 'AB+'].map((bg) => (
                                <linearGradient key={bg} id={`gradient-${bg.replace('+', 'plus')}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={BLOOD_COLORS[bg]} stopOpacity={0.4} />
                                    <stop offset="95%" stopColor={BLOOD_COLORS[bg]} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#ffffff20"
                            fontSize={10}
                            tickFormatter={(str) => {
                                const date = new Date(str);
                                return date.toLocaleDateString('en-US', { weekday: 'short' });
                            }}
                        />
                        <YAxis stroke="#ffffff20" fontSize={10} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#000000ee',
                                border: '1px solid #ffffff10',
                                borderRadius: '16px',
                                backdropFilter: 'blur(10px)',
                                fontSize: '12px'
                            }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                        {['O+', 'A+', 'B+', 'AB+'].map(bg => (
                            <Area
                                key={bg}
                                type="monotone"
                                dataKey={bg}
                                stroke={BLOOD_COLORS[bg]}
                                fillOpacity={1}
                                fill={`url(#gradient-${bg.replace('+', 'plus')})`}
                                strokeWidth={2}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
