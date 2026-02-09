'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { CreditObligation } from '../../types/CreditTypes';

interface CreditStatusCardProps {
    obligation: CreditObligation;
    onAction?: (id: string) => void;
}

const CreditStatusCard: React.FC<CreditStatusCardProps> = ({ obligation, onAction }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'GRACE': return 'border-emerald-500 bg-emerald-50/10 text-emerald-500';
            case 'PENALTY_L1': return 'border-amber-500 bg-amber-50/10 text-amber-500';
            case 'PENALTY_L2': return 'border-red-500 bg-red-50/10 text-red-500';
            case 'FINAL':
            case 'BLOCKED': return 'border-gray-500 bg-gray-900 text-gray-400 grayscale';
            default: return 'border-blue-500 bg-blue-50/10 text-blue-500';
        }
    };

    const getStatusTitle = (status: string) => {
        switch (status) {
            case 'GRACE': return 'Grace Period - Week 1';
            case 'PENALTY_L1': return 'Penalty Level 1 - Week 2';
            case 'PENALTY_L2': return 'Penalty Level 2 - Week 3';
            case 'FINAL': return 'Final Warning';
            case 'BLOCKED': return 'Account Blocked';
            default: return 'Active Obligation';
        }
    };

    const isBlocked = obligation.status === 'BLOCKED' || obligation.status === 'FINAL';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border-l-4 shadow-lg backdrop-blur-sm relative overflow-hidden transition-all ${getStatusColor(obligation.status)} mb-4`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg tracking-wide">{getStatusTitle(obligation.status)}</h3>
                    <p className="text-sm opacity-80 mt-1">Issued by: {obligation.hospitalName}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold">Deadline in</p>
                    <p className="text-xl font-bold">{30 - obligation.daysElapsed > 0 ? 30 - obligation.daysElapsed : 0} Days</p>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 bg-black/20 p-3 rounded-lg">
                <div>
                    <p className="text-xs uppercase opacity-70">Obligation</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold">{obligation.currentObligationUnits}</span>
                        <span className="text-sm text-xs">Units</span>
                        {obligation.currentObligationUnits > obligation.originalUnits && (
                            <span className="text-xs text-red-400 ml-1">
                                (+{Math.round(((obligation.currentObligationUnits - obligation.originalUnits) / obligation.originalUnits) * 100)}% Penalty)
                            </span>
                        )}
                    </div>
                </div>
                <div>
                    <p className="text-xs uppercase opacity-70">Deposit Refund</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold">{obligation.refundEligiblePercentage}%</span>
                        <span className="text-sm text-xs">Eligible</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
                <div className="text-xs opacity-60">
                    Issue Date: {new Date(obligation.issueDate).toLocaleDateString()}
                </div>
                <button
                    onClick={() => onAction && onAction(obligation.id)}
                    disabled={isBlocked}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isBlocked
                            ? 'bg-gray-700 cursor-not-allowed opacity-50'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                >
                    {isBlocked ? 'Contact Support' : 'Fulfill Obligation'}
                </button>
            </div>

            {isBlocked && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="bg-red-900/90 p-3 rounded text-white text-center shadow-xl border border-red-500">
                        <p className="font-bold">SYSTEM LOCKED</p>
                        <p className="text-xs mt-1">Obligation Timed Out (>21 Days)</p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default CreditStatusCard;
