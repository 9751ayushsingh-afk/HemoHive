
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, MapPin, Key, Clock, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Delivery {
    _id: string;
    driverId: {
        fullName: string;
        vehicleDetails: { plateNumber: string; model: string };
    };
    requestId: {
        bloodGroup: string;
        quantity: number;
    };
    pickupCode: string;
    status: string;
    createdAt: string;
}

export default function RaktSindhuFeed() {
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDeliveries = async () => {
        try {
            const res = await fetch('/api/hospital/deliveries/active');
            if (res.ok) {
                const data = await res.json();
                setDeliveries(data.deliveries);
            }
        } catch (error) {
            console.error('Failed to fetch Raktsindhu feed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliveries();
        const interval = setInterval(fetchDeliveries, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="text-white text-sm animate-pulse">Loading RaktSindhu...</div>;
    // Removed: if (deliveries.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
                    <Truck size={20} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">RaktSindhu Dispatch</h2>
                    <p className="text-xs text-blue-400 font-medium uppercase tracking-wider">Live Outbound Logistics</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                    {deliveries.length === 0 ? (
                        <div className="col-span-full bg-slate-800/50 rounded-xl p-8 text-center border dashed border-slate-700">
                            <Truck className="mx-auto h-12 w-12 text-slate-600 mb-3 opacity-50" />
                            <h3 className="text-slate-400 font-medium">No Active Deliveries</h3>
                            <p className="text-xs text-slate-500 mt-1">New dispatches will appear here automatically.</p>
                        </div>
                    ) : (
                        deliveries.map((delivery) => (
                            <motion.div
                                key={delivery._id}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-blue-500/30 overflow-hidden relative group hover:border-blue-400/50 transition-colors"
                            >
                                {/* Status Stripe */}
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />

                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">
                                                    {delivery.status.replace('_', ' ')}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {new Date(delivery.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-slate-100">{delivery.driverId?.fullName || "Searching..."}</h3>
                                            <p className="text-xs text-slate-400">{delivery.driverId?.vehicleDetails?.model} • {delivery.driverId?.vehicleDetails?.plateNumber}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-white flex items-center justify-end gap-2">
                                                <span className="text-emerald-500">{delivery.requestId?.bloodGroup}</span>
                                                <Package size={18} className="text-slate-600" />
                                            </div>
                                            <p className="text-xs text-slate-400">{delivery.requestId?.quantity} Units</p>
                                        </div>
                                    </div>

                                    {/* Action Area */}
                                    <div className="bg-slate-950/50 rounded-xl p-3 flex items-center justify-between border border-slate-800/50">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
                                                <Key size={10} /> Pickup Code
                                            </span>
                                            <span className="text-xl font-mono font-bold text-indigo-400 tracking-widest select-all cursor-pointer" onClick={() => { navigator.clipboard.writeText(delivery.pickupCode); toast.success('Code Copied') }}>
                                                {delivery.pickupCode}
                                            </span>
                                        </div>
                                        <button className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors shadow-lg shadow-blue-900/20">
                                            <MapPin size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
