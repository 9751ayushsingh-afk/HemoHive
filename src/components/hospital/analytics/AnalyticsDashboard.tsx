'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    Activity,
    Droplets,
    History,
    PieChart as PieIcon,
    TrendingUp,
    AlertTriangle,
    Package
} from 'lucide-react';
import StockChart from './StockChart';
import TransactionFeed from './TransactionFeed';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AnalyticsDashboard = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30d');

    const timeframes = [
        { label: 'Today', value: 'today' },
        { label: '15 Days', value: '15d' },
        { label: '30 Days', value: '30d' },
        { label: '6 Months', value: '6m' },
        { label: '1 Year', value: '1y' },
        { label: 'All Time', value: 'all' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/api/hospital/analytics?period=${period}`);
                setData(response.data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [period]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                <p className="text-gray-400 font-medium animate-pulse">Accessing Record Room...</p>
            </div>
        );
    }

    if (!data) return <div className="text-center text-red-500 py-20">Failed to load analytics data.</div>;

    // Process trend data for LineChart
    const trendData = Object.values(data.trends.reduce((acc: any, curr: any) => {
        const day = curr._id.day;
        if (!acc[day]) acc[day] = { day, incoming: 0, outgoing: 0 };
        if (curr._id.action === 'add' || curr._id.action === 'return') acc[day].incoming += curr.count;
        if (curr._id.action === 'issue' || curr._id.action === 'expire' || curr._id.action === 'delete') acc[day].outgoing += curr.count;
        return acc;
    }, {}));

    return (
        <div className="p-1 space-y-8 pb-10">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Inventory', value: data.totalBags, icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Units Available', value: data.stock.reduce((a: any, b: any) => a + b.quantity, 0), icon: Droplets, color: 'text-red-500', bg: 'bg-red-500/10' },
                    { label: 'Expiring Soon', value: data.expiringSoon, icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                    { label: 'Recent Activity', value: data.recentMovements.length, icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-gray-900/40 backdrop-blur-xl border border-gray-800 p-6 rounded-3xl hover:border-red-500/40 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-white mt-1 font-outfit">{stat.value}</h3>
                            </div>
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Inventory Trends */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-gray-900/40 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2 font-outfit">
                                    <TrendingUp className="text-red-500" />
                                    Inventory Dynamics
                                </h2>
                                <p className="text-gray-400 text-sm">Stock movement (Incoming vs Outgoing)</p>
                            </div>

                            <div className="flex flex-wrap gap-2 p-1.5 bg-gray-950/80 rounded-2xl border border-gray-800">
                                {timeframes.map((tf) => (
                                    <button
                                        key={tf.value}
                                        onClick={() => setPeriod(tf.value)}
                                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${period === tf.value
                                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                                : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                    >
                                        {tf.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="incoming" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} activeDot={{ r: 8 }} />
                                    <Line type="monotone" dataKey="outgoing" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444' }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Group Distribution */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <motion.div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-outfit">
                                <PieIcon className="text-red-500" size={20} />
                                Blood Group Distribution
                            </h3>
                            <StockChart data={data.distribution} type="pie" />
                        </motion.div>

                        <motion.div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-outfit">
                                <Droplets className="text-red-500" size={20} />
                                Quantity Analysis (Units)
                            </h3>
                            <StockChart data={data.stock} type="bar" />
                        </motion.div>
                    </div>
                </div>

                {/* Transaction Record Room (Feed) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gray-950/40 backdrop-blur-3xl border border-gray-800 rounded-3xl overflow-hidden flex flex-col h-full"
                >
                    <div className="p-8 border-b border-gray-800">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2 font-outfit">
                            <History className="text-red-500" />
                            Visual Record Room
                        </h2>
                        <p className="text-gray-400 text-sm">Real-time inventory ledger</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 max-h-[850px] scrollbar-hide">
                        <TransactionFeed transactions={data.recentMovements} />
                    </div>

                    <div className="p-6 bg-gray-900/60 border-t border-gray-800">
                        <div className="flex items-center justify-between text-xs text-gray-500 uppercase tracking-widest font-bold">
                            <span>Syncing Live</span>
                            <div className="flex gap-1">
                                <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                                <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse delay-75" />
                                <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse delay-150" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
