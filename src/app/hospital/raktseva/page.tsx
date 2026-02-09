
'use client';

import React from 'react';
import DonationRequestsTable from '../dashboard/components/DonationRequestsTable';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const RaktSevaPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/hospital/home" className="p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-600">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">RaktSeva</h1>
                        <p className="text-slate-500">Manage incoming blood donation requests and appointment history.</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-h-[600px]">
                    <DonationRequestsTable />
                </div>
            </div>
        </div>
    );
};

export default RaktSevaPage;
