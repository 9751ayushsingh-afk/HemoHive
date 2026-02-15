'use client';

import Link from 'next/link';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Filter, Check, ChevronDown } from 'lucide-react';

interface BloodRequest {
  _id: string;
  hospitalId: {
    fullName: string;
  };
  bloodGroup: string;
  units: number;
  urgency: 'Normal' | 'Urgent' | 'Emergency';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Fulfilled';
  paymentStatus: 'Pending' | 'Completed' | 'Failed';
  expiresAt?: string;
  createdAt: string;
}

const fetchBloodRequests = async (): Promise<BloodRequest[]> => {
  const res = await fetch('/api/donor/blood-requests');
  if (!res.ok) {
    throw new Error('Failed to fetch blood requests');
  }
  return res.json();
};

const RequestTimer = ({ expiresAt }: { expiresAt?: string }) => {
  const [timeLeft, setTimeLeft] = React.useState<string>('');

  React.useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        clearInterval(interval);
      } else {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt) return <span className="text-gray-500">-</span>;
  if (timeLeft === 'Expired') return <span className="text-red-500 font-medium">Expired</span>;
  return <span className="text-orange-600 font-mono font-bold animate-pulse">{timeLeft}</span>;
};

export default function BloodRequestHistory() {
  const [limit, setLimit] = React.useState<number>(5);
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  const { data: bloodRequests, isLoading } = useQuery({
    queryKey: ['donor-blood-requests'],
    queryFn: fetchBloodRequests,
    refetchInterval: 5000,
  });

  const filterOptions = [
    { label: 'Last 5 History', value: 5 },
    { label: 'Last 15 History', value: 15 },
    { label: 'Show All', value: 999 },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Pre-sort by latest date first
  const sortedRequests = bloodRequests
    ? [...bloodRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  // Apply visual limit
  const displayedRequests = sortedRequests.slice(0, limit);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-visible">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <CardTitle className="text-2xl font-bold text-white">Blood Request History</CardTitle>

          {/* Premium Filter Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10"
            >
              <Filter className="h-4 w-4 text-red-500" />
              <span>{limit === 999 ? 'All' : `Last ${limit}`}</span>
              <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {isFilterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsFilterOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 p-1 shadow-2xl backdrop-blur-xl"
                  >
                    {filterOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setLimit(opt.value);
                          setIsFilterOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${limit === opt.value
                            ? 'bg-red-500 text-white'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                          }`}
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
        </CardHeader>

        <CardContent>
          <div className="rounded-xl border border-white/5 bg-slate-950/20">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-slate-400">Hospital</TableHead>
                  <TableHead className="text-slate-400">Blood Group</TableHead>
                  <TableHead className="text-slate-400 text-center">Units</TableHead>
                  <TableHead className="text-slate-400 text-center">Urgency</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Timer</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {displayedRequests && displayedRequests.length > 0 ? (
                    displayedRequests.map((request, idx) => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        key={request._id}
                        className="group border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <TableCell className="font-semibold text-slate-200">
                          {request.hospitalId ? request.hospitalId.fullName : (
                            request.status === 'Pending' ? (
                              (new Date(request.expiresAt || '').getTime() < new Date().getTime()) ?
                                <span className="text-red-500 font-semibold">No Availability Found</span> :
                                <span className="text-yellow-600 italic animate-pulse">Broadcasting...</span>
                            ) : 'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="rounded-lg bg-red-500/10 px-2 py-1 text-xs font-bold text-red-500 border border-red-500/20">
                            {request.bloodGroup}
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-mono text-slate-200">{request.units}</TableCell>
                        <TableCell className="text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider
                            ${request.urgency === 'Emergency' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' :
                              request.urgency === 'Urgent' ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-100'}`}>
                            {request.urgency}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold
                            ${request.status === 'Pending' ? 'text-yellow-500' :
                              request.status === 'Approved' ? 'text-green-500' :
                                request.status === 'Fulfilled' ? 'text-emerald-500' :
                                  request.status === 'Rejected' ? 'text-red-500' : 'text-slate-500'}`}>
                            {request.status === 'Fulfilled' ? '• Delivered' : `• ${request.status}`}
                          </span>
                        </TableCell>
                        <TableCell>
                          {request.status === 'Pending' ? <RequestTimer expiresAt={request.expiresAt} /> : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {(request.status === 'Approved' || request.status === 'Fulfilled') && (
                            request.paymentStatus === 'Completed' ? (
                              <div className="flex gap-2 justify-end">
                                <Link href={`/donor/payment/${request._id}`} passHref>
                                  <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 h-8 gap-1">
                                    Invoice
                                  </Button>
                                </Link>
                                {request.status !== 'Fulfilled' && (
                                  <Link href={`/donor/payment/${request._id}`} passHref>
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-500 h-8 shadow-lg shadow-blue-600/20">
                                      Track
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            ) : (
                              request.status === 'Approved' && (
                                <Link href={`/donor/payment/${request._id}`} passHref>
                                  <Button size="sm" className="bg-green-500 hover:bg-green-400 shadow-lg shadow-green-500/20">Make Payment</Button>
                                </Link>
                              )
                            )
                          )}
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                        No blood requests found.
                      </TableCell>
                    </TableRow>
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
