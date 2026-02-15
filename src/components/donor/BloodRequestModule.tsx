'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useNotification } from '../../contexts/NotificationContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import { Droplets, Activity, Zap, Radio, CheckCircle2, Wifi } from 'lucide-react';

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
  document: z.string().optional(), // Will be validated in onSubmit or via refine
}).refine((data) => {
  if (data.units > 2 && !data.document) {
    return false;
  }
  return true;
}, {
  message: "Document is required for requests > 2 units",
  path: ["document"],
});

type FormValues = z.infer<typeof formSchema>;

const createBloodRequest = async (formData: FormData) => {
  console.log('Broadcasting blood request with FormData');
  const res = await fetch('/api/credits/request', {
    method: 'POST',
    body: formData, // Send FormData directly
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [lastRequest, setLastRequest] = useState<FormValues | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      bloodGroup: '',
      units: 1,
      urgency: 'Normal',
      patientHospital: '',
      recipientHospitalId: '',
      reason: '',
      document: '',
    },
  });

  const bloodGroup = form.watch('bloodGroup');
  const units = form.watch('units') || 1;
  const urgency = form.watch('urgency');

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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      // We need to pass the form values for the success dialog
      setLastRequest(form.getValues());
      setShowSuccessDialog(true);
      form.reset();
      setSelectedFile(null);
    },
    onError: (error) => {
      console.error('Submission error:', error);
      showNotification('Failed to broadcast request.', 'error');
    }
  });

  const onSubmit = (values: FormValues) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key !== 'document' && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    if (selectedFile) {
      formData.append('document', selectedFile);
    }

    // Extract all hospital IDs from the availability stock check
    if (hospitals && hospitals.length > 0) {
      const targetedIds = hospitals.map(h => h._id);
      formData.append('targetedHospitalIds', JSON.stringify(targetedIds));
    }

    mutation.mutate(formData as any); // Cast because mutationFn signature changed
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification('File size exceeds 5MB limit', 'error');
        return;
      }
      setSelectedFile(file);
      form.setValue('document', file.name, { shouldValidate: true });
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mx-auto"
      >
        <Card className="border-white/10 bg-slate-900/50 backdrop-blur-md shadow-2xl">
          <CardHeader className="pb-7">
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
                <Droplets className="h-5 w-5" />
              </span>
              Broadcast Blood Request
            </CardTitle>
            <p className="text-sm text-slate-400 mt-2">
              Alert all eligible hospitals nearby. The first available hub will fulfill your request.
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.error('❌ Form Validation Errors:', errors);
                showNotification(`Validation Failed: ${Object.keys(errors).join(', ')}`, 'error');
              })} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="bloodGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300 font-medium">Blood Group Required</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl">
                              <SelectValue placeholder="Select Blood Group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
                              <SelectItem key={group} value={group} className="focus:bg-red-500/20 focus:text-white cursor-pointer py-2.5">
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
                        <FormLabel className="text-slate-300 font-medium">Units Needed</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="e.g. 2"
                            className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:border-red-500/50 transition-all font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Document Upload Field - Conditionally Rendered */}
                  <AnimatePresence>
                    {units > 2 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="col-span-full"
                      >
                        <FormField
                          control={form.control}
                          name="document"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300 font-medium flex items-center gap-2">
                                <span className="text-red-500">*</span> Medical Authorization Document
                                <span className="text-xs text-slate-500 font-normal">(Required for &gt; 2 units)</span>
                              </FormLabel>
                              <FormControl>
                                <div className="border-2 border-dashed border-white/10 rounded-xl p-4 bg-white/5 hover:bg-white/10 transition-colors text-center cursor-pointer relative">
                                  <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <div className="flex flex-col items-center gap-2 text-slate-400">
                                    <span className="bg-white/10 p-2 rounded-full">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                    </span>
                                    <span className="text-sm font-medium">
                                      {field.value ? "Document Uploaded (Click to Change)" : "Click to Upload Document"}
                                    </span>
                                    <span className="text-xs opacity-60">PDF, JPG, or PNG (Max 5MB)</span>
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <FormField
                    control={form.control}
                    name="urgency"
                    render={({ field }) => (
                      <FormItem className="col-span-full">
                        <FormLabel className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] mb-10 block text-center">PLEASE SELECT URGENCY LEVEL</FormLabel>
                        <FormControl>
                          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20">
                            {[
                              { label: 'Normal', value: 'Normal', icon: <Droplets className="h-4 w-4" />, color: 'emerald' },
                              { label: 'Urgent', value: 'Urgent', icon: <Zap className="h-4 w-4" />, color: 'amber' },
                              { label: 'Emergency', value: 'Emergency', icon: <Radio className="h-4 w-4" />, color: 'red' }
                            ].map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => field.onChange(opt.value)}
                                className="group relative flex items-center gap-3 transition-all duration-500"
                              >
                                {/* Floating Glow Aura behind text */}
                                <AnimatePresence>
                                  {field.value === opt.value && (
                                    <motion.div
                                      layoutId="glyph-aura"
                                      initial={{ opacity: 0, scale: 0.5 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.5 }}
                                      className={`absolute inset-x-[-20px] inset-y-[-10px] rounded-full blur-2xl opacity-20 bg-${opt.color}-500`}
                                    />
                                  )}
                                </AnimatePresence>

                                {/* Glyph Icon */}
                                <motion.div
                                  animate={{
                                    scale: field.value === opt.value ? 1.2 : 0.8,
                                    opacity: field.value === opt.value ? 1 : 0.4
                                  }}
                                  className={`transition-colors duration-500 ${field.value === opt.value ? `text-${opt.color}-500` : 'text-slate-600'}`}
                                >
                                  {opt.icon}
                                </motion.div>

                                {/* Label Text */}
                                <span className={`relative z-10 text-xs font-black uppercase tracking-[0.2em] transition-all duration-500
                                  ${field.value === opt.value
                                    ? 'text-white scale-110'
                                    : 'text-slate-600 hover:text-slate-400'}`}>
                                  {opt.label}
                                </span>

                                {/* Dynamic Underline Marker */}
                                {field.value === opt.value && (
                                  <motion.div
                                    layoutId="glyph-underline"
                                    className={`absolute -bottom-4 left-0 right-0 h-0.5 rounded-full shadow-lg ${opt.value === 'Normal' ? 'bg-emerald-500 shadow-emerald-500/40' : opt.value === 'Urgent' ? 'bg-amber-500 shadow-amber-500/40' : 'bg-red-500 shadow-red-500/40'}`}
                                  />
                                )}
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="patientHospital"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300 font-medium">Patient Location (Select Hospital)</FormLabel>
                        <Select
                          onValueChange={(value: string) => {
                            const selectedHospital = allHospitals?.find((h: any) => h._id === value);
                            field.onChange(selectedHospital?.fullName || value);
                            form.setValue('recipientHospitalId', value);
                          }}
                          value={form.watch('recipientHospitalId')}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl">
                              <SelectValue placeholder="Select Hospital" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl max-h-[300px]">
                            {isLoadingAllHospitals ? (
                              <SelectItem value="loading" disabled className="text-slate-400">Loading hospitals...</SelectItem>
                            ) : (
                              (!allHospitals || allHospitals.length === 0) ? (
                                <SelectItem value="no_data" disabled className="text-red-400 font-bold">No Hospitals Found</SelectItem>
                              ) : (
                                allHospitals.map((hospital: any) => (
                                  <SelectItem key={hospital._id} value={hospital._id} className="focus:bg-red-500/20 focus:text-white cursor-pointer py-2.5">
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

                {/* Minimalist Availability Status */}
                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                      Available Stock Verification
                    </h3>
                    {isLoadingHospitals && <span className="text-xs text-red-500 animate-pulse font-mono font-bold italic">Checking...</span>}
                  </div>

                  <AnimatePresence mode="wait">
                    {!isLoadingHospitals && hospitals && hospitals.length > 0 ? (
                      <motion.div
                        key="hospitals"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                      >
                        {hospitals.map((hospital) => (
                          <div key={hospital._id} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-200 text-sm truncate">{hospital.fullName}</p>
                              <p className="text-[10px] text-slate-500 truncate font-mono uppercase tracking-tighter">{hospital.email}</p>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    ) : (
                      !isLoadingHospitals && bloodGroup && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-4 rounded-xl border border-red-500/10 bg-red-500/5 text-center"
                        >
                          <p className="text-red-500 text-sm font-semibold italic">No direct availability found in nearby hospitals.</p>
                        </motion.div>
                      )
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex justify-end pt-4">
                  <div className="relative group overflow-hidden rounded-2xl p-[1px]">
                    {/* Holographic Border Glow */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-400 to-red-600 opacity-30 group-hover:opacity-100 transition-opacity"
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      style={{ backgroundSize: '200% 200%' }}
                    />

                    <Button
                      type="submit"
                      disabled={mutation.isPending || (!!bloodGroup && !isLoadingHospitals && (!hospitals || hospitals.length === 0))}
                      className="relative bg-slate-950 hover:bg-slate-900 h-14 px-10 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all border border-white/10 shadow-2xl w-full md:w-auto overflow-hidden group"
                    >
                      {/* Shimmer Effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-[45deg]"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />

                      <div className="relative z-10 flex items-center gap-3">
                        {mutation.isPending ? (
                          <span className="flex items-center gap-2">
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full"
                            />
                            Broadcasting...
                          </span>
                        ) : (
                          <>
                            <Wifi className="h-4 w-4 text-red-500 group-hover:animate-ping" />
                            Initiate Broadcast
                          </>
                        )}
                      </div>
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Premium Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md bg-slate-950 border-white/10 text-white rounded-3xl overflow-hidden p-0 shadow-[0_0_100px_rgba(239,68,68,0.15)]">
          <div className="relative h-48 flex items-center justify-center overflow-hidden">
            {/* Animated Signal Waves */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute border border-red-500/30 rounded-full"
                  initial={{ width: 0, height: 0, opacity: 0.8 }}
                  animate={{ width: 400, height: 400, opacity: 0 }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.7,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              className="relative z-10 h-20 w-20 bg-red-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-600/40"
            >
              <CheckCircle2 className="h-10 w-10 text-white" />
            </motion.div>

            {/* Background Aurora */}
            <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-red-600/10 to-transparent" />
          </div>

          <div className="p-8 text-center">
            <DialogTitle className="text-2xl font-black uppercase tracking-[0.2em] mb-4 text-center">Signal Transmitted</DialogTitle>
            <DialogDescription className="text-slate-400 text-sm leading-relaxed mb-8">
              Your blood request for <span className="text-white font-bold">{lastRequest?.bloodGroup}</span> has been broadcasted to all synchronized hospitals across the local grid.
            </DialogDescription>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Status</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase">Active</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Priority</p>
                <span className={`text-xs font-bold uppercase ${lastRequest?.urgency === 'Emergency' ? 'text-red-500' : lastRequest?.urgency === 'Urgent' ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {lastRequest?.urgency || 'Normal'}
                </span>
              </div>
            </div>

            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="w-full h-12 rounded-xl bg-white text-black hover:bg-slate-200 font-bold tracking-widest uppercase text-[10px]"
            >
              Continue Monitoring
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}