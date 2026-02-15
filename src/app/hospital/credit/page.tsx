'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { useNotification } from '../../../contexts/NotificationContext';
import { toast } from 'react-hot-toast';

import { Filter, Check, ChevronDown, ListFilter, FileText } from 'lucide-react';

interface BloodRequest {
  _id: string;
  userId: {
    fullName: string;
  };
  bloodGroup: string;
  units: number;
  urgency: 'Normal' | 'Urgent' | 'Emergency';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Fulfilled';
  createdAt: string;
  document?: string;
}

const fetchBloodRequests = async (): Promise<BloodRequest[]> => {
  const res = await fetch('/api/hospital/blood-requests');
  if (!res.ok) {
    throw new Error('Failed to fetch blood requests');
  }
  return res.json();
};

const updateBloodRequestStatus = async ({ requestId, status }: { requestId: string, status: 'Approved' | 'Rejected' }) => {
  const res = await fetch(`/api/hospital/blood-requests/${requestId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    throw new Error('Failed to update blood request status');
  }
  return res.json();
};

const viewDocument = async (doc: string) => {
  if (!doc) return;

  console.log('[DocumentView] Initial URL:', doc);
  const toastId = toast.loading('Preparing document...');

  try {
    let processedUrl = doc;
    if (doc.includes('cloudinary.com') && doc.startsWith('http:')) {
      processedUrl = doc.replace('http:', 'https:');
      console.log('[DocumentView] Promoted to HTTPS:', processedUrl);
    } else if (doc.startsWith('//')) {
      processedUrl = 'https:' + doc;
      console.log('[DocumentView] Fixed protocol-relative:', processedUrl);
    }

    if (processedUrl.startsWith('http')) {
      // High-reliability: Fetch as Blob first to bypass browser plugin security quirks
      const response = await fetch(processedUrl);
      if (!response.ok) throw new Error(`Server returned ${response.status}`);

      let blob = await response.blob();

      // Force PDF type if URL suggests it, to prevent "unreadable text"
      if (processedUrl.toLowerCase().endsWith('.pdf') || processedUrl.includes('/raw/')) {
        blob = new Blob([blob], { type: 'application/pdf' });
      }

      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Document opened', { id: toastId });
    } else if (processedUrl.startsWith('data:')) {
      const res = await fetch(processedUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Document opened', { id: toastId });
    } else {
      window.open(processedUrl, '_blank');
      toast.dismiss(toastId);
    }
  } catch (e) {
    console.error('[DocumentView] High-reliability view failed:', e);
    toast.error('Direct view failed. Downloading fallback...', { id: toastId });

    // Fallback: Direct Download or direct window open
    const link = document.createElement('a');
    link.href = doc;
    link.target = '_blank';
    link.download = 'medical-report';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export default function CreditAndPenaltySystem() {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();
  const [limit, setLimit] = React.useState<number>(999);
  const [statusFilter, setStatusFilter] = React.useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  const { data: bloodRequests, isLoading } = useQuery({
    queryKey: ['hospital-blood-requests'],
    queryFn: fetchBloodRequests,
  });

  const mutation = useMutation({
    mutationFn: updateBloodRequestStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospital-blood-requests'] });
      showNotification('Blood request status updated successfully!', 'success');
    },
    onError: () => {
      showNotification('Failed to update blood request status.', 'error');
    },
  });

  const handleUpdateRequest = (requestId: string, status: 'Approved' | 'Rejected') => {
    mutation.mutate({ requestId, status });
  };

  const filterOptions = [
    { label: 'All Requests', value: 'All' },
    { label: 'Pending Only', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
  ];

  const limitOptions = [
    { label: 'Last 5', value: 5 },
    { label: 'Last 15', value: 15 },
    { label: 'Show All', value: 999 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-bold animate-pulse">Syncing Obligation Data...</p>
        </div>
      </div>
    );
  }

  // Apply Filtering & Sorting (Newest First)
  const processedRequests = bloodRequests
    ? [...bloodRequests]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter(req => statusFilter === 'All' || req.status === statusFilter)
      .slice(0, limit)
    : [];

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-[1600px] mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Credit & <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-500">Penalty</span> System
            </h1>
            <p className="text-slate-400 mt-2 font-medium">Manage donor blood obligations and clearing requests.</p>
          </div>

          <div className="flex items-center gap-6">
            {/* Premium Filter Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/10 shadow-lg"
              >
                <Filter className="h-4 w-4 text-red-500" />
                <span>Filter & Sort</span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {isFilterOpen && (
                  <>
                    <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsFilterOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 p-2 shadow-2xl backdrop-blur-2xl"
                    >
                      <div className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5 mb-1">
                        Filter by Status
                      </div>
                      {filterOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setStatusFilter(opt.value); setIsFilterOpen(false); }}
                          className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all ${statusFilter === opt.value ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                        >
                          {opt.label}
                          {statusFilter === opt.value && <Check className="h-4 w-4" />}
                        </button>
                      ))}

                      <div className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5 my-1">
                        Result Limit
                      </div>
                      {limitOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setLimit(opt.value); setIsFilterOpen(false); }}
                          className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all ${limit === opt.value ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                        >
                          {opt.label}
                          {limit === opt.value && <Check className="h-4 w-4" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Requests</p>
                <p className="text-2xl font-black text-white">{(bloodRequests || []).filter(r => r.status === 'Pending').length}</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500">
                <ListFilter className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        <Card className="relative overflow-hidden border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl rounded-3xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-rose-500 to-indigo-500 opacity-50" />

          <CardHeader className="border-b border-white/5 pb-6">
            <CardTitle className="text-xl font-bold text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Live Obligation Feed
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sort:</span>
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Newest First</span>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="rounded-2xl border border-white/5 bg-slate-950/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent bg-white/5">
                    <TableHead className="text-slate-400 font-bold py-5">Donor / User</TableHead>
                    <TableHead className="text-slate-400 font-bold text-center">Blood Group</TableHead>
                    <TableHead className="text-slate-400 font-bold text-center">Units Owed</TableHead>
                    <TableHead className="text-slate-400 font-bold text-center">Urgency</TableHead>
                    <TableHead className="text-slate-400 font-bold">Status</TableHead>
                    <TableHead className="text-slate-400 font-bold text-right pr-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {processedRequests.length > 0 ? (
                      processedRequests.map((request, idx) => (
                        <motion.tr
                          key={request._id}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                          className="group border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <TableCell className="py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                                {request.userId?.fullName?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-slate-200 group-hover:text-white transition-colors">
                                  {request.userId ? request.userId.fullName : 'Anonymous Donor'}
                                </p>
                                <p className="text-[10px] font-mono text-slate-500 uppercase">ID: {request._id.slice(-8)}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-black text-red-500 border border-red-500/20 shadow-sm">
                              {request.bloodGroup}
                            </span>
                          </TableCell>
                          <TableCell className="text-center font-mono text-lg font-black text-slate-200">
                            {request.units}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider shadow-sm
                              ${request.urgency === 'Emergency' ? 'bg-red-600 text-white animate-pulse' :
                                request.urgency === 'Urgent' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300'}`}>
                              {request.urgency}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`flex items-center gap-1.5 text-xs font-bold
                              ${request.status === 'Pending' ? 'text-amber-500' :
                                request.status === 'Approved' ? 'text-emerald-500' :
                                  request.status === 'Rejected' ? 'text-rose-500' : 'text-slate-500'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${request.status === 'Pending' ? 'bg-amber-500 animate-ping' : request.status === 'Approved' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              {request.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            {request.status === 'Pending' ? (
                              <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform">
                                {request.document && (
                                  <Button
                                    onClick={() => viewDocument(request.document!)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-slate-400 hover:text-white hover:bg-white/10 border border-white/5 h-9 rounded-xl px-3"
                                  >
                                    <FileText className="h-4 w-4 mr-1.5" />
                                    DOC
                                  </Button>
                                )}
                                <Button
                                  onClick={() => handleUpdateRequest(request._id, 'Approved')}
                                  disabled={mutation.isPending}
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-9 rounded-xl shadow-lg shadow-emerald-600/20"
                                >
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => handleUpdateRequest(request._id, 'Rejected')}
                                  disabled={mutation.isPending}
                                  size="sm"
                                  variant="destructive"
                                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold h-9 rounded-xl shadow-lg shadow-rose-600/20"
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-white/5 py-1 px-2 rounded-md">Processed</span>
                            )}
                          </TableCell>
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={6} className="h-64 text-center">
                          <div className="flex flex-col items-center justify-center gap-3 opacity-30">
                            <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-500 flex items-center justify-center text-4xl">📭</div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matching obligations found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div >
    </div >
  );
}