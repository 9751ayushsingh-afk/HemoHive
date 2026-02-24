'use client';

import React from 'react';
import AnalyticsDashboard from '@/components/hospital/analytics/AnalyticsDashboard';
import { motion } from 'framer-motion';
import { ShieldAlert, Database, Lock, FileText, Activity } from 'lucide-react';

const AnalyticsPage = () => {
  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 overflow-hidden relative p-10 rounded-[3rem] bg-gradient-to-br from-red-600 via-red-700 to-red-900 shadow-2xl shadow-red-600/30 border border-white/10"
      >
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Secure Access Required</span>
              </div>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-white/40 animate-pulse" />
                <div className="w-1 h-1 rounded-full bg-white/40 animate-pulse delay-75" />
              </div>
            </motion.div>

            <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 font-outfit tracking-tighter uppercase leading-[0.9]">
              Visual <span className="text-red-200">Record</span> <br /> Room
            </h1>

            <p className="text-red-100 font-medium opacity-80 max-w-xl text-lg leading-relaxed">
              An immutable ledger of clinical inventory. This high-fidelity console orchestrates
              real-time stock dynamics, transaction flows, and critical demand forecasting.
            </p>

            <div className="mt-8 flex gap-6">
              <div className="flex items-center gap-2">
                <Database className="text-red-300" size={16} />
                <span className="text-xs font-bold text-red-100/60 uppercase tracking-widest">Global Sync</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="text-red-300" size={16} />
                <span className="text-xs font-bold text-red-100/60 uppercase tracking-widest">Encrypted</span>
              </div>
            </div>
          </div>

          {/* Niche Icon Component */}
          <div className="relative">
            <motion.div
              animate={{
                rotateY: [0, 15, 0, -15, 0],
                rotateX: [0, -10, 0, 10, 0],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="relative w-48 h-48 lg:w-56 lg:h-56 flex items-center justify-center"
            >
              {/* Spinning Rings */}
              <div className="absolute inset-0 border-2 border-dashed border-white/20 rounded-full animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-4 border border-white/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

              {/* The Vault Icon */}
              <div className="relative z-20 p-8 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.3)] group overflow-hidden">
                <Lock
                  size={64}
                  className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-transform group-hover:scale-110 duration-700"
                />

                {/* Core Pulse */}
                <div className="absolute inset-0 bg-red-500/10 animate-pulse" />

                {/* Digital Scanning Scanning Beam */}
                <motion.div
                  animate={{ top: ['-10%', '110%', '-10%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-400 to-transparent z-30 shadow-[0_0_15px_rgba(248,113,113,0.8)]"
                />

                {/* Internal HUD elements */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-white/20" />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-white/20" />
              </div>

              {/* Floating Decorative Icons */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute -top-4 -right-2 p-3 bg-red-500 rounded-2xl shadow-xl border border-white/20"
              >
                <FileText size={20} className="text-white" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-2 p-3 bg-white rounded-2xl shadow-xl border border-red-200"
              >
                <Activity size={20} className="text-red-600" />
              </motion.div>
            </motion.div>

            {/* Bloom Effect */}
            <div className="absolute inset-0 bg-red-400/20 blur-[80px] -z-10 rounded-full" />
          </div>
        </div>

        {/* Decorative Corner Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black/20 rounded-full blur-3xl pointer-events-none" />
      </motion.div>

      <AnalyticsDashboard />
    </div>
  );
};

export default AnalyticsPage;
