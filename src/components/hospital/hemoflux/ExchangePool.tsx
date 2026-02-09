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
        if (!confirm('Confirm One-Time Transfer? This unit will be locked after this transaction.')) return;

        setClaiming(bagId);
        try {
            const res = await fetch('/api/hemoflux/exchange', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'CLAIM', bagId })
            });

            const data = await res.json();

            if (res.ok) {
                alert('Transfer Successful!');
                fetchPool(); // Refresh list
            } else {
                alert('Error: ' + data.message);
            }
        } catch (err) {
            alert('Network Error');
        } finally {
            setClaiming(null);
        }
    };

    if (loading) return <div className="p-10 text-center text-neutral-500">Loading Exchange Pool...</div>;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-neutral-900">HemoFlux Exchange Pool</h2>
                <div className="text-right">
                    <span className="text-sm text-neutral-500 block">Live • {units.length} Units Avbl</span>
                </div>
            </div>

            {units.length === 0 ? (
                <div className="p-10 text-center bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
                    <p className="text-neutral-500">No units currently listed for exchange.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {units.map((unit) => {
                            const daysLeft = calculateExpiryDays(unit.expiryDate);
                            const isUrgent = daysLeft <= 2;

                            return (
                                <motion.div
                                    key={unit._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-2xl font-black text-red-600 bg-red-50 px-2 py-1 rounded">
                                                {unit.bloodGroup}
                                            </span>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${isUrgent ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {daysLeft} Days Left
                                            </span>
                                        </div>

                                        <div className="space-y-1 text-sm text-neutral-600 mb-4">
                                            <p><strong>Vol:</strong> {unit.quantity}ml</p>
                                            <p><strong>From:</strong> {(unit.currentOwnerId?.hospitalId?.name || unit.currentOwnerId?.fullName || 'Unknown').substring(0, 25)}...</p>
                                            <p className="text-xs text-neutral-400 truncate">{unit.currentOwnerId?.address}</p>
                                        </div>

                                        {(unit.currentOwnerId?._id === requestingUserId) ? (
                                            <div className="w-full py-2 rounded-lg font-bold text-sm bg-gray-100 text-gray-500 text-center border border-gray-200">
                                                Listed by You
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleClaim(unit.bagId)}
                                                disabled={claiming === unit.bagId}
                                                className="w-full py-2 rounded-lg font-semibold text-sm transition-colors text-white bg-black hover:bg-neutral-800 disabled:bg-neutral-300"
                                            >
                                                {claiming === unit.bagId ? 'Processing...' : 'Claim Unit (One-Hop)'}
                                            </button>
                                        )}
                                    </div>

                                    {/* Footer Stats */}
                                    <div className="bg-neutral-50 px-4 py-2 border-t border-neutral-100 flex justify-between text-[10px] text-neutral-500 uppercase tracking-wider font-medium">
                                        <span>ID: {unit.bagId.slice(-6)}</span>
                                        <span>Fee: ₹450(abhi aise hi hai )</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* DEBUGGING: REMOVE BEFORE PRODUCTION */}
            <div className="mt-8 p-4 bg-gray-900 text-green-400 font-mono text-xs overflow-auto h-48 rounded-xl border border-gray-700">
                <p className="font-bold text-white mb-2">DEBUG DATA DUMP ({units.length} items):</p>
                <pre>{JSON.stringify(units, null, 2)}</pre>
                <p className="mt-4 font-bold text-white">MY USER ID:</p>
                <pre>{JSON.stringify(requestingUserId, null, 2)}</pre>
            </div>
        </div>
    );
};

export default ExchangePool;
