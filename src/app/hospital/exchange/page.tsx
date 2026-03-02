import React from 'react';
import ExchangeTabs from '../../../components/hospital/hemoflux/ExchangeTabs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { redirect } from 'next/navigation';

const ExchangePage = async () => {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/auth/hospital/signin');
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-10 relative overflow-hidden">
            {/* Abstract animated background for God-Level aesthetic */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-900/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-12 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white font-headline">
                        HemoFlux Exchange
                    </h1>
                    <p className="text-white/60 mt-3 text-lg md:text-xl font-light">
                        Inter-Hospital Liquidity Engine. Acquire near-expiry units or list your own.
                    </p>

                    <div className="mt-6 inline-block p-4 bg-red-950/30 border border-red-500/20 rounded-xl text-sm text-red-200 backdrop-blur-md">
                        <strong className="text-red-400">Security Protocol:</strong> All transfers are subject to the <span className="text-white font-bold tracking-wider">One-Hop Rule</span>. Once claimed, a unit is locked to your inventory.
                    </div>
                </div>

                <ExchangeTabs />
            </div>
        </div>
    );
};
export default ExchangePage;
