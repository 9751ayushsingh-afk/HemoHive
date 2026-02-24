'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Package, TrendingUp, AlertTriangle, Droplets } from 'lucide-react';

interface PremiumInventoryHeaderProps {
    totalUnits: number;
    lowStockCount: number;
    expiringCount: number;
}

const PremiumInventoryHeader: React.FC<PremiumInventoryHeaderProps> = ({
    totalUnits,
    lowStockCount,
    expiringCount
}) => {
    const stats = [
        { label: 'Total Units', value: totalUnits, icon: Droplets, color: 'text-red-500', bg: 'bg-red-500/10' },
        { label: 'Low Stock Groups', value: lowStockCount, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Expiring Soon', value: expiringCount, icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    ];

    return (
        <div className="w-full mb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 mb-4"
                    >
                        <div className="p-2 bg-red-500/20 rounded-xl">
                            <Package className="text-red-500" size={24} />
                        </div>
                        <span className="text-red-500 font-bold tracking-widest text-xs uppercase">Inventory Control</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl font-black text-white font-outfit tracking-tighter uppercase mb-4"
                    >
                        Blood Bank <span className="text-red-600">Reserves</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 font-medium max-w-lg leading-relaxed"
                    >
                        Manage and monitor your hospital's critical blood supply with precision.
                        Real-time tracking of units, quality alerts, and distribution dynamics.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 min-w-fit">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + (i * 0.1) }}
                            className="bg-gray-900/60 backdrop-blur-xl border border-white/5 p-4 rounded-2xl flex items-center gap-4 min-w-[180px]"
                        >
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{stat.label}</p>
                                <p className="text-xl font-bold text-white font-outfit tracking-tight">{stat.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PremiumInventoryHeader;
