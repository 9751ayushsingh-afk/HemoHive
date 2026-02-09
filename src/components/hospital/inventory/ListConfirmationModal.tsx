'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ListConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    bagId: string;
}

const facts = [
    "Did you know? One pint of blood can save up to three lives.",
    "Listing this unit prevents wastage and routes it to where it's needed most.",
    "HemoFlux 'One-Hop' rule ensures this unit travels directly to its final destination.",
    "Every 2 seconds, someone in India needs blood. You are bridging that gap."
];

const ListConfirmationModal: React.FC<ListConfirmationModalProps> = ({ isOpen, onClose, onConfirm, bagId }) => {
    const randomFact = facts[Math.floor(Math.random() * facts.length)];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                className="relative bg-gradient-to-br from-gray-900 via-slate-900 to-black rounded-2xl border border-gray-700 w-full max-w-md p-0 overflow-hidden shadow-2xl"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
            >
                {/* Header Art */}
                <div className="h-32 bg-gradient-to-r from-red-600 to-amber-600 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <motion.div
                        className="w-16 h-16 bg-white/20 rounded-full backdrop-blur-md flex items-center justify-center text-3xl shadow-lg border border-white/30"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: 360 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                        🚀
                    </motion.div>
                </div>

                <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Confirm Exchange Listing</h3>
                    <p className="text-gray-400 text-sm mb-6">
                        You are about to list Bag <span className="text-amber-400 font-mono">{bagId}</span> on the HemoFlux Exchange.
                    </p>

                    <div className="bg-gray-800/50 rounded-xl p-4 mb-6 text-left border-l-4 border-amber-500">
                        <p className="text-xs text-amber-500 font-bold uppercase tracking-wider mb-1">Impact Fact</p>
                        <p className="text-gray-300 text-sm italic">"{randomFact}"</p>
                    </div>

                    <div className="bg-red-900/20 rounded-lg p-3 mb-6">
                        <p className="text-[10px] text-red-400 uppercase font-bold flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            Irreversible Action
                        </p>
                        <p className="text-xs text-red-300 mt-1">
                            Once claimed by another hospital, this unit cannot be recalled.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-semibold hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 text-white font-bold shadow-lg hover:shadow-red-500/25 transition-all transform hover:-translate-y-1"
                        >
                            Confirm Listing
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ListConfirmationModal;
