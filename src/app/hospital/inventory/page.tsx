'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Droplets } from 'lucide-react';
import HolographicBloodBag from '@/components/hospital/inventory/HolographicBloodBag';
import PremiumInventoryHeader from '@/components/hospital/inventory/PremiumInventoryHeader';
import InventoryControlPanel from '@/components/hospital/inventory/InventoryControlPanel';
import AnimatedChartsPanel from '@/components/hospital/inventory/AnimatedChartsPanel';
import BagListModal from '@/components/hospital/inventory/BagListModal';
import { IBloodBag } from '@/models/BloodBag';

const fetchInventory = async () => {
  const res = await fetch('/api/inventory');
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Access Denied. Please log in.');
    }
    throw new Error('Network response was not ok');
  }
  return res.json();
};

const InventoryPage = () => {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const { data, error, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: fetchInventory,
    retry: false,
  });

  const handleFilterChange = (filter: string | null) => {
    setActiveFilter(filter);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-red-500/10 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] text-center max-w-md">
          <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-white mb-2 font-outfit">System Access Error</h2>
          <p className="text-gray-400 mb-6">{error.message}</p>
          <button onClick={() => window.location.reload()} className="bg-white text-black font-bold py-3 px-8 rounded-2xl uppercase text-xs tracking-widest">Retry Connection</button>
        </div>
      </div>
    );
  }

  const summary = data?.summary ? data.summary.reduce((acc: any, item: any) => {
    acc[item.bloodGroup] = item.quantity;
    return acc;
  }, {}) : {};

  let bloodGroups = data?.summary ? Object.keys(summary)
    .sort()
    .map(key => ({
      bloodGroup: key,
      units: summary[key],
      status: summary[key] < 5 ? 'low' : 'ok',
      expiringSoon: 0,
    })) : [];

  let bagsForModal = data?.bags || [];

  // Re-calculate expiring soon counts for bags
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  bloodGroups = bloodGroups.map(group => {
    const expiringInGroup = bagsForModal.filter((bag: IBloodBag) => {
      if (bag.bloodGroup !== group.bloodGroup || !bag.expiryDate) return false;
      const expiry = new Date(bag.expiryDate);
      return expiry <= sevenDaysFromNow && expiry > new Date();
    }).length;
    return { ...group, expiringSoon: expiringInGroup };
  });

  if (activeFilter && activeFilter !== 'all') {
    if (activeFilter === 'low_stock_5') {
      bloodGroups = bloodGroups.filter(group => group.units < 5);
    } else if (activeFilter === 'expiring_7d') {
      bloodGroups = bloodGroups.filter(group => group.expiringSoon > 0);
    }
  }

  const totalUnits = data?.summary?.reduce((acc: number, curr: any) => acc + curr.quantity, 0) || 0;
  const lowStockCount = bloodGroups.filter(g => g.units < 5).length;
  const expiringCount = data?.bags?.filter((bag: IBloodBag) => {
    if (!bag.expiryDate) return false;
    return new Date(bag.expiryDate) <= sevenDaysFromNow && new Date(bag.expiryDate) > new Date();
  }).length || 0;

  return (
    <>
      <div className="min-h-screen p-1">
        <PremiumInventoryHeader
          totalUnits={totalUnits}
          lowStockCount={lowStockCount}
          expiringCount={expiringCount}
        />

        <div className="flex flex-col xl:flex-row gap-10">
          <div className="xl:flex-grow order-2 xl:order-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
              {bloodGroups.length > 0 ? (
                bloodGroups.map((group, i) => (
                  <motion.div
                    key={group.bloodGroup}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <HolographicBloodBag
                      {...group}
                      onClick={() => setSelectedGroup(group.bloodGroup)}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <Droplets className="mx-auto text-gray-700 mb-4" size={64} />
                  <h3 className="text-xl font-bold text-gray-400">No Groups Match Filter</h3>
                </div>
              )}
            </div>
          </div>

          <div className="xl:w-[420px] flex flex-col gap-10 order-1 xl:order-2">
            <InventoryControlPanel onFilterChange={handleFilterChange} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-1 rounded-full bg-red-600" />
                <h3 className="text-2xl font-black text-white font-outfit uppercase tracking-tighter">Volume Intelligence</h3>
              </div>
              <AnimatedChartsPanel summary={summary} />
            </motion.div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {selectedGroup && (
          <BagListModal
            bloodGroup={selectedGroup}
            onClose={() => setSelectedGroup(null)}
            bags={bagsForModal.filter((bag: IBloodBag) => bag.bloodGroup === selectedGroup)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default InventoryPage;