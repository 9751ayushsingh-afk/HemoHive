import React from 'react';
import { Lock } from 'lucide-react';

interface LockedFeatureProps {
    title: string;
}

const LockedFeature: React.FC<LockedFeatureProps> = ({ title }) => {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center shadow-sm">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center py-6">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-slate-500 shadow-inner">
                    <Lock size={32} />
                </div>

                <h3 className="mb-2 text-xl font-bold text-slate-900">{title} Locked</h3>
                <p className="max-w-md text-slate-500">
                    This feature is available exclusively for active donors.
                    <br className="hidden sm:block" />
                    <span className="font-semibold text-red-600">Complete at least 1 blood donation</span> to unlock {title.toLowerCase()} and start saving lives.
                </p>
            </div>
        </div>
    );
};

export default LockedFeature;
