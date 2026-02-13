'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';

interface ScheduleDonationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentConfirm: (data: any) => void; // Callback after successful appointment
}

const donationTypes = ["Whole Blood", "Plasma", "Platelets"];
const timeSlots = ["9AM–11AM", "11AM–1PM", "2PM–4PM", "4PM–6PM"];
interface Hospital {
  _id: string;
  fullName: string;
  city?: string;
}

const ScheduleDonationForm: React.FC<ScheduleDonationFormProps> = ({ isOpen, onClose, onAppointmentConfirm }) => {
  const [donationType, setDonationType] = useState<string>(donationTypes[0]);
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<string>(timeSlots[0]);

  // Hospital fetching state
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState<boolean>(true);
  const [centerId, setCenterId] = useState<string>('');

  const [pickupRequired, setPickupRequired] = useState<boolean>(false);
  const [aadhaarVerified, setAadhaarVerified] = useState<boolean>(false);

  // Fetch hospitals on mount
  React.useEffect(() => {
    if (isOpen) {
      const fetchHospitals = async () => {
        try {
          setLoadingHospitals(true);
          const res = await fetch('/api/hospitals');
          if (res.ok) {
            const data = await res.json();
            setHospitals(data);
            if (data.length > 0) {
              setCenterId(data[0]._id);
            }
          } else {
            console.error("Failed to fetch hospitals");
          }
        } catch (error) {
          console.error("Error fetching hospitals:", error);
        } finally {
          setLoadingHospitals(false);
        }
      };

      fetchHospitals();
    }
  }, [isOpen]);

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
            <Select onValueChange={setCenterId} value={centerId} disabled={loadingHospitals}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={loadingHospitals ? "Loading hospitals..." : "Select center"} />
              </SelectTrigger>
              <SelectContent>
                {hospitals.length === 0 && !loadingHospitals ? (
                  <SelectItem value="no-hospitals" disabled>No hospitals available</SelectItem>
                ) : (
                  hospitals.map((hospital) => (
                    <SelectItem key={hospital._id} value={hospital._id}>
                      {hospital.fullName} {hospital.city ? `(${hospital.city})` : ''}
                    </SelectItem>
                  ))
                )}
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
              onCheckedChange={(checked: boolean | "indeterminate") => setPickupRequired(!!checked)}
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
