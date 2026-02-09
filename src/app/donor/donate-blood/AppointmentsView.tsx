import React from 'react';
import { Appointment } from '../types';
import { MOCK_CENTERS } from '../constants';
import { Calendar, Clock, MapPin, ArrowRight, CheckCircle, X, AlertCircle } from './Icons';

interface AppointmentsViewProps {
  appointments: Appointment[];
  onBack: () => void;
  onReschedule: (appointment: Appointment) => void;
  onViewTicket: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
}

const AppointmentsView: React.FC<AppointmentsViewProps> = ({ appointments, onBack, onReschedule, onViewTicket, onCancel }) => {
  // Sort appointments: Active (pending/confirmed) first, then by date descending
  const sortedAppointments = [...appointments].sort((a, b) => {
    const isActiveA = a.status === 'pending' || a.status === 'confirmed' || a.status === 'scheduled';
    const isActiveB = b.status === 'pending' || b.status === 'confirmed' || b.status === 'scheduled';
    if (isActiveA && !isActiveB) return -1;
    if (!isActiveA && isActiveB) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const upcoming = sortedAppointments.filter(a => ['pending', 'confirmed', 'scheduled'].includes(a.status));
  const past = sortedAppointments.filter(a => !['pending', 'confirmed', 'scheduled'].includes(a.status));

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
            <Clock size={12} /> Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
            <Clock size={12} /> Pending Approval
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
            <CheckCircle size={12} /> Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-500 border border-slate-200">
            <X size={12} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-500 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const AppointmentCard = ({ appt }: { appt: Appointment }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-slate-300 group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <StatusBadge status={appt.status} />
          <h3 className="font-bold text-slate-900 mt-2 text-lg group-hover:text-red-600 transition-colors">{appt.donationType}</h3>
          <p className="text-sm text-slate-500">{appt.centerName || 'Unknown Center'}</p>
        </div>
        <div className="text-right">
          <div className="bg-slate-50 p-2 rounded-lg text-center min-w-[60px] group-hover:bg-red-50 transition-colors">
            <p className="text-xs text-slate-500 font-bold uppercase group-hover:text-red-500">{new Date(appt.date).toLocaleString('default', { month: 'short' })}</p>
            <p className="text-xl font-bold text-slate-900 group-hover:text-red-700">{new Date(appt.date).getDate()}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-600 border-t border-slate-50 pt-4">
        <div className="flex items-center gap-1.5">
          <Clock size={16} className="text-slate-400" />
          {appt.timeSlot}
        </div>
        {appt.pickupRequired && (
          <div className="flex items-center gap-1.5 text-blue-600">
            <MapPin size={16} />
            Pickup Requested
          </div>
        )}
      </div>

      {(appt.status === 'scheduled' || appt.status === 'pending' || appt.status === 'confirmed') && (
        <div className="mt-4 pt-3 border-t border-slate-50 flex gap-2">
          {appt.status !== 'confirmed' && (
            <button
              onClick={() => onReschedule(appt)}
              className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-2 rounded-lg text-sm hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              Reschedule
            </button>
          )}
          {appt.status === 'pending' && (
            <button
              onClick={() => onCancel(appt)}
              className="flex-1 bg-white border border-red-200 text-red-600 font-semibold py-2 rounded-lg text-sm hover:bg-red-50 hover:border-red-300 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => onViewTicket(appt)}
            className="flex-1 bg-red-600 text-white font-semibold py-2 rounded-lg text-sm hover:bg-red-700 transition-colors shadow-sm"
          >
            View Ticket
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-fade-in max-w-2xl mx-auto pb-10">
      <div className="flex items-center gap-3 mb-6 sticky top-0 bg-slate-50 py-4 z-10">
        <button onClick={onBack} className="bg-white p-2 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all">
          <ArrowRight className="rotate-180" size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Appointments</h2>
          <p className="text-xs text-slate-500 font-medium">Manage your donation schedule</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Upcoming Section */}
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Upcoming
          </h3>
          {upcoming.length > 0 ? (
            <div className="space-y-4">
              {upcoming.map(appt => <AppointmentCard key={appt.id} appt={appt} />)}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center">
              <Calendar className="mx-auto text-slate-300 mb-2" size={32} />
              <p className="text-slate-500">No upcoming appointments.</p>
            </div>
          )}
        </div>

        {/* Past Section */}
        {past.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
              Past
            </h3>
            <div className="space-y-4 opacity-90">
              {past.map(appt => <AppointmentCard key={appt.id} appt={appt} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsView;