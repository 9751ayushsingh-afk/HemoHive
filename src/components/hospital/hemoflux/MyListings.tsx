'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types (Shared ideally, but redefining for speed)
interface ExchangeUnit {
    _id: string;
    bagId: string;
    bloodGroup: string;
    quantity: number;
    expiryDate: string;
    transferCount: number;
    exchangeStatus: 'LISTED' | 'IN_TRANSIT' | 'TRANSFERRED';
    status: 'AVAILABLE' | 'RESERVED' | 'TRANSFERRED' | 'IN_TRANSIT' | 'EXPIRED' | 'USED' | 'DISCARDED';
}

const MyListings = () => {
    const [units, setUnits] = useState<ExchangeUnit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyListings();
    }, []);

    const fetchMyListings = async () => {
        try {
            const res = await fetch('/api/hemoflux/exchange?type=mine');
            const data = await res.json();
            if (data.pool) setUnits(data.pool);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-neutral-500 animate-pulse">Loading your listings...</div>;

    return (
        <div className="w-full">
            <div className="mb-6">
                <h2 className="text-2xl font-black text-white px-2 font-headline">
                    <span className="text-white">📋</span> Outbound Listings
                </h2>
                <p className="text-sm text-white/50 px-2 mt-1">Manage units you offered to the exchange.</p>
            </div>

            {units.length === 0 ? (
                <div className="p-16 text-center bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                    <p className="text-white/60 mb-2 font-headline text-lg">You haven't listed any units yet.</p>
                    <p className="text-sm text-white/40">Go to <strong>Inventory</strong> to list eligible units.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {units.map((unit) => (
                        <motion.div
                            key={unit._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-black/60 p-5 rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-black/80 transition-colors"
                        >
                            <div className="flex items-center gap-5">
                                <div className="bg-red-950/50 border border-red-500/20 text-red-500 font-black p-3 rounded-xl text-2xl w-16 h-16 flex items-center justify-center shadow-[0_0_15px_rgba(255,0,0,0.2)]">
                                    {unit.bloodGroup}
                                </div>
                                <div>
                                    <p className="font-mono text-sm text-white/80 font-bold mb-1">{unit.bagId}</p>
                                    <p className="text-xs text-white/50">{unit.quantity}ml • Exp: {new Date(unit.expiryDate).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-white/30 mb-1">Status</p>

                                    {unit.status === 'DISCARDED' ? (
                                        <span className="inline-flex items-center text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                                            ⚠️ Rejected (Integrity)
                                        </span>
                                    ) : unit.exchangeStatus === 'TRANSFERRED' ? (
                                        <span className="inline-flex items-center text-xs font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                                            ✔ Delivered & Received
                                        </span>
                                    ) : unit.exchangeStatus === 'IN_TRANSIT' ? (
                                        <span className="inline-flex items-center text-xs font-bold text-purple-400 bg-purple-400/10 border border-purple-400/20 px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(192,132,252,0.2)]">
                                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2 animate-ping" />
                                            🚚 In Transit to Buyer
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center text-xs font-bold text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(248,113,113,0.2)]">
                                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 animate-pulse" />
                                            Active on Market
                                        </span>
                                    )}
                                </div>

                                {unit.exchangeStatus === 'LISTED' && (
                                    <button className="text-sm text-red-500 font-medium hover:text-red-700 hover:underline">
                                        Cancel
                                    </button>
                                )}
                                {unit.exchangeStatus === 'TRANSFERRED' && (
                                    <button className="text-sm text-purple-600 font-medium hover:text-purple-800 hover:underline">
                                        View Receipt
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyListings;
