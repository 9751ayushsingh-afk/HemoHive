'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { IBloodBag } from '@/models/BloodBag';
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
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-800 rounded-lg p-8 w-full max-w-5xl max-h-[90vh] flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Bag List: {bloodGroup}</h2>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>
        <div className="flex-grow overflow-y-auto">
          {bags.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="p-3">Bag ID</th>
                  <th className="p-3">Volume</th>
                  <th className="p-3">Expiry Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Exchange</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bags.map(bag => {
                  const daysToExpiry = Math.ceil((new Date(bag.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  const isListingEligible = daysToExpiry <= 15 && daysToExpiry > 0;

                  return (
                    <tr key={bag.bagId} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                      <td className="p-3 font-mono text-sm text-gray-300">{bag.bagId}</td>
                      <td className="p-3 text-emerald-400 font-bold">{bag.quantity} ml</td>
                      <td className="p-3 text-slate-300">
                        {new Date(bag.expiryDate).toLocaleDateString()}
                        <span className={`block text-xs font-bold ${daysToExpiry <= 15 ? 'text-amber-400' : 'text-gray-500'}`}>
                          {daysToExpiry} days left
                        </span>
                      </td>
                      <td className="p-3 uppercase text-xs font-bold tracking-wider">
                        <span className={`px-2 py-1 rounded-full ${bag.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {bag.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {bag.exchangeStatus === 'LISTED' ? (
                          <span className="text-xs font-bold text-amber-500 bg-amber-100 px-2 py-1 rounded-full">
                            LISTED
                          </span>
                        ) : bag.exchangeStatus === 'TRANSFERRED' ? (
                          <span className="text-xs font-bold text-purple-500 bg-purple-100 px-2 py-1 rounded-full">
                            TRANSFERRED
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        {bag.status === 'AVAILABLE' && bag.exchangeStatus !== 'LISTED' && (
                          isListingEligible ? (
                            <button
                              onClick={() => handleListClick(bag.bagId)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded shadow-sm transition-all"
                            >
                              List on Exchange
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-500 italic" title="Can only list 15 days before expiry">
                              Expires in {daysToExpiry}d<br />(Wait to List)
                            </span>
                          )
                        )}

                        {/* Placeholder for Edit/View */}
                        <button className="ml-2 text-xs text-gray-400 hover:text-white">Details</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-400 text-lg">No bags found for this blood group.</p>
              <p className="text-gray-600 text-sm">Use the 'Add Bag' form to create inventory.</p>
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
    </motion.div >
  );
};

export default BagListModal;