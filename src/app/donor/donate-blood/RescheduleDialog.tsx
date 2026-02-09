import React from 'react';
import { X, Calendar, Clock } from './Icons';

interface RescheduleDialogProps {
    onClose: () => void;
}

const RescheduleDialog: React.FC<RescheduleDialogProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl relative text-center">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar size={32} />
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-2">Coming Soon!</h2>
                <h3 className="text-lg text-slate-600 font-medium mb-4">जल्द आ रहा है</h3>

                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                    We are building a seamless rescheduling experience for you.
                    <br />
                    For now, please cancel your existing appointment and book a new one.
                </p>

                <button
                    onClick={onClose}
                    className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                    Got it
                </button>
            </div>
        </div>
    );
};

export default RescheduleDialog;
