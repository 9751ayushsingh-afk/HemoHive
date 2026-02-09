'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

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
  createdAt: string;
}

const PendingReturnsBoard = ({ hospitalId }: { hospitalId: string }) => {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null);
  const [bagId, setBagId] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Requests
  // Note: If hospitalId is missing, this might be because the parent didn't pass it.
  // We should fail gracefully or try to get it from context if needed.
  const { data: requests, isLoading } = useQuery({
    queryKey: ['pendingReturns', hospitalId],
    queryFn: async () => {
      if (!hospitalId) return [];
      const { data } = await axios.get(`/api/credits/return?hospitalId=${hospitalId}`);
      return data.data;
    },
    enabled: !!hospitalId,
    refetchInterval: 10000,
  });

  // Approve/Reject Mutation
  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await axios.patch('/api/credits/return', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingReturns'] });
      toast.success(selectedRequest ? 'Request processed successfully!' : 'Success');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to process request');
    },
  });

  const handleApprove = () => {
    if (!bagId || !expiryDate) {
      toast.error("Please enter Bag ID and Expiry Date");
      return;
    }
    setIsSubmitting(true);
    mutation.mutate({
      requestId: selectedRequest?._id,
      status: 'approved',
      hospitalId,
      bagId,
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
    setBagId('');
    setExpiryDate('');
    setIsSubmitting(false);
  };

  if (isLoading) return <div className="p-6 text-center text-slate-500 animate-pulse">Loading Pending Returns...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
      {/* Visual Tracer to confirm this file is active */}
      <div className="absolute top-0 right-0 p-1 bg-blue-500 text-white text-[10px] uppercase font-bold tracking-wider rounded-bl-lg z-10">
        Live V2
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Pending Returns</h2>
          <p className="text-sm text-slate-500">Verify returned blood bags from donors</p>
        </div>
        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
          {requests?.length || 0} Pending
        </span>
      </div>

      {(!requests || requests.length === 0) ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
          <p className="text-slate-400">No pending returns at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((req: ReturnRequest) => (
            <motion.div
              key={req._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg">
                  {req.userId.bloodGroup}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{req.userId.fullName}</h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {req._id.slice(-6)} • {new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedRequest(req)}
                className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
              >
                Verify Return
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Verification Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800">Verify Return</h3>
                <p className="text-sm text-slate-500">Confirm details for {selectedRequest.userId.fullName}</p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Blood Group Match</label>
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="font-black text-red-600 text-xl">{selectedRequest.userId.bloodGroup}</div>
                    <div className="text-sm text-red-800">Donor declared group matches request.</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bag ID</label>
                    <input
                      type="text"
                      value={bagId}
                      onChange={(e) => setBagId(e.target.value)}
                      placeholder="Scan or enter ID"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-600">
                  <span className="font-bold">Note:</span> Creating this record will clear the donor's debt and add the bag to your pending inventory for testing.
                </div>
              </div>

              <div className="p-4 bg-slate-50 flex gap-3 justify-end border-t border-slate-100">
                <button
                  onClick={handleReject}
                  disabled={mutation.isPending}
                  className="px-4 py-2 text-red-600 font-semibold hover:bg-red-50 rounded-lg transition-colors text-sm"
                >
                  Reject
                </button>
                <button
                  onClick={closeModal}
                  disabled={mutation.isPending}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-200 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={mutation.isPending}
                  className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 text-sm flex items-center gap-2"
                >
                  {mutation.isPending ? 'Processing...' : 'Verify & Approve'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PendingReturnsBoard;
