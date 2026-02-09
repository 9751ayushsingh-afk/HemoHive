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
    exchangeStatus: 'LISTED' | 'TRANSFERRED';
    status: string;
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
                <h2 className="text-xl font-bold text-neutral-900">Your Listings</h2>
                <p className="text-sm text-neutral-500">Manage units you offered to the exchange.</p>
            </div>

            {units.length === 0 ? (
                <div className="p-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500 mb-2">You haven't listed any units yet.</p>
                    <p className="text-sm text-gray-400">Go to <strong>Inventory</strong> to list eligible units.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {units.map((unit) => (
                        <motion.div
                            key={unit._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-red-50 text-red-600 font-bold p-3 rounded-lg text-xl w-14 h-14 flex items-center justify-center">
                                    {unit.bloodGroup}
                                </div>
                                <div>
                                    <p className="font-mono text-sm text-gray-800 font-semibold">{unit.bagId}</p>
                                    <p className="text-xs text-gray-500">{unit.quantity}ml • Exp: {new Date(unit.expiryDate).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Status</p>
                                    {unit.exchangeStatus === 'TRANSFERRED' ? (
                                        <span className="inline-flex items-center text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                            Successfully Sold
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                                            <span className="w-2 h-2 bg-amber-500 rounded-full mr-1 animate-pulse" />
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
