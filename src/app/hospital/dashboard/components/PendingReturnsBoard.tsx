'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import QrScannerModal from '../../../../components/hospital/inventory/QrScannerModal';

interface ReturnRequest {
  _id: string;
  userId: {
    fullName: string;
    bloodGroup: string;
    mobile?: string;
  };
  creditId: {
    requestId: {
      bloodGroup: string;
      units: number;
    };
  };
  status: string;
  units: number; // Added: Dynamic units from penalty logic
  createdAt: string;
}

const PendingReturnsBoard = ({ hospitalId }: { hospitalId: string }) => {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null);
  const [bagIds, setBagIds] = useState<string[]>([]); // Changed to array
  const [expiryDate, setExpiryDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Fetch Requests
  const { data: requests, isLoading } = useQuery({
    queryKey: ['pendingReturns', hospitalId],
    queryFn: async () => {
      if (!hospitalId) return [];
      const { data } = await axios.get(`/api/credits/return?hospitalId=${hospitalId}`);
      return data.data;
    },
    enabled: !!hospitalId,
    refetchInterval: 5000,
  });

  // Approve/Reject Mutation
  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await axios.patch('/api/credits/return', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingReturns'] });
      toast.success(selectedRequest ? 'Return Approved & Credit Cleared' : 'Success');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to process request');
    },
  });

  const handleApprove = () => {
    // Validate all IDs are filled
    const requiredCount = selectedRequest?.units || 1;
    const validIds = bagIds.filter(id => id && id.trim().length > 0);

    if (validIds.length < requiredCount || !expiryDate) {
      toast.error(`Please enter all ${requiredCount} Bag IDs and Expiry Date`);
      return;
    }

    setIsSubmitting(true);
    mutation.mutate({
      requestId: selectedRequest?._id,
      status: 'approved',
      hospitalId,
      bagIds: validIds, // Send Array
      expiryDate,
    });
  };

  const handleReject = () => {
    if (!confirm("Are you sure you want to reject this return?")) return;
    setIsSubmitting(true);
    mutation.mutate({
      requestId: selectedRequest?._id,
      status: 'rejected',
      hospitalId,
      adminComments: 'Rejected by hospital staff',
    });
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setBagIds([]);
    setExpiryDate('');
    setIsSubmitting(false);
  };

  if (isLoading) return (
    <div className="p-8 rounded-3xl bg-white/50 backdrop-blur-xl border border-white/60 shadow-xl flex flex-col items-center justify-center gap-4 min-h-[300px]">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-indigo-900 font-medium animate-pulse">Syncing Returns...</p>
    </div>
  );

  return (
    <div className="relative group">
      {/* Visual Tracer to confirm this file is active */}
      <div className="absolute top-0 right-0 p-1 bg-blue-500 text-white text-[10px] uppercase font-bold tracking-wider rounded-bl-lg z-10">
        Live V3
      </div>

      {/* Ambient Backlight */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

      <div className="relative bg-white/80 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-white/50">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              Return <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Requests</span>
            </h2>
            <p className="text-slate-500 mt-1 font-medium flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Live Feed • Waiting for verification
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl border border-slate-200">
            <span className="text-2xl font-bold text-slate-800">{requests?.length || 0}</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending</span>
          </div>
        </div>

        {(!requests || requests.length === 0) ? (
          <div className="text-center py-16 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 group-hover:border-indigo-200 transition-colors">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✨</span>
            </div>
            <h3 className="text-lg font-bold text-slate-700">All Caught Up!</h3>
            <p className="text-slate-400">No pending returns requires your attention.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence>
              {requests.map((req: ReturnRequest, index: number) => (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 hover:scale-[1.01] transition-all duration-300 group/card relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 group-hover/card:opacity-100 transition-opacity"></div>

                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-100 to-red-50 text-red-600 flex flex-col items-center justify-center font-black border border-red-100 shadow-inner">
                        <span className="text-xl leading-none">{req.creditId?.requestId?.bloodGroup || req.userId.bloodGroup}</span>
                        <span className="text-[10px] font-bold text-red-400 mt-1">{req.units} UNIT{req.units > 1 ? 'S' : ''}</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
                        RET
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-800 group-hover/card:text-indigo-700 transition-colors">
                        {req.userId.fullName}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md">Owned: {req.userId.bloodGroup}</span>
                        <span>•</span>
                        <span>{new Date(req.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedRequest(req)}
                    className="px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/10 hover:shadow-indigo-500/30 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-violet-600 transition-all active:scale-95 flex items-center gap-2 group/btn"
                  >
                    Verify
                    <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Premium Verification Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={closeModal}></div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative overflow-hidden z-10"
            >
              {/* Header Gradient */}
              <div className="h-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 relative flex flex-col justify-end">
                <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="text-3xl font-black text-white relative z-10">Verify Return</h3>
                <p className="text-indigo-100 font-medium relative z-10">Check bag details carefully.</p>

                <button onClick={closeModal} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-8 space-y-6">
                {/* Donor Info Card */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Return</div>
                    {/* Corrected: Show Credit/Bag Blood Group */}
                    <div className="text-3xl font-black text-rose-500">{selectedRequest.creditId?.requestId?.bloodGroup}</div>
                  </div>
                  <div className="w-px h-10 bg-slate-200"></div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Donor</div>
                    <div className="text-xl font-bold text-slate-600">{selectedRequest.userId.bloodGroup}</div>
                  </div>
                  <div className="w-px h-10 bg-slate-200"></div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Name</div>
                    <div className="font-bold text-slate-800 text-sm truncate">{selectedRequest.userId.fullName}</div>
                  </div>
                </div>

                {/* Inputs */}
                <div className="space-y-4">
                  {/* Dynamic Inputs based on Units Owed */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">
                      Scan {selectedRequest.units} Bag IDs (1 Unit Each)
                    </label>
                    {Array.from({ length: selectedRequest.units }).map((_, index) => (
                      <div key={index} className="group/input mb-3">
                        <div className="relative flex gap-2">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={bagIds[index] || ''}
                              onChange={(e) => {
                                const newIds = [...bagIds];
                                newIds[index] = e.target.value;
                                setBagIds(newIds);
                              }}
                              placeholder={`SCAN BAG ID #${index + 1}...`}
                              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none font-mono font-bold text-slate-800 transition-all group-hover/input:border-slate-300"
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🩸</span>
                          </div>
                          <button
                            onClick={() => {
                              // Logic for scanning specific index would go here, 
                              // for now we just open global scanner and user has to manually assign or we make scanner smarter
                              setIsScanning(true);
                              // In a real app we'd track which index triggered the scan
                            }}
                            className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl border-2 border-slate-200 transition-colors flex items-center justify-center text-slate-600 hover:text-slate-900"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="group/input">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Bag Expiry Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-800 transition-all group-hover/input:border-slate-300"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">📅</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <button
                    onClick={handleReject}
                    className="py-4 rounded-xl border-2 border-red-100 text-red-600 font-bold hover:bg-red-50 hover:border-red-200 transition-colors"
                  >
                    REJECT RETURN
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={mutation.isPending}
                    className="py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {mutation.isPending ? (
                      <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : (
                      <>
                        <span>APPROVE & CLEAR</span>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanner Modal */}
      <AnimatePresence>
        {isScanning && (
          <QrScannerModal
            onClose={() => setIsScanning(false)}
            onScanSuccess={(code) => {
              // Try to parse format: BAG_ID|YYYY-MM-DD
              let scannedId = code;
              if (code.includes('|')) {
                const [id, date] = code.split('|');
                scannedId = id.trim();
                if (date) setExpiryDate(date.trim());
                toast.success("Bag ID & Expiry Date Scanned!");
              } else {
                toast.success("Bag ID Scanned!");
              }

              setBagIds(prev => {
                // Find first empty slot or append
                const newIds = [...prev];
                const emptyIndex = newIds.findIndex(id => !id || id.trim() === '');
                if (emptyIndex !== -1) {
                  newIds[emptyIndex] = scannedId;
                } else {
                  newIds.push(scannedId);
                }
                return newIds;
              });

              setIsScanning(false);
            }}
          />
        )}
      </AnimatePresence>
    </div >
  );
};

export default PendingReturnsBoard;
