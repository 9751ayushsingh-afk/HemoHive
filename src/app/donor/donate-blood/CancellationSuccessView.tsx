'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HeartOff, ArrowLeft, Info } from 'lucide-react';

interface CancellationSuccessViewProps {
    onBack: () => void;
}

const CancellationSuccessView: React.FC<CancellationSuccessViewProps> = ({ onBack }) => {
    return (
        <div className="max-w-xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            {/* Premium Depth Container */}
            <div className="relative w-full">
                {/* Background Glows for Depth */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-slate-200/40 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-slate-100/30 rounded-full blur-3xl" />

                <div className="relative bg-white/70 backdrop-blur-xl border border-white/40 rounded-[3rem] p-10 md:p-14 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.12)] overflow-hidden">
                    {/* Inner Light Effect */}
                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_2px_1px_rgba(255,255,255,1)] rounded-[3rem]" />

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", damping: 15, stiffness: 100 }}
                        className="w-28 h-28 bg-gradient-to-br from-slate-50 to-slate-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-200/50"
                    >
                        <HeartOff className="text-slate-400" size={48} strokeWidth={1.5} />
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Appointment Cancelled</h1>
                        <p className="text-slate-500 font-medium mb-10 leading-relaxed text-lg">
                            We understand plans change. Your slot has been released back to the community.
                        </p>

                        <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 mb-10 text-left flex gap-4 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-100/30 rounded-bl-[4rem] transition-all group-hover:bg-slate-100/50" />
                            <Info className="text-slate-400 shrink-0 mt-0.5 relative z-10" size={24} />
                            <div className="relative z-10">
                                <p className="text-sm font-bold text-slate-800 mb-1 leading-none uppercase tracking-widest">Next Opportunity</p>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    You are eligible to schedule another donation immediately. Every second counts for patients in need.
                                </p>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onBack}
                            className="w-full py-5 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 transition-all hover:bg-slate-800 flex items-center justify-center gap-3 group"
                        >
                            <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
                            <span>Back to Donor Dashboard</span>
                        </motion.button>

                        <p className="mt-8 text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">
                            Stay Connected • Save Lives
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CancellationSuccessView;
