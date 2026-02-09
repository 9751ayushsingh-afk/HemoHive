'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

const ActiveCreditCard = ({ credit }: { credit: any }) => {
    // Remove conflicting refs or use them purely for DOM measurement if needed. 
    // Framer motion handles the element ref internally if we don't pass one, 
    // or we can just let Framer control the animation state.

    const queryClient = useQueryClient();
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Removed GSAP logic to prevent conflict

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const dueDate = new Date(credit.dueDate).getTime();
            const issuedDate = new Date(credit.issuedDate).getTime();
            const distance = dueDate - now;

            if (distance < 0) {
                // If time is up, we don't want to hide the card, just show 0
                clearInterval(interval);
                setTimeLeft({ days: 0, hours: 0, minutes: 0 });
                setProgress(100);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            setTimeLeft({ days, hours, minutes });

            const totalDuration = dueDate - issuedDate;
            const timePassed = now - issuedDate;
            setProgress(Math.min(100, (timePassed / totalDuration) * 100));

        }, 1000);

        return () => clearInterval(interval);
    }, [credit]);

    const [showReturnModal, setShowReturnModal] = useState(false);
    const [isReturning, setIsReturning] = useState(false);

    const handleExtension = async () => {
        try {
            await axios.patch('/api/credits/extension', { creditId: credit._id });
            queryClient.invalidateQueries({ queryKey: ['userCredits'] });
        } catch (error) {
            console.error("Failed to request extension:", error);
        }
    };

    const handleReturn = async () => {
        setIsReturning(true);
        try {
            await axios.post('/api/credits/return', {
                creditId: credit._id,
                userId: credit.userId,
                hospitalId: credit.requestId.hospitalId._id
            });
            setShowReturnModal(false);
            // alert("Return Initiated! Please visit the hospital to complete the process.");
            queryClient.invalidateQueries({ queryKey: ['userCredits'] });
        } catch (error: any) {
            console.error("Failed to initiate return:", error);
            // alert(error.response?.data?.error || "Failed to initiate return");
        } finally {
            setIsReturning(false);
        }
    };

    const barColor = progress > 80 ? 'bg-red-500' : progress > 50 ? 'bg-amber-500' : 'bg-emerald-400';

    return (
        <motion.div
            className="group relative p-6 rounded-2xl mb-6 overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-slate-900/95 to-slate-800/95"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.01, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)" }}
        >
            {/* Ambient Glow - Interactive */}
            <motion.div
                className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <div className="relative z-10">
                {/* Header Section */}
                <motion.div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="relative group/icon">
                            <div className="absolute inset-0 bg-cyan-500/40 blur-lg rounded-xl opacity-0 group-hover/icon:opacity-100 transition-opacity"></div>
                            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-900/20">
                                <span className="text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{credit.requestId?.bloodGroup || "B+"}</span>
                            </div>
                        </div>
                        <div>
                            <p className="font-bold text-xl text-white leading-tight tracking-tight">{credit.requestId?.hospitalId?.fullName || "Processing..."}</p>
                            <p className="text-xs font-mono text-cyan-200/60 uppercase tracking-widest mt-0.5">ID: {credit.requestId?._id?.slice(-8) || "------"}</p>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="inline-flex flex-col items-end">
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-0.5 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">Refundable (75%)</span>
                            <motion.span
                                className="text-3xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-emerald-400 drop-shadow-sm"
                                whileHover={{ scale: 1.05 }}
                            >
                                {((credit.requestId?.units || 1) * 3000 * 0.75).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                            </motion.span>
                        </div>
                    </div>
                </motion.div>

                {/* Main Stats Grid */}
                <motion.div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-white/20 transition-colors group/stat">
                        <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wider">Obligation Debt</p>
                        <p className="text-2xl font-black text-white flex items-baseline gap-1 group-hover/stat:scale-105 transition-transform origin-left">
                            {credit.requestId?.units || 1}.0 <span className="text-sm font-bold text-slate-500">Unit{(credit.requestId?.units || 1) > 1 ? 's' : ''}</span>
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-white/20 transition-colors group/stat">
                        <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wider">Return Deadline</p>
                        <p className="text-2xl font-black text-white mb-2">
                            {new Date(credit.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-sm text-amber-400 font-bold font-mono flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded w-fit">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m left
                        </p>
                    </div>
                </motion.div>

                {/* Progress Bar with Glimmer */}
                <motion.div className="relative mb-6">
                    <div className="flex justify-between text-xs mb-2 font-medium text-slate-400">
                        <span>Progress</span>
                        <span>{Math.round(progress)}% Elasped</span>
                    </div>
                    <div className="relative h-3 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner border border-white/5">
                        <motion.div
                            className={`absolute top-0 left-0 h-full ${barColor} shadow-[0_0_15px_rgba(52,211,153,0.5)]`}
                            initial={{ width: 0 }}
                            animate={{ width: `${100 - progress}%` }}
                            transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
                        >
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Footer Actions */}
                <motion.div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="flex space-x-1.5">
                            {[...Array(3)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.8 + (i * 0.1) }}
                                    className={`w-2.5 h-2.5 rounded-full ${i < (3 - credit.extensionsUsed) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-800 border border-slate-700'}`}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider ml-1">Extensions</span>
                    </div>

                    <div className="flex gap-2 w-full">
                        {credit.returnRequestStatus === 'pending' ? (
                            <div className="flex-1 py-4 rounded-xl bg-slate-800/50 border border-emerald-500/30 text-center">
                                <p className="text-emerald-400 font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Return Initiated
                                </p>
                                <p className="text-slate-500 text-xs mt-1">Visit hospital to verify.</p>
                            </div>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowReturnModal(true)}
                                className="group/btn relative flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/25 border border-white/10"
                            >
                                <span className="relative flex items-center justify-center gap-2 text-base font-bold text-white tracking-wide">
                                    <svg className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    </svg>
                                    Return Blood
                                </span>
                            </motion.button>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleExtension}
                            disabled={credit.extensionsUsed >= 3}
                            className="group/btn relative px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-slate-600 hover:border-slate-500 shadow-lg"
                        >
                            <span className="relative flex items-center gap-2 text-sm font-bold text-slate-300 group-hover/btn:text-white transition-colors">
                                Extension
                                <svg className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            {/* Return Confirmation Modal */}
            {showReturnModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
                        <h3 className="text-xl font-bold text-white mb-2">Return Blood?</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            You are about to initiate a return for <span className="text-emerald-400 font-mono font-bold">{credit.requestId?.bloodGroup}</span> to <span className="text-white font-semibold">{credit.requestId?.hospitalId?.fullName}</span>.
                            <br /><br />
                            This will create a request. The hospital must verify the physical return to clear your obligation.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowReturnModal(false)}
                                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReturn}
                                disabled={isReturning}
                                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2"
                            >
                                {isReturning ? 'Processing...' : 'Confirm Return'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default ActiveCreditCard;
