'use client';
import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import BloodGroupCard from '../../components/hospital/inventory/BloodGroupCard';
import InventoryControlPanel from '../../components/hospital/inventory/InventoryControlPanel';
import AnimatedChartsPanel from '../../components/hospital/inventory/AnimatedChartsPanel';
import BagListModal from '../../components/hospital/inventory/BagListModal';
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
    return <div className="min-h-screen bg-gray-900 text-white p-8">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-900 text-white p-8">Error: {error.message}</div>;
  }

  const summary = data?.summary ? data.summary.reduce((acc: any, item: any) => {
    acc[item.bloodGroup] = item.quantity;
    return acc;
  }, {}) : {};

  let bloodGroups = data?.summary ? Object.keys(summary)
    .map(key => ({
      bloodGroup: key,
      units: summary[key],
      status: summary[key] < 5 ? 'low' : 'ok',
      expiringSoon: 0,
    })) : [];

  let bagsForModal = data?.bags || [];

  if (activeFilter && activeFilter !== 'all') {
    if (activeFilter === 'low_stock_5') {
      bloodGroups = bloodGroups.filter(group => group.units < 5);
    } else if (activeFilter === 'expiring_7d') {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const expiringGroupUnits: { [key: string]: number } = {};

      const expiringBags = bagsForModal.filter((bag: IBloodBag) => {
        if (!bag.expiryDate) return false;
        const expiry = new Date(bag.expiryDate);
        const isExpiring = expiry <= sevenDaysFromNow && expiry > new Date();
        if (isExpiring) {
          expiringGroupUnits[bag.bloodGroup] = (expiringGroupUnits[bag.bloodGroup] || 0) + 1;
        }
        return isExpiring;
      });

      bagsForModal = expiringBags;

      const expiringGroups = Object.keys(expiringGroupUnits);
      bloodGroups = bloodGroups
        .filter(group => expiringGroups.includes(group.bloodGroup))
        .map(group => ({ ...group, units: expiringGroupUnits[group.bloodGroup] }));
    }
  }


  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">Inventory Management</h1>
          <p className="text-gray-400">Real-time view of your blood bank inventory.</p>
        </header>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bloodGroups.map(group => (
              <BloodGroupCard
                key={group.bloodGroup}
                {...group}
                onClick={() => setSelectedGroup(group.bloodGroup)}
              />
            ))}
          </div>
          <div className="lg:w-1/3 flex flex-col gap-8">
            <InventoryControlPanel onFilterChange={handleFilterChange} />
            <AnimatedChartsPanel summary={summary} />
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