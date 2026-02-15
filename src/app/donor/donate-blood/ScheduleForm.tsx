import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, ShieldCheck, ArrowRight } from './Icons';

const DONATION_TYPES = ['Whole Blood', 'Plasma', 'Platelets'];

const TIME_SLOTS = [
  '09:00 AM – 10:00 AM',
  '10:00 AM – 11:00 AM',
  '11:00 AM – 12:00 PM',
  '01:00 PM – 02:00 PM',
  '02:00 PM – 03:00 PM',
  '03:00 PM – 04:00 PM',
];

interface ScheduleFormProps {
  onBack: () => void;
  onConfirm: (details: any) => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ onBack, onConfirm }) => {
  const [centers, setCenters] = useState<any[]>([]);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: DONATION_TYPES[0],
    date: '',
    timeSlot: TIME_SLOTS[0],
    center: '',
    pickup: false
  });

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const res = await fetch('/api/donations/centers');
        const data = await res.json();
        setCenters(data);
        if (data.length > 0) {
          setForm(prev => ({ ...prev, center: data[0].id }));
        }
      } catch (err) {
        console.error("Failed to fetch centers", err);
      }
    };
    fetchCenters();
  }, []);

  const handleVerifyAadhaar = () => {
    setVerifying(true);
    setTimeout(() => {
      setAadhaarVerified(true);
      setVerifying(false);
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aadhaarVerified) {
      alert("Please verify Aadhaar first");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/donations/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donation_type: form.type,
          center_id: form.center,
          date: form.date,
          time_slot: form.timeSlot,
          pickup_required: form.pickup
        }),
      });

      const result = await response.json();

      if (response.ok) {
        onConfirm({
          id: result.appointment_id,
          donationType: form.type,
          centerName: centers.find(c => c.id === form.center)?.name || 'Unknown Center',
          date: form.date,
          timeSlot: form.timeSlot,
          status: 'pending',
          qrCode: result.qr_code,
          pickupRequired: form.pickup
        });
      } else if (response.status === 401) {
        alert('You must be logged in to schedule an appointment.');
        // Redirect to login
        window.location.href = '/login?callbackUrl=/donor/donate-blood';
      } else {
        alert(result.message || 'Failed to schedule');
      }
    } catch (err) {
      console.error("Scheduling error", err);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 text-sm font-medium">
          &larr; Back
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Schedule Donation</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Donation Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Donation Type</label>
            <div className="grid grid-cols-3 gap-3">
              {DONATION_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, type })}
                  className={`py-3 px-2 rounded-xl text-sm font-medium border transition-all ${form.type === type
                    ? 'bg-red-50 border-red-500 text-red-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-red-200'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                />
                <Calendar className="absolute left-3 top-3.5 text-slate-400" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Time Slot</label>
              <div className="relative">
                <select
                  value={form.timeSlot}
                  onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none appearance-none bg-white"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
                <Clock className="absolute left-3 top-3.5 text-slate-400" size={18} />
              </div>
            </div>
          </div>

          {/* Center Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Center</label>
            <div className="space-y-3">
              {centers.length === 0 ? <p className="text-sm text-slate-400">Loading centers...</p> :
                centers.map((center) => (
                  <div
                    key={center.id}
                    onClick={() => setForm({ ...form, center: center.id })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${form.center === center.id
                      ? 'bg-slate-50 border-slate-900 shadow-sm'
                      : 'border-slate-200 hover:border-slate-400'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 p-1.5 rounded-full ${form.center === center.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <MapPin size={16} />
                      </div>
                      <div>
                        <h4 className={`font-semibold ${form.center === center.id ? 'text-slate-900' : 'text-slate-700'}`}>{center.name}</h4>
                        <p className="text-sm text-slate-500">{center.address}</p>
                      </div>
                    </div>
                    {center.distance && <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-600">{center.distance}</span>}
                  </div>
                ))}
            </div>
          </div>

          {/* Pickup Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="font-semibold text-slate-900">Request Pickup</p>
              <p className="text-xs text-slate-500">Free transport for donors within 5km</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={form.pickup}
                onChange={(e) => setForm({ ...form, pickup: e.target.checked })}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {/* Aadhaar Verification */}
          <div className={`p-4 rounded-xl border transition-colors ${aadhaarVerified ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className={aadhaarVerified ? "text-green-600" : "text-blue-600"} size={20} />
                <h3 className={`font-semibold ${aadhaarVerified ? "text-green-800" : "text-blue-800"}`}>
                  {aadhaarVerified ? "Identity Verified" : "Identity Verification"}
                </h3>
              </div>
              {!aadhaarVerified && (
                <button
                  type="button"
                  onClick={handleVerifyAadhaar}
                  disabled={verifying}
                  className="text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-70"
                >
                  {verifying ? 'Verifying...' : 'Verify Aadhaar'}
                </button>
              )}
            </div>
            <p className={`text-sm ${aadhaarVerified ? "text-green-700" : "text-blue-700"}`}>
              {aadhaarVerified
                ? "Your Aadhaar has been successfully verified. You are ready to book."
                : "Required for booking. Please verify your Aadhaar (आधार सत्यापन)."}
            </p>
          </div>

          <button
            type="submit"
            disabled={!aadhaarVerified}
            className="w-full bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'Confirming...' : 'Confirm Appointment'}
            <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScheduleForm;