'use client';
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import QrScannerModal from './QrScannerModal';

const addBloodBag = async (newItem: any) => {
  console.log('Adding blood bag:', newItem);
  const res = await fetch('/api/inventory/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items: [newItem] }),
  });
  console.log('API response status:', res.status);
  const results = await res.json();
  console.log('API response body:', results);
  if (results.failed && results.failed.length > 0) {
    console.error('Add failed:', results.failed[0].reason);
    throw new Error(results.failed[0].reason);
  }
  return results;
};

const InventoryControlPanel = ({ onFilterChange }: { onFilterChange: (filter: string | null) => void }) => {
  const queryClient = useQueryClient();
  const [bagId, setBagId] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [quantity, setQuantity] = useState('450'); // Default to 450ml
  const [expiryDate, setExpiryDate] = useState('');
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: addBloodBag,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setBagId('');
      setBloodGroup('');
      setQuantity('450');
      setExpiryDate('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (expiryDate) {
      const today = new Date();
      const expiry = new Date(expiryDate);
      // Reset time part of today for accurate date comparison
      today.setHours(0, 0, 0, 0);

      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      oneYearFromNow.setHours(0, 0, 0, 0);

      if (expiry > oneYearFromNow) {
        setValidationError("Expiry date cannot be more than one year from the date of entry.");
        return;
      }
    }

    setValidationError(null);
    setValidationError(null);
    mutation.mutate({ bagId, bloodGroup, quantity: parseInt(quantity), expiryDate });
  };

  const handleScanSuccess = useCallback((decodedText: string) => {
    // Assuming QR code text is a JSON string with bagId, bloodGroup, expiryDate
    try {
      const data = JSON.parse(decodedText);
      setBagId(data.bagId || '');
      setBloodGroup(data.bloodGroup || '');
      setExpiryDate(data.expiryDate || '');
    } catch (error) {
      console.error("Failed to parse QR code data", error);
      // Handle invalid QR code format
    }
    setScannerOpen(false);
  }, []);

  const handleFilterClick = (filter: string) => {
    const newFilter = activeFilter === filter ? null : filter;
    setActiveFilter(newFilter);
    onFilterChange(newFilter);
  };

  return (
    <>
      <motion.div
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold mb-4">Control Panel</h2>

        {/* Add Bag Form */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Add New Bag</h3>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <button type="button" onClick={() => setScannerOpen(true)} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Scan QR Code
            </button>
            <div className="text-center text-gray-400 text-sm">OR</div>
            <input type="text" placeholder="Enter Bag ID" value={bagId} onChange={e => setBagId(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
            <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="">Select Blood Group</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
            <select value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="450">450 ml (Standard)</option>
              <option value="350">350 ml (Low Weight)</option>
              <option value="250">250 ml (Pediatric)</option>
            </select>
            <input type="date" placeholder="Expiry Date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" disabled={mutation.isPending}>
              {mutation.isPending ? 'Adding...' : 'Add Bag'}
            </button>
            {validationError && <p className="text-red-500 text-sm">{validationError}</p>}
            {mutation.isError && <p className="text-red-500 text-sm">Error: {mutation.error.message}</p>}
          </form>
        </div>

        {/* Bulk Actions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Bulk Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Bulk Import (CSV)</button>
            <button className="w-full text-sm bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">Delete Expired</button>
          </div>
        </div>

        {/* Quick Filters */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Quick Filters</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleFilterClick('expiring_7d')} className={`text-xs ${activeFilter === 'expiring_7d' ? 'bg-red-600' : 'bg-gray-700'} hover:bg-gray-600 text-white font-bold py-1 px-3 rounded-full`}>Expiring in 7d</button>
            <button onClick={() => handleFilterClick('low_stock_5')} className={`text-xs ${activeFilter === 'low_stock_5' ? 'bg-red-600' : 'bg-gray-700'} hover:bg-gray-600 text-white font-bold py-1 px-3 rounded-full`}>Low Stock &lt; 5</button>
            <button onClick={() => handleFilterClick('all')} className={`text-xs ${activeFilter === 'all' ? 'bg-red-600' : 'bg-gray-700'} hover:bg-gray-600 text-white font-bold py-1 px-3 rounded-full`}>All Available</button>
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {isScannerOpen && (
          <QrScannerModal
            onClose={() => setScannerOpen(false)}
            onScanSuccess={handleScanSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default InventoryControlPanel;