'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import ActiveCreditCard from './ActiveCreditCard';
import OverdueCreditCard from './OverdueCreditCard';

const fetchUserCredits = async (userId: string) => {
    const { data } = await axios.get(`/api/credits/user/${userId}`);
    return data;
};

const CreditWallet = () => {
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const [showHistory, setShowHistory] = React.useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ['userCredits', userId],
        queryFn: () => fetchUserCredits(userId!),
        enabled: !!userId && userId !== 'undefined', // Only run the query if the userId is available and valid
        refetchInterval: 30000, // Refetch every 30 seconds to keep status up-to-date
    });

    if (isLoading) {
        return (
            <div className="bg-white/10 p-8 rounded-xl backdrop-blur-sm border border-white/20 min-h-[200px] flex items-center justify-center">
                <p className="text-white/70">Loading Credit Wallet...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white/10 p-8 rounded-xl backdrop-blur-sm border border-white/20">
                <h2 className="text-3xl text-white font-bold mb-6">Credit Wallet</h2>
                <p className="text-red-500">Could not load credit information.</p>
            </div>
        );
    }

    return (
        <div className="relative group p-8 rounded-3xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-2xl bg-gradient-to-br from-slate-900/80 via-indigo-950/80 to-slate-900/80">
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/30 transition-colors duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 group-hover:bg-purple-500/20 transition-colors duration-1000"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl text-white font-bold">Credit Wallet</h2>
                    <button
                        onClick={() => setShowHistory(true)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white/90 text-sm font-bold flex items-center gap-2 transition-all backdrop-blur-md"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        History
                    </button>
                </div>

                {data?.isBlocked && (
                    <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg mb-6">
                        <h3 className="text-2xl font-bold text-red-400">Account Blocked</h3>
                        <p className="text-red-400/80">Your account has been blocked due to multiple failed returns. Please contact support.</p>
                    </div>
                )}

                <div className="space-y-6">
                    {data?.activeCredits?.length > 0 && (
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-4">Active Credits</h3>
                            {data.activeCredits.map((credit: any) => (
                                <ActiveCreditCard key={credit._id} credit={credit} />
                            ))}
                        </div>
                    )}

                    {data?.overdueCredits?.length > 0 && (
                        <div>
                            <h3 className="text-xl font-semibold text-red-500 mb-4">Overdue Credits</h3>
                            {data.overdueCredits.map((credit: any) => (
                                <OverdueCreditCard key={credit._id} credit={credit} />
                            ))}
                        </div>
                    )}

                    {!data?.isBlocked && data?.activeCredits?.length === 0 && data?.overdueCredits?.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-white/70">You have no active or overdue credits. Great job!</p>
                        </div>
                    )}
                </div>
            </div>
            {/* History Modal */}
            {showHistory && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowHistory(false)}></div>
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl relative overflow-hidden z-10">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/10 bg-slate-800/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-white">Transaction History</h3>
                                <p className="text-sm text-slate-400">Past credits and returns</p>
                            </div>
                            <button
                                onClick={() => setShowHistory(false)}
                                className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {!data?.clearedCredits || data.clearedCredits.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-slate-500">No previous transactions found.</p>
                                </div>
                            ) : (
                                data.clearedCredits.map((credit: any) => {
                                    // Refund Calculation Logic
                                    const units = credit.requestId?.units || 1;
                                    const depositPerUnit = 3000;
                                    const feesPerUnit = 1700;
                                    const totalPaid = units * (depositPerUnit + feesPerUnit);
                                    const totalDeposit = units * depositPerUnit;

                                    const dueDate = new Date(credit.dueDate).getTime();
                                    const returnedDate = new Date(credit.updatedAt).getTime();
                                    const overdueMillis = returnedDate - dueDate;
                                    const overdueDays = Math.ceil(overdueMillis / (1000 * 60 * 60 * 24));

                                    let refundPercentage = 0.75;
                                    let statusLabel = 'On Time';
                                    let statusColor = 'text-emerald-400';

                                    if (overdueDays > 0) {
                                        if (overdueDays <= 7) {
                                            refundPercentage = 0.50;
                                            statusLabel = 'Late (1st Wk)';
                                            statusColor = 'text-amber-400';
                                        } else if (overdueDays <= 14) {
                                            refundPercentage = 0.25;
                                            statusLabel = 'Late (2nd Wk)';
                                            statusColor = 'text-orange-500';
                                        } else {
                                            refundPercentage = 0.00;
                                            statusLabel = 'Severely Late';
                                            statusColor = 'text-red-500';
                                        }
                                    }

                                    const refundAmount = totalDeposit * refundPercentage;

                                    return (
                                        <div key={credit._id} className="bg-slate-800/50 rounded-xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/20">
                                                        {credit.requestId?.bloodGroup}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-white">{credit.requestId?.hospitalId?.fullName}</h4>
                                                        <div className="flex gap-2 text-xs">
                                                            <span className="text-slate-400">ID: {credit._id.slice(-6).toUpperCase()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-xs font-bold uppercase tracking-wider ${statusColor}`}>
                                                    {statusLabel}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 text-sm">
                                                <div className="bg-slate-900/50 p-3 rounded-lg">
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Timeline</p>
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="font-mono text-[10px] text-slate-400">OUT: {new Date(credit.issuedDate).toLocaleDateString()}</p>
                                                        <p className="font-mono text-[10px] text-emerald-400">IN:&nbsp;&nbsp;{new Date(credit.updatedAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-slate-900/50 p-3 rounded-lg">
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Taken</p>
                                                    <p className="font-mono text-white text-lg">{units}</p>
                                                    <p className="text-[10px] text-slate-500">Unit{units > 1 ? 's' : ''}</p>
                                                </div>
                                                <div className="bg-slate-900/50 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                                                    <p className="text-[10px] text-emerald-400 uppercase tracking-wider mb-1">Returned</p>
                                                    <p className="font-mono text-white text-lg">{units}</p>
                                                    <p className="text-[10px] text-emerald-500/70">Unit{units > 1 ? 's' : ''}</p>
                                                </div>
                                                <div className="bg-slate-900/50 p-3 rounded-lg">
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Total Paid</p>
                                                    <p className="font-mono text-white">₹{totalPaid.toLocaleString()}</p>
                                                    <p className="text-[10px] text-slate-500 font-mono">w/ Fees</p>
                                                </div>
                                                <div className="bg-slate-900/50 p-3 rounded-lg">
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Deposit</p>
                                                    <p className="font-mono text-white">₹{totalDeposit.toLocaleString()}</p>
                                                    <p className="text-[10px] text-slate-500 font-mono">Refundable</p>
                                                </div>
                                                <div className="bg-slate-900/50 p-3 rounded-lg relative overflow-hidden">
                                                    <div className={`absolute inset-0 opacity-10 ${refundPercentage > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                                    <p className={`text-[10px] uppercase tracking-wider mb-1 relative z-10 ${refundPercentage > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        Refund ({refundPercentage * 100}%)
                                                    </p>
                                                    <p className={`font-mono font-bold relative z-10 ${refundPercentage > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        ₹{refundAmount.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default CreditWallet;