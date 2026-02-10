'use client';

import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import EligibilityModal from './EligibilityModal';
import ScheduleForm from './ScheduleForm'; // Restored Local Component with API
import SuccessView from './SuccessView';
import AppointmentsView from './AppointmentsView';
import CancelDialog from './CancelDialog'; // Emotional Hindi Messages
import RescheduleDialog from './RescheduleDialog';
import { UserProfile, DonationHistoryItem, Appointment } from '../types';

type View = 'dashboard' | 'eligibility' | 'schedule' | 'success' | 'appointments';

const DonateBloodPage = () => {
  const [view, setView] = useState<View>('dashboard');
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);
  const [isTicketView, setIsTicketView] = useState(false);

  // Real Data State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Cancel Dialog State
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);

  // Reschedule Dialog State
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);

  // Fetch Real user data & Appointments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch User Profile
        const userRes = await fetch('/api/donors/me');
        if (userRes.ok) {
          const data = await userRes.json();
          setUser({
            name: data.fullName || data.name || 'Donor',
            bloodGroup: data.blood_group || 'Unknown',
            lastDonationDate: data.last_donation_date || 'Never',
            nextEligibleDate: data.next_eligible_date || 'Available',
            totalDonations: data.total_donations || 0,
          });
        }

        // 2. Fetch Appointments
        const apptRes = await fetch('/api/donor/donations');
        if (apptRes.ok) {
          const apptData = await apptRes.json();
          const mappedAppts: Appointment[] = apptData.map((a: any) => {
            const dateObj = new Date(a.scheduled_at);
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return {
              id: a._id,
              status: a.status,
              donationType: a.donation_type,
              centerName: a.center?.name || 'Unknown Center',
              date: a.scheduled_at,
              timeSlot: timeStr, // Using start time as slot
              pickupRequired: a.pickup_required || false,
              qrCode: a.qr_code
            };
          });
          setAppointments(mappedAppts);
        }

      } catch (error) {
        console.error("Failed to fetch donor data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDonateClick = () => {
    setView('eligibility');
  };

  const handleViewAppointmentsClick = () => {
    setView('appointments');
  };

  const handleEligible = () => {
    setView('schedule'); // Opens the real form
  };

  const handleScheduleConfirm = (details: any) => {
    setAppointmentDetails(details);
    setView('success');
  };

  const handleHome = () => {
    setView('dashboard');
  };

  // Cancel Logic
  const handleCancelClick = (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
    setIsCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!appointmentToCancel) return;

    // Call Real API to cancel
    try {
      // Assuming there is an endpoint, or just log for now if API endpoint is unknown
      // const res = await fetch(`/api/appointments/${appointmentToCancel.id}/cancel`, { method: 'POST' });
      console.log("Cancelling appointment:", appointmentToCancel.id);

      // For now, close dialog and maybe refresh list (if we had a real list fetch)
      setIsCancelDialogOpen(false);
      setAppointmentToCancel(null);
      alert("Appointment Cancelled (API Placeholder)");
    } catch (error) {
      console.error("Error cancelling:", error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading donor profile...</div>;
  }

  // Fallback if API fails
  const displayUser = user || {
    name: 'Guest Donor',
    bloodGroup: '--',
    lastDonationDate: '--',
    nextEligibleDate: '--',
    totalDonations: 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-orange-50 text-slate-900 font-sans">
      <div className="container mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        {view === 'dashboard' && (
          <Dashboard
            user={displayUser}
            history={[]} // TODO: Fetch real history if available
            onDonateClick={handleDonateClick}
            onViewAppointmentsClick={handleViewAppointmentsClick}
          />
        )}
        {view === 'eligibility' && (
          <EligibilityModal
            onClose={() => setView('dashboard')}
            onEligible={handleEligible}
          />
        )}
        {view === 'schedule' && (
          <ScheduleForm
            onBack={() => setView('dashboard')}
            onConfirm={handleScheduleConfirm}
          />
        )}
        {view === 'success' && (
          <SuccessView
            onHome={isTicketView ? () => setView('appointments') : handleHome}
            appointment={appointmentDetails}
            isViewOnly={isTicketView}
          />
        )}
        {view === 'appointments' && (
          <AppointmentsView
            appointments={appointments}
            onBack={() => setView('dashboard')}
            onReschedule={(apt) => setIsRescheduleDialogOpen(true)}
            onViewTicket={(apt) => {
              setAppointmentDetails(apt);
              setIsTicketView(true); // It's viewing an existing ticket
              setView('success');
            }}
            onCancel={handleCancelClick} // Connect the Cancel Handler
          />
        )}

        <CancelDialog
          isOpen={isCancelDialogOpen}
          onClose={() => setIsCancelDialogOpen(false)}
          onConfirm={handleCancelConfirm}
          userStats={{
            totalDonations: displayUser.totalDonations,
            bloodGroup: displayUser.bloodGroup
          }}
        />

        {isRescheduleDialogOpen && (
          <RescheduleDialog
            onClose={() => setIsRescheduleDialogOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default DonateBloodPage;