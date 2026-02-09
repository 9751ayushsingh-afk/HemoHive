'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

const OverdueCreditCard = ({ credit }: { credit: any }) => {
    // Removed legacy GSAP refs
    const queryClient = useQueryClient();
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [isReturning, setIsReturning] = useState(false);

    // Status Logic helper (same as before)
    const daysOverdue = Math.floor((new Date().getTime() - new Date(credit.dueDate).getTime()) / (1000 * 60 * 60 * 24));

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
            // Optional: Keep error alert or use a toast
            // alert(error.response?.data?.error || "Failed to initiate return");
        } finally {
            setIsReturning(false);
        }
    };

    // Credit Lifecycle Logic
    let status = 'PENALTY_L1';
    let gradientClasses = 'bg-gradient-to-br from-amber-600 to-orange-700'; // More vibrant base
    let accentColor = 'text-white';
    let subTextColor = 'text-amber-100';
    let borderColor = 'border-amber-400/50';
    let glowColor = 'bg-amber-400';
    let badgeBorder = 'border-white/30';
    let badgeBg = 'bg-black/20';

    let penaltyText = '+25% Obligation';
    let refundText = 'PRD Refund: 50%';

    const baseUnits = credit.requestId?.units || 1;
    const depositPerUnit = 3000;
    const totalDeposit = baseUnits * depositPerUnit;

    let obligationUnits = `${(baseUnits * 1.25).toFixed(2)} Units`;
    let currentRefund = (totalDeposit * 0.50).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

    // Status Logic
    if (daysOverdue > 21) {
        status = 'BLOCKED';
        gradientClasses = 'bg-gradient-to-br from-red-950 via-black to-red-900 border-red-500'; // Dramatic dark/red
        accentColor = 'text-red-500';
        subTextColor = 'text-red-300';
        borderColor = 'border-red-600';
        glowColor = 'bg-red-600';
        badgeBorder = 'border-red-500/50';
        badgeBg = 'bg-red-950/50';

        penaltyText = 'Account Blocked';
        refundText = 'Refund: 0%';
        obligationUnits = 'Locked';
        currentRefund = '₹0';
    } else if (daysOverdue > 14) {
        status = 'PENALTY_L2';
        gradientClasses = 'bg-gradient-to-br from-rose-700 via-red-600 to-rose-800'; // Rich vibrant red
        accentColor = 'text-white';
        subTextColor = 'text-rose-100';
        borderColor = 'border-rose-300/50';
        glowColor = 'bg-rose-400';
        badgeBorder = 'border-white/30';
        badgeBg = 'bg-black/20';

        penaltyText = '+50% Obligation';
        obligationUnits = `${(baseUnits * 1.50).toFixed(2)} Units`;
        currentRefund = (totalDeposit * 0.25).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
        refundText = `PRD Refund: 25% (${currentRefund})`;
    } else {
        // PENALTY_L1 (Default) applied above
        refundText = `PRD Refund: 50% (${currentRefund})`;
    }

    return (
        <motion.div
            className={`group relative p-6 rounded-2xl mb-6 overflow-hidden shadow-2xl backdrop-blur-xl border ${borderColor} ${gradientClasses}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.01, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)" }}
        >
            {status === 'BLOCKED' && (
                <div className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, rotate: [0, -1, 1, 0] }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="bg-red-950/90 text-red-200 font-bold px-6 py-4 rounded-xl border border-red-500/50 shadow-[0_0_50px_rgba(220,38,38,0.4)] text-center relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-red-500/20 animate-pulse"></div>
                        <div className="relative z-10">
                            <p className="text-2xl mb-1 tracking-widest text-red-100">SYSTEM LOCKED</p>
                            <p className="text-xs font-normal opacity-80 uppercase tracking-widest">Action Required</p>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Ambient Animated Glows */}
            <motion.div
                className={`absolute top-0 right-0 w-96 h-96 ${glowColor} rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-40 mix-blend-overlay`}
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className={`absolute bottom-0 left-0 w-64 h-64 ${glowColor} rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 opacity-30 mix-blend-overlay`}
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />

            <div className="relative z-10">
                {/* Header */}
                <motion.div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        {/* Icon Box */}
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg ${badgeBg} ${badgeBorder} relative overflow-hidden group/icon`}>
                            <div className={`absolute inset-0 ${badgeBg} blur-md opacity-0 group-hover/icon:opacity-50 transition-opacity`}></div>
                            <span className={`text-2xl font-black ${accentColor} relative z-10 drop-shadow-md`}>{credit.requestId?.bloodGroup || "N/A"}</span>
                        </div>

                        <div>
                            <p className={`font-bold text-xl text-white leading-tight drop-shadow-sm`}>{credit.requestId?.hospitalId?.fullName || "Processing..."}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`flex items-center gap-1 text-[10px] font-bold ${accentColor} border ${badgeBorder} px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeBg}`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                                    Overdue
                                </span>
                                <span className={`text-xs ${subTextColor} font-mono tracking-widest opacity-80`}>ID: {credit.requestId?._id?.slice(-8)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="inline-flex flex-col items-end">
                            <span className={`text-xs font-bold ${subTextColor} uppercase tracking-wider mb-1 px-2 py-0.5 ${badgeBg} rounded-full border ${badgeBorder}`}>Reduced Refund</span>
                            <span className={`text-3xl font-mono font-black text-white drop-shadow-lg`}>
                                {currentRefund}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Main Stats Grid */}
                <motion.div className="grid grid-cols-2 gap-4 mb-6">
                    <div className={`p-4 rounded-2xl ${badgeBg} border ${badgeBorder} backdrop-blur-sm group/stat hover:bg-black/30 transition-colors`}>
                        <p className={`text-xs ${subTextColor} mb-1 font-medium uppercase tracking-wider`}>Total Debt</p>
                        <p className={`text-2xl font-black ${accentColor} flex items-baseline gap-1 group-hover/stat:scale-105 transition-transform origin-left drop-shadow-sm`}>
                            {obligationUnits}
                        </p>
                    </div>
                    <div className={`p-4 rounded-2xl ${badgeBg} border ${badgeBorder} backdrop-blur-sm group/stat hover:bg-black/30 transition-colors`}>
                        <p className={`text-xs ${subTextColor} mb-1 font-medium uppercase tracking-wider`}>Time Overdue</p>
                        <p className="text-2xl font-bold text-white group-hover/stat:scale-105 transition-transform origin-left drop-shadow-sm">
                            {daysOverdue} <span className={`text-sm font-bold ${subTextColor}`}>Day{daysOverdue > 1 ? 's' : ''}</span>
                        </p>
                    </div>
                </motion.div>

                {/* Footer Warning */}
                <motion.div>
                    <div className={`py-3 px-4 rounded-xl text-center text-sm font-bold ${badgeBg} border ${badgeBorder} ${accentColor} flex items-center justify-center gap-2 shadow-lg backdrop-blur-md mb-6`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="drop-shadow-sm">{status === 'BLOCKED' ? "Account Access Revoked" : "Return immediately to avoid further penalties."}</span>
                    </div>
                </motion.div>

                {/* Bottom Action Footer */}
                <motion.div className="mt-auto relative z-20">
                    {credit.returnRequestStatus === 'pending' ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full py-4 rounded-xl text-center bg-slate-900/50 border border-emerald-500/30 backdrop-blur-md"
                        >
                            <p className="text-emerald-400 font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Return Initiated
                            </p>
                            <p className="text-slate-400 text-xs mt-1">Visit hospital to complete verification.</p>
                        </motion.div>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowReturnModal(true)}
                            className={`w-full py-4 rounded-xl text-lg font-black uppercase tracking-wider shadow-2xl flex items-center justify-center gap-3 transition-all ${credit.requestId.hospitalId
                                // Reverted to Red Gradient Style (High Visibility but consistent)
                                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 bg-[length:200%_100%] animate-shimmer border border-red-400/50 text-white hover:shadow-red-900/40'
                                : 'hidden'
                                }`}
                        >
                            <motion.svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                animate={{ x: [0, 5, 0] }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    repeatType: "loop"
                                }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </motion.svg>
                            <motion.span
                                className="relative z-10 drop-shadow-md"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    repeatType: "mirror"
                                }}
                            >
                                Return Now
                            </motion.span>
                        </motion.button>
                    )}
                </motion.div>
            </div>

            {/* Return Confirmation Modal */}
            {showReturnModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-red-950/90 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-amber-600"></div>
                        <h3 className="text-xl font-bold text-white mb-2">Resolve Overdue Credit?</h3>
                        <p className="text-red-200/80 text-sm mb-6">
                            You are initiating a return for <span className="text-white font-mono font-bold">{credit.requestId?.bloodGroup}</span> to <span className="text-white font-semibold">{credit.requestId?.hospitalId?.fullName}</span>.
                            <br /><br />
                            <span className="font-bold text-amber-500">Note:</span> Penalties may still apply upon verification.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowReturnModal(false)}
                                className="flex-1 py-2.5 rounded-xl bg-black/40 text-slate-400 font-semibold hover:bg-black/60 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReturn}
                                disabled={isReturning}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 transition shadow-lg shadow-red-900/40 flex items-center justify-center gap-2"
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

export default OverdueCreditCard;
