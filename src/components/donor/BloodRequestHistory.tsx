'use client';

import Link from 'next/link';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';

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
  const { data: bloodRequests, isLoading } = useQuery({
    queryKey: ['donor-blood-requests'],
    queryFn: fetchBloodRequests,
    refetchInterval: 5000,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Blood Request History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hospital</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timer</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bloodRequests && bloodRequests.length > 0 ? (
                bloodRequests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>
                      {request.hospitalId ? request.hospitalId.fullName : (
                        request.status === 'Pending' ? (
                          (new Date(request.expiresAt || '').getTime() < new Date().getTime()) ?
                            <span className="text-red-500 font-semibold">No Availability Found</span> :
                            <span className="text-yellow-600 italic animate-pulse">Broadcasting...</span>
                        ) : 'N/A'
                      )}
                    </TableCell>
                    <TableCell>{request.bloodGroup}</TableCell>
                    <TableCell>{request.units}</TableCell>
                    <TableCell>{request.urgency}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            request.status === 'Fulfilled' ? 'bg-emerald-100 text-emerald-800' : // [NEW] Green for Delivered
                              request.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                        {request.status === 'Fulfilled' ? 'Delivered' : request.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {request.status === 'Pending' ? <RequestTimer expiresAt={request.expiresAt} /> : '-'}
                    </TableCell>
                    <TableCell>
                      {(request.status === 'Approved' || request.status === 'Fulfilled') && (
                        request.paymentStatus === 'Completed' ? (
                          <div className="flex gap-2">
                            <Link href={`/donor/payment/${request._id}`} passHref>
                              <Button size="sm" variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50 h-8">
                                📄 Invoice
                              </Button>
                            </Link>
                            {/* Only show Track if NOT Fulfilled (Delivered) */}
                            {request.status !== 'Fulfilled' && (
                              <Link href={`/donor/payment/${request._id}`} passHref>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8">
                                  🚚 Track
                                </Button>
                              </Link>
                            )}
                          </div>
                        ) : (
                          // If Approved but not paid
                          request.status === 'Approved' && (
                            <Link href={`/donor/payment/${request._id}`} passHref>
                              <Button size="sm" className="bg-green-500 hover:bg-green-600">Make Payment</Button>
                            </Link>
                          )
                        )
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No blood requests found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
