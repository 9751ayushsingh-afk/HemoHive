import React from 'react';
import { CheckCircle, Heart, Calendar, MapPin } from './Icons';
import { QRCodeSVG } from 'qrcode.react';

interface SuccessViewProps {
  onHome: () => void;
  appointment: any;
  isViewOnly?: boolean;
}

const SuccessView: React.FC<SuccessViewProps> = ({ onHome, appointment, isViewOnly = false }) => {
  return (
    <div className="max-w-md mx-auto text-center py-10 animate-fade-in">
      {!isViewOnly && (
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-sm">
          <CheckCircle size={48} />
        </div>
      )}

      <h1 className="text-3xl font-bold text-slate-900 mb-2">{isViewOnly ? "Donation Ticket" : "Booking Confirmed!"}</h1>
      <h2 className="text-xl text-slate-600 font-medium mb-6">{isViewOnly ? "View Ticket Details" : "अपॉइंटमेंट कन्फर्म करें"}</h2>

      {!isViewOnly && (
        <p className="text-slate-500 mb-8">
          Thank you for choosing to save a life. <br />
          Your appointment details have been sent via SMS.
        </p>
      )}

      {/* Ticket / Pass */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden mb-8 text-left">
        <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
          <span className="font-bold tracking-wide">DONATION PASS</span>
          <span className="bg-white/20 text-xs px-2 py-1 rounded">#{appointment.qrCode || 'PENDING'}</span>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-red-50 p-2 rounded-lg text-red-600">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold">Date & Time</p>
              <p className="font-semibold text-slate-900">{appointment.date} • {appointment.timeSlot}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-red-50 p-2 rounded-lg text-red-600">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold">Location</p>
              <p className="font-semibold text-slate-900">
                Center: {appointment.centerName || appointment.center || 'Unknown Center'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-red-50 p-2 rounded-lg text-red-600">
              <Heart size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold">Donation Type</p>
              <p className="font-semibold text-slate-900">{appointment.donationType || appointment.type || 'Whole Blood'}</p>
            </div>
          </div>
        </div>

        {/* QR Code area */}
        <div className="border-t border-dashed border-slate-200 p-6 flex flex-col items-center justify-center bg-slate-50">
          <div className="bg-white p-2 border border-slate-200 rounded-lg shadow-sm mb-3">
            <QRCodeSVG value={appointment.qrCode || 'PENDING'} size={128} />
          </div>
          <p className="text-xs text-slate-400 font-medium">Scan at center to verify</p>
        </div>
      </div>

      <button
        onClick={onHome}
        className="text-slate-600 font-semibold hover:text-slate-900 transition-colors"
      >
        Return to Dashboard
      </button>
    </div>
  );
};

export default SuccessView;