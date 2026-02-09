'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface ScheduleDonationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentConfirm: (data: any) => void; // Callback after successful appointment
}

const donationTypes = ["Whole Blood", "Plasma", "Platelets"];
const timeSlots = ["9AM–11AM", "11AM–1PM", "2PM–4PM", "4PM–6PM"];
// Placeholder for centers, in a real app this would be fetched from API
const donationCenters = [
    { id: '1', name: 'City Hospital Blood Bank' },
    { id: '2', name: 'Red Cross Donation Center' },
    { id: '3', name: 'Community Health Clinic' },
];

const ScheduleDonationForm: React.FC<ScheduleDonationFormProps> = ({ isOpen, onClose, onAppointmentConfirm }) => {
  const [donationType, setDonationType] = useState<string>(donationTypes[0]);
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<string>(timeSlots[0]);
  const [centerId, setCenterId] = useState<string>(donationCenters[0].id);
  const [pickupRequired, setPickupRequired] = useState<boolean>(false);
  const [aadhaarVerified, setAadhaarVerified] = useState<boolean>(false);

  const handleSubmit = async () => {
    const formData = {
      donation_type: donationType,
      date: preferredDate, // API expects 'date'
      time_slot: timeSlot,
      center_id: centerId,
      pickup_required: pickupRequired,
      // aadhaar_verified: aadhaarVerified, // Aadhaar verification status is handled server-side implicitly or via session
    };

    try {
      const response = await fetch('/api/donations/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (response.ok) {
        onAppointmentConfirm(result); // Pass API response data back to parent
        onClose(); // Close the form
      } else {
        console.error("Failed to schedule appointment:", result);
        alert(`Failed to schedule appointment: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      alert("An unexpected error occurred while scheduling. Please try again.");
    }
  };

  const handleAadhaarVerification = () => {
    // This would trigger an actual Aadhaar verification process (e.g., another modal, redirect)
    console.log("Initiating Aadhaar verification...");
    // For now, just set it to true for demonstration
    setAadhaarVerified(true);
    alert("Aadhaar Verified (placeholder)!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Schedule Donation (दान अपॉइंटमेंट शेड्यूल करें)</DialogTitle>
          <DialogDescription>
            Fill in the details to schedule your blood donation appointment.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="donationType" className="text-right">
              Donation Type
            </Label>
            <Select onValueChange={setDonationType} value={donationType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select donation type" />
              </SelectTrigger>
              <SelectContent>
                {donationTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="preferredDate" className="text-right">
              Preferred Date
            </Label>
            <Input
              id="preferredDate"
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="timeSlot" className="text-right">
              Time Slot
            </Label>
            <Select onValueChange={setTimeSlot} value={timeSlot}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="center" className="text-right">
              Donation Center
            </Label>
            <Select onValueChange={setCenterId} value={centerId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select center" />
              </SelectTrigger>
              <SelectContent>
                {donationCenters.map((center) => (
                  <SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pickupRequired" className="text-right">
              Pickup Required?
            </Label>
            <Checkbox
              id="pickupRequired"
              checked={pickupRequired}
              onCheckedChange={(checked) => setPickupRequired(!!checked)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Aadhaar Verification</Label>
            <Button
              onClick={handleAadhaarVerification}
              disabled={aadhaarVerified}
              className="col-span-3 bg-blue-500 hover:bg-blue-600 text-white"
            >
              {aadhaarVerified ? 'Aadhaar Verified' : 'Verify Aadhaar (आधार सत्यापन)'}
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!preferredDate || !aadhaarVerified}>
            Confirm Appointment (अपॉइंटमेंट कन्फर्म करें)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleDonationForm;
