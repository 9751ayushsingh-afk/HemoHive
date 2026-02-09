import React from 'react';
import ExchangePool from '@/components/hospital/hemoflux/ExchangePool';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

const ExchangePage = async () => {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/auth/hospital/signin');
    }

    return (
        <div className="min-h-screen bg-neutral-50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900">HemoFlux Exchange</h1>
                    <p className="text-neutral-500 mt-2">
                        Inter-Hospital Liquidity Engine. Acquire near-expiry units or list your own to reduce wastage.
                    </p>

                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                        <strong>Note:</strong> All transfers are subject to the <strong>One-Hop Rule</strong>. Once you claim a unit, it is locked to your inventory and cannot be re-exchanged.
                    </div>
                </div>

                <ExchangePool />
            </div>
        </div>
    );
};

export default ExchangePage;
