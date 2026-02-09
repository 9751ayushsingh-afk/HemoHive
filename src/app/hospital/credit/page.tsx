'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { useNotification } from '../../../contexts/NotificationContext';

interface BloodRequest {
  _id: string;
  userId: {
    fullName: string;
  };
  bloodGroup: string;
  units: number;
  urgency: 'Normal' | 'Urgent' | 'Emergency';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Fulfilled';
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

export default function CreditAndPenaltySystem() {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

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
          <CardTitle>Credit and Penalty System</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bloodRequests && bloodRequests.length > 0 ? (
                bloodRequests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>{request.userId ? request.userId.fullName : 'N/A'}</TableCell>
                    <TableCell>{request.bloodGroup}</TableCell>
                    <TableCell>{request.units}</TableCell>
                    <TableCell>{request.urgency}</TableCell>
                    <TableCell>{request.status}</TableCell>
                    <TableCell>
                      {request.status === 'Pending' && (
                        <>
                          <Button onClick={() => handleUpdateRequest(request._id, 'Approved')} size="sm" className="mr-2">Approve</Button>
                          <Button onClick={() => handleUpdateRequest(request._id, 'Rejected')} size="sm" variant="destructive">Reject</Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No blood requests found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}