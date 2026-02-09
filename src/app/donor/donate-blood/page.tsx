'use client';

import React, { useState } from 'react';
import Dashboard from './Dashboard';
import EligibilityModal from './EligibilityModal';
import ScheduleForm from './ScheduleForm';
import SuccessView from './SuccessView';
import AppointmentsView from './AppointmentsView';
import { UserProfile, DonationHistoryItem, Appointment } from '../types';

// Mock Data
const MOCK_USER: UserProfile = {
  name: 'AYUSH SINGH',
  bloodGroup: 'A+',
  lastDonationDate: '2023-10-15',
  nextEligibleDate: '2024-01-15',
  totalDonations: 8,
};

const MOCK_HISTORY: DonationHistoryItem[] = [
  { id: '1', type: 'Whole Blood', center: 'City Center', date: '2023-10-15', amount: '1 unit' },
  { id: '2', type: 'Platelets', center: 'Downtown Clinic', date: '2023-07-02', amount: '1 unit' },
  { id: '3', type: 'Whole Blood', center: 'City Center', date: '2023-03-20', amount: '1 unit' },
];

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    centerId: 'center1',
    date: '2024-03-15',
    timeSlot: '10:00 AM',
    status: 'scheduled',
    donationType: 'Whole Blood',
    pickupRequired: true,
  },
  {
    id: '2',
    centerId: 'center2',
    date: '2023-12-20',
    timeSlot: '2:00 PM',
    status: 'completed',
    donationType: 'Platelets',
  },
];

type View = 'dashboard' | 'eligibility' | 'schedule' | 'success' | 'appointments';

const DonateBloodPage = () => {
  const [view, setView] = useState<View>('dashboard');
  const [appointmentDetails, setAppointmentDetails] = useState(null);

  const handleDonateClick = () => {
    setView('eligibility');
  };

  const handleViewAppointmentsClick = () => {
    setView('appointments');
  };

  const handleEligible = () => {
    setView('schedule');
  };

  const handleScheduleConfirm = (details: any) => {
    setAppointmentDetails(details);
    setView('success');
  };

  const handleHome = () => {
    setView('dashboard');
  };

  return (
    <div className="container mx-auto py-12">
      {view === 'dashboard' && (
        <Dashboard
          user={MOCK_USER}
          history={MOCK_HISTORY}
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
          onHome={handleHome}
          appointment={appointmentDetails}
        />
      )}
      {view === 'appointments' && (
        <AppointmentsView
          appointments={MOCK_APPOINTMENTS}
          onBack={() => setView('dashboard')}
          onReschedule={(appointment) => {
            console.log('Reschedule:', appointment);
          }}
          onViewTicket={(appointment) => {
            console.log('View Ticket:', appointment);
          }}
          onCancel={(appointment) => {
            console.log('Cancel:', appointment);
          }}
        />
      )}
    </div>
  );
};

export default DonateBloodPage;