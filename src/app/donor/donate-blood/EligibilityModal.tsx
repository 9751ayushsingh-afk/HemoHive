import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, ArrowRight } from './Icons';

interface EligibilityModalProps {
  onClose: () => void;
  onEligible: () => void;
}

const EligibilityModal: React.FC<EligibilityModalProps> = ({ onClose, onEligible }) => {
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    lastDonation: '',
    hemoglobin: ''
  });
  const [status, setStatus] = useState<'idle' | 'eligible' | 'not-eligible'>('idle');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setStatus('idle'); // Reset status on edit
  };

  const checkEligibility = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const age = parseInt(formData.age);
      const weight = parseInt(formData.weight);
      const hb = parseFloat(formData.hemoglobin);
      
      // Simple logic based on specs
      const isEligible = 
        (age >= 18 && age <= 65) &&
        (weight >= 50) &&
        (hb >= 12.5);
      
      setStatus(isEligible ? 'eligible' : 'not-eligible');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-slate-900">Eligibility Check</h2>
        <p className="text-slate-500 mb-6">पात्रता जाँचें</p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Age (Years)</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g. 25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g. 65"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hemoglobin (g/dL)</label>
            <input
              type="number"
              step="0.1"
              name="hemoglobin"
              value={formData.hemoglobin}
              onChange={handleChange}
              className="w-full border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="e.g. 13.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Days since last whole blood donation</label>
            <input
              type="number"
              name="lastDonation"
              value={formData.lastDonation}
              onChange={handleChange}
              className="w-full border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="e.g. 95 (Leave 0 if first time)"
            />
          </div>
        </div>

        {status === 'eligible' && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex gap-3 animate-fade-in">
            <CheckCircle className="text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-800">You are eligible to donate blood.</p>
              <p className="text-green-700 text-sm">आप रक्तदान करने के लिए पात्र हैं।</p>
            </div>
          </div>
        )}

        {status === 'not-eligible' && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 animate-fade-in">
            <AlertCircle className="text-red-600 shrink-0" />
            <div>
              <p className="font-semibold text-red-800">You are not eligible right now.</p>
              <p className="text-red-700 text-sm">आप अभी पात्र नहीं हैं।</p>
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-3">
          {status !== 'eligible' ? (
            <button
              onClick={checkEligibility}
              disabled={loading}
              className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check Status'}
            </button>
          ) : (
            <button
              onClick={onEligible}
              className="w-full bg-red-600 text-white font-semibold py-3.5 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <span>Schedule Donation</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EligibilityModal;