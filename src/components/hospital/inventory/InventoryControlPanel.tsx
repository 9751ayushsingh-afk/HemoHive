'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Droplets } from 'lucide-react';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
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
      setValidationError(null);
    },
    onError: (error: any) => {
      setValidationError(error.message || 'Failed to validate blood unit.');
    }
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
        className="bg-gray-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl sticky top-8"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-1 pt-1 rounded-full bg-red-600" />
          <h2 className="text-3xl font-black text-white font-outfit uppercase tracking-tighter">Command Centre</h2>
        </div>

        {/* Add Bag Form */}
        <div className="mb-10 p-6 bg-white/5 rounded-3xl border border-white/10">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Add Units</h3>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="group relative w-full overflow-hidden bg-gradient-to-r from-red-600 to-red-800 text-white font-black py-4 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/20 active:scale-95 text-xs uppercase tracking-widest"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Droplets size={18} className="group-hover:animate-bounce" />
              Scan QR Code
            </button>
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-gray-600 text-[10px] font-black uppercase tracking-tighter">manual entry console</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            <div className="space-y-4">
              <div className="group relative">
                <input
                  type="text"
                  placeholder="Bag Identifier"
                  value={bagId}
                  onChange={e => setBagId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all placeholder:text-gray-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Group</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>

                <select
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="450">450ml</option>
                  <option value="350">350ml</option>
                  <option value="250">250ml</option>
                </select>
              </div>

              <div className="relative group">
                <div className="absolute top-0 left-5 -translate-y-1/2 bg-gray-900 px-2 text-[10px] font-black text-red-500 uppercase tracking-widest z-10">Expiry Date</div>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all [color-scheme:dark] cursor-pointer hover:border-red-500/30 font-medium"
                />
              </div>

              <button
                type="submit"
                className={`w-full font-black py-4 px-4 rounded-2xl shadow-xl transition-all duration-500 active:scale-95 text-xs uppercase tracking-widest ${!bagId || !bloodGroup || !quantity || !expiryDate || mutation.isPending
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                  : 'bg-white text-black hover:bg-red-500 hover:text-white shadow-red-500/20'
                  }`}
                disabled={!bagId || !bloodGroup || !quantity || !expiryDate || mutation.isPending}
              >
                {mutation.isPending ? 'Logging Unit...' : 'Confirm Record'}
              </button>
            </div>

          </form>
        </div>

        {/* Bulk & Filters */}
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 opacity-50">Master Controls</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="text-[10px] bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl border border-white/5 transition-all uppercase tracking-tight">Import Ledger</button>
              <button className="text-[10px] bg-red-950/20 hover:bg-red-950/40 text-red-500 font-black py-4 rounded-2xl border border-red-500/20 transition-all uppercase tracking-tight">Flush Expired</button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 opacity-50">Instant Filters</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Expiry (7d)', value: 'expiring_7d' },
                { label: 'Low Stock', value: 'low_stock_5' },
                { label: 'Active Pool', value: 'all' },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => handleFilterClick(f.value)}
                  className={`text-[10px] py-2.5 px-5 rounded-full font-black uppercase transition-all tracking-widest ${activeFilter === f.value
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/20 scale-105'
                    : 'bg-white/5 text-gray-500 hover:text-white border border-white/5'
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
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

      {mounted && createPortal(
        <AnimatePresence>
          {validationError && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={() => setValidationError(null)}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateX: -20 }}
                transition={{ type: "spring", damping: 20, stiffness: 200 }}
                className="relative w-full max-w-lg bg-red-950/80 border border-red-500/40 rounded-[2.5rem] p-10 overflow-hidden shadow-[0_0_100px_rgba(239,68,68,0.3)] perspective-1000"
              >
                {/* Background Glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/30 blur-[80px] -mt-20 -mr-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/20 blur-[80px] -mb-20 -ml-20 pointer-events-none" />

                {/* Scanline overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />

                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Hazard Icon */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-red-500 animate-ping rounded-full opacity-20" />
                    <div className="relative w-20 h-20 bg-red-500/10 border-2 border-red-500 rounded-full flex items-center justify-center backdrop-blur-md">
                      <span className="text-red-500 text-4xl font-black font-outfit drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">!</span>
                    </div>
                  </div>

                  {/* Headers */}
                  <div className="inline-block px-4 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full mb-4">
                    <span className="text-red-400 font-mono text-[10px] uppercase tracking-[0.3em] font-black">Command Rejected</span>
                  </div>
                  <h2 className="text-3xl font-black text-white font-outfit tracking-tighter mb-4 shadow-black drop-shadow-lg">
                    Validation Error
                  </h2>

                  {/* The actual error */}
                  <div className="bg-black/40 border border-white/5 p-4 rounded-2xl mb-8 w-full">
                    <p className="text-white/90 text-sm font-medium leading-relaxed font-mono">
                      <span className="text-red-500 mr-2">{'>'}</span> {validationError}
                    </p>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => setValidationError(null)}
                    className="group relative w-full overflow-hidden bg-gradient-to-r from-red-600 to-red-800 text-white font-black py-4 px-8 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/30 hover:scale-[1.02] active:scale-95 text-xs uppercase tracking-[0.2em]"
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative z-10">I will keep it in mind</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default InventoryControlPanel;