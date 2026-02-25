'use client';

import React, { useEffect, useState } from 'react';
import DemandForecastChart from '@/components/hospital/DemandForecastChart';
import { Brain, CalendarDays, Activity, AlertTriangle, TrendingUp, TrendingDown, Info, Droplet } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const BLOOD_COLORS: Record<string, string> = {
  'O+': '#ef4444',
  'A+': '#f97316',
  'B+': '#8b5cf6',
  'AB+': '#ec4899',
  'O-': '#fca5a5',
  'A-': '#fdba74',
  'B-': '#c4b5fd',
  'AB-': '#fbcfe8',
};

// Sub-component for individual blood group charts
const MiniBloodChart = ({ bg, data, color }: { bg: string, data: any, color: string }) => {
  // Combine 7 days historical and 7 days forecast for a seamless line
  const chartData = [
    ...data.historical_7d.map((val: number, i: number) => ({ day: i - 7, val, type: 'hist' })),
    ...data.forecast_7d.map((val: number, i: number) => ({ day: i + 1, val, type: 'pred' }))
  ];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-4 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-20 blur-[50px] transition-opacity group-hover:opacity-40" style={{ backgroundColor: color }} />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center space-x-2">
          <Droplet className="w-5 h-5" style={{ color }} />
          <h4 className="text-xl font-bold text-white tracking-tight">{bg}</h4>
        </div>
        <div className={`flex items-center space-x-1 text-xs font-bold px-2 py-1 rounded-full ${data.trend === 'up' ? 'bg-red-500/20 text-red-400' : data.trend === 'down' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
          {data.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : (data.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : <Activity className="w-3 h-3" />)}
          <span className="uppercase">{data.trend}</span>
        </div>
      </div>

      <div className="h-24 w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`grad-${bg.replace('+', 'p').replace('-', 'm')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.5} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '8px', fontSize: '10px' }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ display: 'none' }}
            />
            <Area
              type="monotone"
              dataKey="val"
              stroke={color}
              strokeWidth={2}
              fill={`url(#grad-${bg.replace('+', 'p').replace('-', 'm')})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-white/50 relative z-10 flex justify-between">
        <span>Predicted 7D Total:</span>
        <span className="font-bold text-white">{data.total_predicted} units</span>
      </div>
    </motion.div>
  );
};

export default function ForecastPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res = await fetch(`/api/hospital/forecast?t=${new Date().getTime()}`);
        const result = await res.json();

        if (result.forecast) {
          setData(result.forecast);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
          <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-red-500 animate-pulse" />
        </div>
        <p className="text-white/60 font-outfit tracking-widest uppercase text-sm animate-pulse">Initializing Neural Models...</p>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-white">Error loading forecast data.</div>;

  const { overall, granular, consensus } = data;

  return (
    <div className="w-full space-y-8 font-sans pb-20">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight font-outfit">AI Demand Forecast</h1>
        <p className="text-base text-gray-400 font-medium opacity-80">
          Predictive analytics to anticipate blood unit requirements and optimize inventory.
        </p>
      </div>

      {/* Vibrant Notice Board / Consensus */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl p-8 border border-red-500/30 bg-gradient-to-br from-red-900/40 via-black to-black shadow-[0_0_50px_rgba(239,68,68,0.1)]"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2 text-red-400 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-bold tracking-widest uppercase text-xs">AI Consensus Report</span>
            </div>
            <h2 className="text-2xl font-bold text-white leading-tight">
              {consensus.message}
            </h2>
            <p className="text-white/60 text-sm">
              Computed from multi-dimensional Random Forest processing across {overall.length} future projections.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center min-w-[120px]">
              <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Peak Demand Date</p>
              <p className="text-xl font-bold text-white">{new Date(consensus.peak_demand_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            </div>
            <div className="bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-2xl p-4 text-center min-w-[120px]">
              <p className="text-xs text-red-300/70 uppercase tracking-wider mb-1">Total Expected</p>
              <p className="text-xl font-bold text-red-400">{consensus.total_expected_units} Units</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overall Chart */}
      <div className="w-full">
        <DemandForecastChart data={overall} />
      </div>

      {/* Granular Individual Charts */}
      <div>
        <div className="flex items-center space-x-2 mb-6">
          <Activity className="w-5 h-5 text-indigo-400" />
          <h3 className="text-xl font-bold text-white tracking-tight">Granular Predictions by Blood Group</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(granular).map(([bg, bgData]: [string, any]) => (
            <MiniBloodChart
              key={bg}
              bg={bg}
              data={bgData}
              color={BLOOD_COLORS[bg] || BLOOD_COLORS['default']}
            />
          ))}
        </div>
      </div>

      <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/5 p-6 mt-8 flex items-start space-x-4">
        <Info className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
        <div>
          <h3 className="text-sm font-bold text-white mb-1">Algorithmic Transparency</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            Predictions are dynamically weighted using recent fulfilled requests (90%), synthetic baseline calibration (10%), and time-series feature extraction (Day of week, seasonal shifts). Notice board flags are generated when the forecasted 7D demand outweighs the historical 7D rolling average by &gt;10%.
          </p>
        </div>
      </div>
    </div>
  );
}
