'use client';
import React, { useState } from 'react';
import ExchangePool from './ExchangePool';
import MyListings from './MyListings';
import TransitTracker from './TransitTracker';
import { motion, AnimatePresence } from 'framer-motion';

const ExchangeTabs = () => {
    const [activeTab, setActiveTab] = useState<'MARKET' | 'LISTINGS' | 'TRANSIT'>('MARKET');

    return (
        <div className="w-full">
            {/* Dark Glassmorphism Navigation */}
            <div className="bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 mb-8 flex flex-col sm:flex-row gap-2 sticky top-4 z-40 shadow-2xl">
                {[
                    { id: 'MARKET', label: 'Market Pool', icon: '🛒' },
                    { id: 'LISTINGS', label: 'My Listings', icon: '📋' },
                    { id: 'TRANSIT', label: 'In Transit', icon: '🚚' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`relative flex-1 py-3 px-6 rounded-xl font-bold text-sm tracking-wide transition-all overflow-hidden ${activeTab === tab.id
                                ? 'text-white shadow-[0_0_20px_rgba(255,0,0,0.3)]'
                                : 'text-white/50 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabBg"
                                className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 rounded-xl"
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <span>{tab.icon}</span>
                            {tab.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content Area with smooth transitions */}
            <div className="relative min-h-[500px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="w-full"
                    >
                        {activeTab === 'MARKET' && <ExchangePool />}
                        {activeTab === 'LISTINGS' && <MyListings />}
                        {activeTab === 'TRANSIT' && <TransitTracker />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ExchangeTabs;
