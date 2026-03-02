'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface ExchangeUnit {
    _id: string; // Mongo ID (reference)
    bagId: string; // Barcode
    bloodGroup: string;
    quantity: number;
    expiryDate: string;
    transferCount: number;
    currentOwnerId: {
        _id: string; // Add this
        fullName: string;
        address: string;
        hospitalId?: {
            name: string;
            location: string;
        };
    };
}

const ExchangePool = () => {
    const [units, setUnits] = useState<ExchangeUnit[]>([]);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState<string | null>(null);
    const [requestingUserId, setRequestingUserId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

    // Auto-dismiss messages
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        fetchPool();
    }, []);

    const fetchPool = async () => {
        try {
            const res = await fetch('/api/hemoflux/exchange');
            const data = await res.json();
            if (data.pool) setUnits(data.pool);
            if (data.requestingUserId) setRequestingUserId(data.requestingUserId);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const calculateExpiryDays = (dateStr: string) => {
        const diff = new Date(dateStr).getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const handleClaim = async (bagId: string) => {
        // Replaced native confirm with a smoother flow or implicit acknowledgement.
        // For God-Level UI, we'll proceed directly as the button already implies action.
        setMessage({ text: 'Processing transfer...', type: 'info' });
        setClaiming(bagId);
        try {
            const res = await fetch('/api/hemoflux/exchange', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'CLAIM', bagId })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ text: 'Transfer Successful! Unit is now in transit.', type: 'success' });
                fetchPool(); // Refresh list
            } else {
                setMessage({ text: `Error: ${data.message || 'Transfer failed'}`, type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Network Error! Please try again.', type: 'error' });
        } finally {
            setClaiming(null);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
    );

    return (
        <div className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 relative z-20">
                <div>
                    <h2 className="text-2xl font-black text-white px-2 font-headline">
                        <span className="text-red-500">🛒</span> Market Pool
                    </h2>
                    <p className="text-sm text-white/50 px-2 mt-1">Available units from the network.</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl backdrop-blur-md">
                    <span className="text-red-400 font-bold font-mono">Live Database </span>
                    <span className="text-white/80 pl-2 border-l border-red-500/30 ml-2">{units.length} Units Avbl</span>
                </div>
            </div>

            {/* Premium Message Toast Layer */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-none"
                    >
                        <div className={`p-4 rounded-2xl backdrop-blur-xl border flex items-start gap-4 shadow-2xl ${message.type === 'success' ? 'bg-green-950/80 border-green-500/50 text-green-200' : message.type === 'error' ? 'bg-red-950/80 border-red-500/50 text-red-200' : 'bg-black/80 border-white/20 text-white'}`}>
                            <div className={`mt-1 flex-shrink-0 ${message.type === 'success' ? 'text-green-400' : message.type === 'error' ? 'text-red-400' : 'text-blue-400'}`}>
                                {message.type === 'success' ? '✅' : message.type === 'error' ? '⚠️' : 'ℹ️'}
                            </div>
                            <div className="flex-1">
                                <h4 className={`font-black uppercase tracking-wider text-xs mb-1 ${message.type === 'success' ? 'text-green-400' : message.type === 'error' ? 'text-red-400' : 'text-blue-400'}`}>
                                    {message.type === 'success' ? 'Transfer Complete' : message.type === 'error' ? 'Action Failed' : 'Processing'}
                                </h4>
                                <p className="text-sm font-medium">{message.text}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {units.length === 0 ? (
                <div className="p-16 text-center bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none" />
                    <h3 className="text-xl font-bold text-white mb-2 font-headline">No Units Available</h3>
                    <p className="text-white/50">There are currently no units listed for exchange.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {units.map((unit) => {
                            const daysLeft = calculateExpiryDays(unit.expiryDate);
                            const isUrgent = daysLeft <= 2;

                            return (
                                <motion.div
                                    key={unit._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden relative group hover:bg-black/80 transition-all duration-500"
                                >
                                    {/* Animated Background Glow indicating urgency */}
                                    <div className={`absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition duration-1000 group-hover:duration-200 pointer-events-none ${isUrgent ? 'bg-gradient-to-r from-red-600 to-red-900' : 'bg-gradient-to-r from-green-600 to-emerald-900'}`} />

                                    <div className="p-6 relative z-10 font-sans">
                                        <div className="flex justify-between items-start mb-5">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-red-500 blur-lg flex opacity-30 group-hover:opacity-50 transition-opacity" />
                                                <span className="relative text-2xl font-black text-white bg-gradient-to-br from-red-500 to-red-800 px-3 py-1.5 rounded-xl shadow-lg border border-red-500/30">
                                                    {unit.bloodGroup}
                                                </span>
                                            </div>
                                            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-inner ${isUrgent ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                                                {daysLeft} Days Left
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-sm text-white/70 mb-6">
                                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                                <span className="text-white/40 font-bold uppercase tracking-wider text-[10px]">Volume</span>
                                                <span className="font-mono text-white font-bold">{unit.quantity}ml</span>
                                            </div>
                                            <div className="flex flex-col pt-2">
                                                <span className="text-white/40 font-bold uppercase tracking-wider text-[10px] mb-1">Origin Facility</span>
                                                <span className="font-headline text-white truncate text-base">{(unit.currentOwnerId?.hospitalId?.name || unit.currentOwnerId?.fullName || 'Unknown')}</span>
                                                <span className="text-xs text-white/40 truncate mt-0.5">{unit.currentOwnerId?.address}</span>
                                            </div>
                                        </div>

                                        {(unit.currentOwnerId?._id === requestingUserId) ? (
                                            <div className="w-full py-3 rounded-xl font-bold tracking-widest text-[10px] uppercase bg-white/5 text-white/40 text-center border border-white/10">
                                                Listed by You
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleClaim(unit.bagId)}
                                                disabled={claiming === unit.bagId}
                                                className="relative w-full overflow-hidden rounded-xl py-3 font-black text-sm uppercase tracking-widest transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] border border-white/20 hover:border-red-500 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none group/btn bg-white text-black"
                                            >
                                                {/* Invisible placeholder to firmly establish button height */}
                                                <span className="invisible block">Claim Unit (One-Hop)</span>

                                                {/* Default Text Container (Slides UP and fades out on hover) */}
                                                <span className="absolute inset-0 flex items-center justify-center gap-2 transform transition-all duration-500 ease-in-out group-hover/btn:-translate-y-[150%] group-hover/btn:opacity-0 group-hover/btn:scale-95 text-black">
                                                    {claiming === unit.bagId ? (
                                                        <span className="w-4 h-4 border-2 border-black border-t-transparent animate-spin rounded-full" />
                                                    ) : (
                                                        <>Claim Unit (One-Hop)</>
                                                    )}
                                                </span>

                                                {/* Premium Animated Fill Background (Slides UP from bottom) */}
                                                <div className="absolute inset-0 bg-gradient-to-tr from-red-600 via-red-500 to-red-900 translate-y-[101%] group-hover/btn:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-0 rounded-xl" />

                                                {/* Diagonal light sweep transition (Runs once across the button on hover) */}
                                                <div className="absolute top-0 -left-[100%] w-[60%] h-[200%] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-30deg] group-hover/btn:left-[200%] transition-all duration-[1.2s] ease-in-out z-0 delay-100" />

                                                {/* Hover Text Container (Slides UP from bottom into center) */}
                                                <span className="absolute inset-0 flex items-center justify-center text-white font-black tracking-widest opacity-0 transform translate-y-[150%] scale-95 group-hover/btn:translate-y-0 group-hover/btn:scale-100 group-hover/btn:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-10 pointer-events-none drop-shadow-md">
                                                    <span className="mr-2 text-white/50 group-hover/btn:animate-pulse">⚡</span> INITIATE TRANSFER
                                                </span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Footer Stats */}
                                    <div className="bg-black/50 px-5 py-3 border-t border-white/5 flex justify-between items-center text-[10px] text-white/30 uppercase tracking-widest font-black relative z-10">
                                        <span className="font-mono bg-white/5 px-2 py-1 rounded">ID: {unit.bagId.slice(-6)}</span>
                                        <span className="flex items-center gap-1">Fee: <span className="text-white/70">₹450</span></span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

        </div>
    );
};

export default ExchangePool;
