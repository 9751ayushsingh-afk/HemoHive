'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IBloodBag } from '../../../models/BloodBag';
import ListConfirmationModal from './ListConfirmationModal';
import { useState } from 'react';

interface BagListModalProps {
  bloodGroup: string;
  onClose: () => void;
  bags: IBloodBag[];
}

const BagListModal: React.FC<BagListModalProps> = ({ bloodGroup, onClose, bags }) => {
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; bagId: string | null }>({
    open: false,
    bagId: null
  });

  const handleListClick = (bagId: string) => {
    setConfirmModal({ open: true, bagId });
  };

  const handleConfirmList = async () => {
    if (!confirmModal.bagId) return;
    const bagId = confirmModal.bagId;

    // Close modal immediately for better UX or keep open until API success?
    // Let's keep opens -> API call -> Success -> Close All

    try {
      const res = await fetch('/api/hemoflux/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'LIST', bagId })
      });
      const data = await res.json();
      if (res.ok) {
        // We can show a toast here instead of alert, but for now strict alert is fine as requested?
        // Actually user wanted premium UI so native alert is bad.
        // Let's just close and maybe show a small success indication?
        // Since we don't have a toast library explicitly setup (or used inconsistently), 
        // we'll rely on the modal closing and maybe a quick refresh.

        onClose();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      alert("Network Error");
    }
    setConfirmModal({ open: false, bagId: null });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Deep blur backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
          onClick={onClose}
        />

        <motion.div
          className="relative w-full max-w-6xl max-h-[85vh] flex flex-col bg-[#050510] border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Header */}
          <div className="flex justify-between items-center mb-10 z-10 border-b border-white/5 pb-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 blur-lg flex opacity-40 animate-pulse" />
                <div className="relative bg-gradient-to-br from-red-500 to-red-800 text-white font-black p-4 rounded-xl text-4xl shadow-2xl border border-red-400/30 font-outfit">
                  {bloodGroup}
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white font-outfit uppercase tracking-tighter">Inventory Vault</h2>
                <p className="text-white/40 text-sm font-bold tracking-widest uppercase mt-1">Available Units: {bags.length}</p>
              </div>
            </div>

            {/* Custom Close Button */}
            <button
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-red-500/50 transition-all duration-300 group"
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrolling Grid Area */}
          <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar z-10">
            {bags.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {bags.map((bag, idx) => {
                  const daysToExpiry = Math.ceil((new Date(bag.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  const isListingEligible = daysToExpiry <= 15 && daysToExpiry > 0;
                  const isUrgent = daysToExpiry <= 5 && bag.status === 'AVAILABLE';

                  return (
                    <motion.div
                      key={bag.bagId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`relative overflow-hidden group rounded-2xl p-6 border transition-all duration-300 ${isUrgent ? 'bg-red-950/20 border-red-500/30 hover:bg-red-950/40 hover:border-red-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}
                    >
                      {/* Hover ambient light */}
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl ${isUrgent ? 'bg-red-500' : 'bg-white'}`} />

                      <div className="relative z-10 flex flex-col gap-5">
                        {/* Top row: ID & Status */}
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mb-1">Unit Tracking ID</p>
                            <p className="font-mono text-lg text-white font-bold">{bag.bagId}</p>
                          </div>
                          <div className="text-right">
                            {bag.status === 'AVAILABLE' ? (
                              <span className="inline-flex items-center text-[10px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(74,222,128,0.15)]">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse" />
                                Available
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-1.5 rounded-full uppercase tracking-widest">
                                {bag.status}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Middle row: Stats Data */}
                        <div className="grid grid-cols-3 gap-4 py-4 border-y border-white/5">
                          <div>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Volume</p>
                            <p className="text-2xl font-black font-outfit text-white">{bag.quantity}<span className="text-sm text-white/50 ml-1">ml</span></p>
                          </div>
                          <div>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Expiries In</p>
                            <p className={`text-xl font-black font-outfit ${isUrgent ? 'text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]' : daysToExpiry <= 15 ? 'text-amber-400' : 'text-white'}`}>
                              {daysToExpiry} <span className="text-sm font-normal opacity-50">days</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Market State</p>
                            {bag.exchangeStatus === 'LISTED' ? (
                              <span className="text-xs font-bold text-amber-400 flex items-center gap-1 mt-1">
                                <span className="w-1 h-1 bg-amber-400 rounded-full animate-ping mr-1" />
                                LISTED
                              </span>
                            ) : bag.exchangeStatus === 'IN_TRANSIT' ? (
                              <span className="text-xs font-bold text-purple-400 flex items-center gap-1 mt-1">
                                <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse mr-1" />
                                IN TRANSIT
                              </span>
                            ) : bag.exchangeStatus === 'TRANSFERRED' ? (
                              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1 mt-1">
                                ✔ TRANSFERRED
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-white/20 mt-1 block">N/A</span>
                            )}
                          </div>
                        </div>

                        {/* Bottom row: Actions */}
                        <div className="flex justify-between items-center mt-1">
                          {/* Left action (Details) */}
                          <button className="text-[10px] text-white/30 font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1">
                            View Details
                          </button>

                          {/* Right Action (Exchange Logic) */}
                          <div>
                            {bag.status === 'AVAILABLE' && bag.exchangeStatus !== 'LISTED' && (
                              (bag.transferCount || 0) >= 1 ? (
                                <div className="inline-flex items-center text-[10px] text-red-400 font-bold uppercase tracking-widest border border-red-500/20 bg-red-950/40 px-3 py-2 rounded-lg cursor-not-allowed group/lock" title="One-Hop Rule Active">
                                  <span className="mr-2 group-hover/lock:animate-bounce">🔒</span> 1-Hop Restricted
                                </div>
                              ) : isListingEligible ? (
                                <button
                                  onClick={() => handleListClick(bag.bagId)}
                                  className="relative overflow-hidden inline-flex items-center text-[11px] text-white font-black uppercase tracking-widest border border-blue-500/50 bg-blue-600/20 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] group/list"
                                >
                                  <div className="absolute inset-0 bg-blue-600 translate-y-[100%] group-hover/list:translate-y-0 transition-transform duration-300 ease-out z-0" />
                                  <span className="relative z-10 flex items-center gap-2">
                                    List on Exchange
                                    <svg className="w-3 h-3 group-hover/list:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                  </span>
                                </button>
                              ) : (
                                <div className="inline-flex flex-col items-end">
                                  <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Listing Locked</span>
                                  <span className="text-[9px] text-white/20">Requires ≤ 15 days to expiry</span>
                                </div>
                              )
                            )}
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                </div>
                <p className="text-white/60 font-headline text-2xl font-bold">Vault Empty</p>
                <p className="text-white/30 text-sm mt-2 font-mono uppercase tracking-widest">No '{bloodGroup}' units in active storage.</p>
              </div>
            )}
          </div>
        </motion.div >

        <ListConfirmationModal
          isOpen={confirmModal.open}
          bagId={confirmModal.bagId || ''}
          onClose={() => setConfirmModal({ open: false, bagId: null })}
          onConfirm={handleConfirmList}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default BagListModal;