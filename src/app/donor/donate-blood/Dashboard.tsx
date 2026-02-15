import React from 'react';
import { UserProfile, DonationHistoryItem } from '../types';
import { Heart, Calendar, Droplet, Clock, MapPin } from './Icons';
import DonationChart from './DonationChart';

interface DashboardProps {
  user: UserProfile;
  history: DonationHistoryItem[];
  onDonateClick: () => void;
  onViewAppointmentsClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, history, onDonateClick, onViewAppointmentsClick }) => {
  const isEligible = new Date() > new Date(user.nextEligibleDate);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Card */}
      <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.01]">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-20 animate-pulse">
          <Heart size={200} fill="currentColor" />
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-1">Donate Blood</h1>
          <h2 className="text-xl font-medium opacity-90 mb-2">रक्तदान करें</h2>
          <p className="text-red-100 mb-6 max-w-xs">
            Check eligibility & schedule your donation<br />
            <span className="text-sm opacity-80">अपनी पात्रता जांचें और दान शेड्यूल करें</span>
          </p>
          <div className="flex space-x-4">
            <button
              onClick={isEligible ? onDonateClick : undefined}
              disabled={!isEligible}
              className={`font-bold py-3 px-8 rounded-full shadow-lg transition-all flex items-center gap-2 ${isEligible
                ? "bg-white text-red-600 hover:bg-red-50 hover:scale-105 active:scale-95 cursor-pointer"
                : "bg-red-800/50 text-white/50 cursor-not-allowed scale-100 shadow-none border border-red-500/30"
                }`}
            >
              <Heart size={20} className={isEligible ? "animate-pulse" : ""} />
              <span>{isEligible ? "Donate Now / अभी रक्तदान करें" : `Next: ${user.nextEligibleDate}`}</span>
            </button>
            <button
              onClick={onViewAppointmentsClick}
              className="bg-white text-red-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-red-50 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Calendar size={20} />
              <span>View Appointments</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Blood Group */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-red-100 group cursor-default">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:bg-red-200">
            <Droplet size={20} />
          </div>
          <p className="text-xs text-slate-500 uppercase font-semibold">Blood Group</p>
          <p className="text-xl font-bold text-slate-800">{user.bloodGroup}</p>
        </div>

        {/* Last Donation */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-100 group cursor-default">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-200">
            <Clock size={20} />
          </div>
          <p className="text-xs text-slate-500 uppercase font-semibold">Last Donation</p>
          <p className="text-lg font-bold text-slate-800">{user.lastDonationDate}</p>
        </div>

        {/* Status */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-green-100 group cursor-default">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-transform duration-300 group-hover:scale-110 ${isEligible ? 'bg-green-100 text-green-600 group-hover:bg-green-200' : 'bg-orange-100 text-orange-600 group-hover:bg-orange-200'}`}>
            {isEligible ? <CheckCircle size={20} /> : <Clock size={20} />}
          </div>
          <p className="text-xs text-slate-500 uppercase font-semibold">Status</p>
          <p className={`text-lg font-bold ${isEligible ? 'text-green-600' : 'text-orange-600'}`}>
            {isEligible ? 'Eligible' : 'Wait'}
          </p>
        </div>

        {/* Total Donations */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-purple-100 group cursor-default">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:bg-purple-200">
            <Heart size={20} />
          </div>
          <p className="text-xs text-slate-500 uppercase font-semibold">Total Donations</p>
          <p className="text-xl font-bold text-slate-800">{user.totalDonations}</p>
        </div>
      </div>

      {/* Next Eligible Date Info */}
      {!isEligible && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3 transition-all duration-300 hover:shadow-md hover:bg-orange-100">
          <Clock className="text-orange-500 shrink-0 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-orange-800">Next Eligible Date</h3>
            <p className="text-orange-700 text-sm">
              You can donate again on <strong>{user.nextEligibleDate}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Donation Trends Chart */}
      <DonationChart history={history} />

      {/* Donation History List */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4 px-1">Donation History (रक्तदान इतिहास)</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {history.length > 0 ? (
            history.map((item, index) => (
              <div
                key={item.id}
                className={`p-4 flex items-center justify-between ${index !== history.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50 transition-colors group cursor-default`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
                    <Droplet size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{item.type}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={12} /> {item.center}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{new Date(item.date).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-500 mb-1">{item.amount}</p>
                  {/* Status Badge */}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${item.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' :
                    item.status === 'cancelled' ? 'bg-slate-50 text-slate-500 border-slate-200' :
                      'bg-blue-50 text-blue-700 border-blue-100' // pending/scheduled
                    }`}>
                    {item.status || 'Pending'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">
              <p>No donation history found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// @ts-ignore
import { CheckCircle } from './Icons';
export default Dashboard;