'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    ArrowUpCircle,
    ArrowDownCircle,
    Trash2,
    RefreshCcw,
    AlertCircle,
    Hash
} from 'lucide-react';

interface TransactionFeedProps {
    transactions: any[];
}

const actionConfig: Record<string, { icon: any, color: string, label: string }> = {
    add: { icon: ArrowUpCircle, color: 'text-green-500', label: 'Unit Added' },
    issue: { icon: ArrowDownCircle, color: 'text-red-500', label: 'Unit Issued' },
    delete: { icon: Trash2, color: 'text-gray-500', label: 'Unit Deleted' },
    expire: { icon: AlertCircle, color: 'text-orange-500', label: 'Unit Expired' },
    return: { icon: RefreshCcw, color: 'text-blue-500', label: 'Unit Returned' },
    update: { icon: Hash, color: 'text-purple-500', label: 'Info Updated' },
};

const TransactionFeed: React.FC<TransactionFeedProps> = ({ transactions }) => {
    return (
        <div className="space-y-4">
            {transactions.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    No recent transactions found.
                </div>
            ) : (
                transactions.map((tx, index) => {
                    const config = actionConfig[tx.action] || actionConfig.update;
                    const Icon = config.icon;

                    return (
                        <motion.div
                            key={tx._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/50 border border-gray-800/50 hover:border-red-500/30 transition-all group"
                        >
                            <div className={`p-2 rounded-lg bg-gray-800 ${config.color}`}>
                                <Icon size={20} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className="text-sm font-semibold text-white truncate">
                                        {config.label}
                                    </h4>
                                    <span className="text-[10px] text-gray-500 font-mono">
                                        {new Date(tx.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 truncate">
                                    Bag ID: <span className="text-gray-300 font-mono">{tx.bagId}</span>
                                </p>
                            </div>

                            <div className="text-right">
                                <div className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full inline-block">
                                    {tx.payload?.bloodGroup || 'N/A'}
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">
                                    {new Date(tx.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </motion.div>
                    );
                })
            )}
        </div>
    );
};

export default TransactionFeed;
