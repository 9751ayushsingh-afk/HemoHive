'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import { Button } from '../../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { useQuery } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useNotification } from '../../contexts/NotificationContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const MotionButton = motion(Button);

interface AvailableHospital {
  _id: string;
  fullName: string;
  email: string;
}

const fetchAvailableHospitals = async (bloodGroup: string, units: number): Promise<AvailableHospital[]> => {
  if (!bloodGroup) return [];
  const res = await fetch(`/api/hospitals/available/${bloodGroup}?units=${units}`);
  if (!res.ok) throw new Error('Failed to fetch hospitals');
  return res.json();
};

const fetchAllHospitals = async (): Promise<AvailableHospital[]> => {
  const res = await fetch('/api/hospitals');
  if (!res.ok) throw new Error('Failed to fetch list');
  return res.json();
};

const formSchema = z.object({
  bloodGroup: z.string().min(1, 'Blood group is required'),
  units: z.coerce.number().min(1, 'At least one unit is required'),
  urgency: z.enum(['Normal', 'Urgent', 'Emergency']),
  patientHospital: z.string().min(3, 'Please select a hospital'),
  recipientHospitalId: z.string().optional(),
  reason: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const createBloodRequest = async (data: FormValues) => {
  console.log('Broadcasting blood request:', data);
  const res = await fetch('/api/donor/blood-requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to broadcast request');
  }
  return res.json();
};

export default function BloodRequestModule() {
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      bloodGroup: '',
      units: 1,
      urgency: 'Normal',
      patientHospital: '',
      recipientHospitalId: '',
      reason: '',
    },
  });

  const bloodGroup = form.watch('bloodGroup');
  const units = form.watch('units') || 1;

  const { data: hospitals, isLoading: isLoadingHospitals } = useQuery({
    queryKey: ['hospitals', bloodGroup, units],
    queryFn: () => fetchAvailableHospitals(bloodGroup, units),
    enabled: !!bloodGroup,
  });

  const { data: allHospitals, isLoading: isLoadingAllHospitals } = useQuery({
    queryKey: ['allHospitals'],
    queryFn: fetchAllHospitals
  });

  const mutation = useMutation({
    mutationFn: createBloodRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      form.reset();
      showNotification('Request Broadcasted to All Nearby Hospitals! 📡', 'success');
    },
    onError: (error) => {
      console.error('Submission error:', error);
      showNotification('Failed to broadcast request.', 'error');
    }
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto border-red-500/20 shadow-lg shadow-red-500/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📢</span> Broadcast Blood Request
        </CardTitle>
        <p className="text-sm text-gray-500">
          This will alert ALL eligible hospitals nearby. The first to accept will fulfill your request.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="bloodGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Group Required</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Blood Group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="units"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Units Needed</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgency Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Urgency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['Normal', 'Urgent', 'Emergency'].map((level) => (
                          <SelectItem key={level} value={level}>
                            {level === 'Emergency' ? '🚨 Emergency (Immediate)' : level === 'Urgent' ? '⚡ Urgent (Within hours)' : 'Normal'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patientHospital"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Location (Select Registered Hospital)</FormLabel>
                    <Select
                      onValueChange={(value: string) => {
                        const selectedHospital = allHospitals?.find((h: any) => h._id === value);
                        field.onChange(selectedHospital?.fullName || value); // Store Name for display
                        form.setValue('recipientHospitalId', value); // Store ID for logic
                      }}
                      value={form.watch('recipientHospitalId')}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Hospital" />
                        </SelectTrigger>
                      </FormControl>
                      {/* Mixed Theme: Light Trigger (Standard), Dark Dropdown (Aesthetic) */}
                      <SelectContent className="bg-slate-900 border-slate-700 text-white">
                        {isLoadingAllHospitals ? (
                          <SelectItem value="loading" disabled className="text-slate-400">Loading hospitals...</SelectItem>
                        ) : (
                          (!allHospitals || allHospitals.length === 0) ? (
                            <SelectItem value="no_data" disabled className="text-red-400 font-bold">
                              No Registered Hospitals Found!
                            </SelectItem>
                          ) : (
                            allHospitals.map((hospital: any) => (
                              <SelectItem
                                key={hospital._id}
                                value={hospital._id}
                                className="text-white hover:bg-slate-800 focus:bg-slate-800 focus:text-white cursor-pointer"
                              >
                                {hospital.fullName}
                              </SelectItem>
                            ))
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />


            </div>

            <div className="pt-6">
              <h3 className="text-md font-semibold mb-2 text-slate-700">
                {bloodGroup ? `Hospitals with ${bloodGroup} Stock:` : 'Select a Blood Group to see availability'}
              </h3>
              {isLoadingHospitals && <p className="text-sm text-gray-500">Searching inventory...</p>}

              {!isLoadingHospitals && hospitals && hospitals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {hospitals.map((hospital) => (
                    <div key={hospital._id} className="p-3 border rounded-lg bg-green-50 border-green-200 text-sm">
                      <p className="font-semibold text-green-900">{hospital.fullName}</p>
                      <p className="text-xs text-green-700">{hospital.email}</p>
                    </div>
                  ))}
                </div>
              ) : (
                !isLoadingHospitals && bloodGroup && (
                  <div className="p-3 border rounded-lg bg-red-50 border-red-200 text-sm">
                    <p className="text-red-600 font-semibold">No Availability Found</p>
                    <p className="text-red-500">Cannot broadcast request: No nearby hospitals currently have {bloodGroup} stock.</p>
                  </div>
                )
              )}
            </div>

            <div className="flex justify-end pt-6">
              <MotionButton
                type="submit"
                disabled={mutation.isPending || (!!bloodGroup && !isLoadingHospitals && (!hospitals || hospitals.length === 0))}
                size="lg"
                className="bg-red-600 hover:bg-red-700 w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {mutation.isPending ? 'Broadcasting...' : '📢 Broadcast Request to All Hospitals'}
              </MotionButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card >
  );
}