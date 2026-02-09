'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, Truck, AlertCircle, CheckCircle, Receipt, Calendar, User, Phone, Shield, CreditCard, ArrowRight, ExternalLink } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-hot-toast';

interface InvoiceData {
  invoiceId: string;
  customer: {
    name: string;
    aadhaarLast4: string;
    contact: string;
    bloodType: string;
    location: string;
  };
  fees: {
    processing: number;
    delivery: number;
    deposit: number;
  };
  deliveryType: string;
  distance: string;
  estimatedTime: string;
  refundPolicy: {
    percentage: number;
    amount: number;
    retained: number;
  };
  returnDeadline: number;
  paymentStatus: 'Pending' | 'Completed' | 'Failed';
}

const fetchInvoiceData = async (requestId: string): Promise<InvoiceData> => {
  const res = await fetch(`/api/donor/invoice/${requestId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch invoice data');
  }
  return res.json();
};

const HemoHiveInvoice = () => {
  const params = useParams();
  const { requestId } = params;

  const { data: invoiceData, isLoading, isError } = useQuery<InvoiceData, Error>({
    queryKey: ['invoice', requestId],
    queryFn: () => fetchInvoiceData(requestId as string),
    enabled: !!requestId, // Only run query if requestId is available
  });

  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const invoiceContentRef = useRef<HTMLDivElement>(null); // Add this line
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Entrance animation
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  // Update current date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // [FIX] Restore Delivery State on Load
  useEffect(() => {
    if (invoiceData && (invoiceData as any).activeDelivery) {
      const ad = (invoiceData as any).activeDelivery;
      setDeliveryId(ad.id);
      if (ad.status === 'SEARCHING') {
        setIsSearchingDriver(true);
        setDeliveryAssigned(false);
        // We might need to fetch the deadline if it's searching, but for now just showing "Searching" is better than nothing
      } else {
        setIsSearchingDriver(false);
        setDeliveryAssigned(true);
      }
    }
  }, [invoiceData]);

  // Generate QR Code with better styling
  useEffect(() => {
    if (qrRef.current && invoiceData) {
      qrRef.current.innerHTML = '';
      const size = 160;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background with gradient effect
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);

      // Decorative pattern (replace with actual QR code rendering)
      ctx.fillStyle = '#C00029';
      const cellSize = 10;
      for (let i = 1; i < 15; i++) {
        for (let j = 1; j < 15; j++) {
          if ((i + j) % 3 !== 0) {
            ctx.fillRect(i * cellSize + 5, j * cellSize + 5, cellSize - 2, cellSize - 2);
          }
        }
      }

      // Corner markers
      const drawCorner = (x: number, y: number) => {
        ctx.fillStyle = '#C00029';
        ctx.fillRect(x, y, 30, 30);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 5, y + 5, 20, 20);
        ctx.fillStyle = '#C00029';
        ctx.fillRect(x + 10, y + 10, 10, 10);
      };

      drawCorner(5, 5);
      drawCorner(size - 35, 5);
      drawCorner(5, size - 35);

      canvas.className = 'rounded-lg shadow-lg';
      qrRef.current.appendChild(canvas);
    }
  }, [invoiceData]); // Re-run if invoiceData changes

  const downloadPDF = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 150);

    if (!invoiceContentRef.current) {
      alert('Error: Invoice content not found for PDF generation.');
      return;
    }

    alert('📄 Generating PDF...\nThis may take a moment.');

    try {
      const canvas = await html2canvas(invoiceContentRef.current, { scale: 2 } as any);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`HemoHive_Invoice_${invoiceData?.invoiceId}.pdf`);
      alert('✓ PDF generated successfully!');
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      alert(`❌ Failed to generate PDF. Please try again. Error: ${error.message}`);
    }
  };

  const router = useRouter();



  // --- AUTOMATED DELIVERY TRIGGER ---
  const [isSearchingDriver, setIsSearchingDriver] = useState(false);
  const [deliveryAssigned, setDeliveryAssigned] = useState(false);
  const [deliveryId, setDeliveryId] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // Only auto-trigger if:
    // 1. Invoice Loaded -> 2. Payment Completed -> 3. Not triggered -> 4. Not assigned
    if (invoiceData && invoiceData.paymentStatus === 'Completed' && !hasTriggeredRef.current && !deliveryAssigned) {

      // [FIX] Prevent re-trigger if we have an active delivery in the data
      // Explicitly check for delivered as well
      const existingDelivery = (invoiceData as any).activeDelivery;
      if (existingDelivery) {
        console.log('[DEBUG] Existing Delivery Found:', existingDelivery);
        hasTriggeredRef.current = true; // Mark as handled so we don't try again
        return;
      }

      console.log('[DEBUG] Auto-triggering Delivery Search...');
      console.log('Invoice Payment Status:', invoiceData.paymentStatus);
      console.log('Triggered Ref:', hasTriggeredRef.current);
      console.log('Delivery Assigned:', deliveryAssigned);

      hasTriggeredRef.current = true;
      setIsSearchingDriver(true);
      trackDelivery();
    }
  }, [invoiceData, deliveryAssigned]);

  // --- POLLING FOR STATUS UPDATE ---
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (isSearchingDriver && deliveryId) {
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch('/api/delivery/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId: invoiceData?.invoiceId })
          });
          const data = await res.json();

          // [FIX] Check both root status (new) and nested delivery.status (existing)
          const currentStatus = data.status || data.delivery?.status;

          if (data.success && currentStatus === 'ASSIGNED') {
            setIsSearchingDriver(false);
            setDeliveryAssigned(true);
            setDeliveryId(data.deliveryId || data.delivery?._id);
            toast.success('Driver Accepted!', { icon: '🙌' });
            clearInterval(pollInterval);
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 3000); // Check every 3 seconds
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isSearchingDriver, deliveryId, invoiceData]);

  // Timer Logic
  useEffect(() => {
    if (!deadline || deliveryAssigned) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.max(0, Math.ceil((new Date(deadline).getTime() - now.getTime()) / 1000));
      setTimeLeft(diff);

      if (diff === 0) {
        clearInterval(interval);
        handleTimeout(); // Trigger timeout
        setDeadline(null); // Prevent re-trigger loop or stuck state
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline, deliveryAssigned]);

  const handleTimeout = async () => {
    console.log('[DEBUG] handleTimeout called. deliveryId:', deliveryId);

    if (!deliveryId) {
      console.error('[CRITICAL] Timed out but no deliveryId found. Resetting UI.');
      setIsSearchingDriver(false);
      setDeadline(null);
      toast.error('Search failed (ID missing). Try again.');
      return;
    }

    // [CRITICAL FIX] Verify status ONE LAST TIME before giving up.
    // This prevents race condition where Driver accepts at 59s but client hits 0s.
    try {
      const checkRes = await fetch('/api/delivery/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: invoiceData?.invoiceId })
      });
      const checkData = await checkRes.json();

      if (checkData.success && checkData.status === 'ASSIGNED') {
        toast.success('Driver Accepted just in time!', { icon: '😅' });
        return;
      }

      // (Moved useEffect to top level)
      toast('Driver unavailable, finding next...', { icon: '🔄' });

      try {
        const res = await fetch('/api/delivery/reject', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deliveryId, reason: 'timeout' })
        });
        const data = await res.json();

        if (data.success && data.nextSearch) {
          // Update with Next Driver Info
          if (data.nextSearch.success) {
            setDeadline(data.nextSearch.deadline);
            toast.success('Contacting next nearest driver...');
          } else {
            // No drivers found at all
            setIsSearchingDriver(false);
            setDeadline(null);
            toast.error('No drivers found. Please try again later.');
          }
        } else {
          // Handle case where reject succceded but no nextSearch data provided (e.g. error)
          setIsSearchingDriver(false);
          setDeadline(null);
          toast.error('Response timed out.');
        }
      } catch (error) {
        console.error("Timeout Error", error);
        setIsSearchingDriver(false); // [FIX] Reset state on network error
        setDeadline(null);
      }
    } catch (e) {
      console.error('Final check failed', e);
      // Fallthrough to reject if check fails
    }
  };

  const trackDelivery = async () => {
    let latitude = 28.6139; // Default
    let longitude = 77.2090;

    const proceedWithDelivery = async (lat: number, lng: number) => {
      try {
        const res = await fetch('/api/delivery/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId: invoiceData?.invoiceId
          })
        });

        const data = await res.json();

        if (data.success) {
          const id = data.deliveryId || data.delivery?._id;
          console.log('[DEBUG] Setting Delivery ID:', id);
          setDeliveryId(id); // Handle both formats

          if (data.status === 'ASSIGNED') {
            setIsSearchingDriver(false);
            setDeliveryAssigned(true);
            toast.success('Delivery Agent Found!', { icon: '🚚' });
          } else if (data.status === 'SEARCHING') {
            setIsSearchingDriver(true);
            setDeadline(data.deadline);
            toast.loading('Contacting Nearest Driver...', { duration: 3000 });
          }
        } else {
          // Retry Logic could go here (e.g. timeout and try again)
          setIsSearchingDriver(false);
          toast.error(data.message || 'Drivers Busy');
          // Reset trigger after delay to allow retry?
          setTimeout(() => { hasTriggeredRef.current = false; }, 10000);
        }

      } catch (error) {
        console.error(error);
        setIsSearchingDriver(false);
      }
    };

    if (!navigator.geolocation) {
      proceedWithDelivery(latitude, longitude);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        proceedWithDelivery(position.coords.latitude, position.coords.longitude);
      },
      async (error) => {
        proceedWithDelivery(latitude, longitude);
      }
    );
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-[#0B0B0B] via-[#0F0F0F] to-[#1A0A1A] text-white flex items-center justify-center">Loading invoice...</div>;
  }

  if (isError || !invoiceData) {
    return <div className="min-h-screen bg-gradient-to-br from-[#0B0B0B] via-[#0F0F0F] to-[#1A0A1A] text-white flex items-center justify-center">Error loading invoice or invoice not found.</div>;
  }

  const total = invoiceData.fees.processing + invoiceData.fees.delivery + invoiceData.fees.deposit;

  const handleMockPayment = async () => {
    const toastId = toast.loading('Processing Secure Payment...');
    try {
      const res = await fetch(`/api/donor/payment-confirm/${requestId}`, {
        method: 'POST',
      });

      if (res.ok) {
        toast.success('Payment Successful! Generating Invoice...', { id: toastId });
        await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay for UX
        // Refetch or reload to update UI
        window.location.reload();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Payment Failed', { id: toastId });
      }
    } catch (error) {
      toast.error('Network Error during payment', { id: toastId });
    }
  };

  // --- MOCK PAYMENT GATEWAY UI ---
  // If status is Pending (fetched via new API field or inferred), show Payment UI
  // Note: For now assuming invoiceData includes paymentStatus or we check it.
  // Since fetchInvoiceData currently doesn't return paymentStatus, we need to update that API too
  // OR we can infer it. For now, let's assume we mock it visually or update the Interface.

  if (invoiceData.paymentStatus === 'Pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0B0B] via-[#0F0F0F] to-[#1A0A0A] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#C00029] to-[#FF4458]" />

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#C00029]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard size={32} className="text-[#C00029]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Secure Payment</h2>
            <p className="text-sm text-gray-400">Complete transaction to generate invoice</p>
          </div>

          <div className="bg-slate-950 rounded-xl p-4 mb-6 border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Total Amount</span>
              <span className="text-2xl font-bold text-white">₹{total}</span>
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Shield size={12} /> 256-bit SSL Encrypted
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Transaction ID: {`TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`}
            </div>
          </div>

          <button
            onClick={handleMockPayment}
            className="w-full bg-gradient-to-r from-[#C00029] to-[#8B0020] hover:from-[#D00030] hover:to-[#9B0025] text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            Pay ₹{total} Now
          </button>

          <p className="text-xs text-center text-gray-500 mt-4">
            By clicking Pay, you agree to our Terms & Refund Policy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0B] via-[#0F0F0F] to-[#1A0A0A] text-white">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C00029] rounded-full opacity-[0.03] blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#C00029] rounded-full opacity-[0.02] blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div ref={invoiceContentRef} className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">

        {/* Floating Header with glassmorphism */}
        <div
          ref={headerRef}
          className={`backdrop-blur-xl bg-gradient-to-r from-[#C00029]/10 to-[#8B0020]/10 rounded-2xl p-6 md:p-8 mb-8 border border-[#C00029]/30 shadow-2xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}
        >
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#C00029] to-[#8B0020] rounded-xl flex items-center justify-center shadow-lg">
                <Receipt className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#C00029] to-[#FF4458] bg-clip-text text-transparent mb-1">
                  HemoHive
                </h1>
                <p className="text-sm text-gray-400 italic">Affordable, accountable & always life-saving.</p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-[#C00029]/20">
                <div className="text-xs text-gray-400 mb-1">Invoice ID</div>
                <div className="text-2xl font-mono font-bold text-[#C00029]">{invoiceData.invoiceId}</div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                  <Calendar size={12} />
                  {currentDateTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {currentDateTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">

          {/* Left Column - Customer & Billing */}
          <div className="lg:col-span-2 space-y-6">

            {/* Customer Details Card */}
            <div
              className={`group backdrop-blur-lg bg-gradient-to-br from-[#1A1A1A]/80 to-[#151515]/80 rounded-2xl p-6 border border-gray-800/50 hover:border-[#C00029]/30 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-[#C00029]/10 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
              style={{ transitionDelay: '200ms' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#C00029]/20 to-[#8B0020]/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <User className="text-[#C00029]" size={20} />
                </div>
                <h2 className="text-xl font-bold">Customer Details</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Full Name</div>
                  <div className="text-lg font-semibold text-white">{invoiceData.customer.name}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Blood Type Required</div>
                  <div className="inline-flex items-center gap-2 bg-[#C00029]/20 border border-[#C00029]/30 px-4 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-[#C00029] rounded-full animate-pulse"></div>
                    <span className="text-xl font-bold text-[#C00029]">{invoiceData.customer.bloodType}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Shield size={12} />
                    Aadhaar (Last 4)
                  </div>
                  <div className="font-mono text-gray-300 text-lg">XXXX-XXXX-{invoiceData.customer.aadhaarLast4}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Phone size={12} />
                    Contact Number
                  </div>
                  <div className="text-gray-300 text-lg">{invoiceData.customer.contact}</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800/50">
                <div className="text-xs text-gray-500 mb-1">Delivery Location</div>
                <div className="text-sm text-gray-300">{invoiceData.customer.location}</div>
              </div>
            </div>

            {/* Billing Breakdown */}
            <div
              className={`backdrop-blur-lg bg-gradient-to-br from-[#1A1A1A]/80 to-[#151515]/80 rounded-2xl p-6 border border-gray-800/50 shadow-xl overflow-hidden transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
              style={{ transitionDelay: '400ms' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#C00029]/20 to-[#8B0020]/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="text-[#C00029]" size={20} />
                </div>
                <h2 className="text-xl font-bold">Billing Breakdown</h2>
              </div>

              <div className="space-y-1">
                {/* Processing Fee */}
                <div
                  className="group relative overflow-hidden rounded-xl p-4 hover:bg-white/[0.02] transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredCard('processing')}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-[#C00029]/5 to-transparent transition-opacity duration-300 ${hoveredCard === 'processing' ? 'opacity-100' : 'opacity-0'}`}></div>
                  <div className="relative flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-1 flex items-center gap-2">
                        Processing Fee
                        {hoveredCard === 'processing' && (
                          <ArrowRight size={16} className="text-[#C00029] animate-pulse" />
                        )}
                      </div>
                      <div className="text-xs text-gray-400">Testing, storage & cold-chain preparation</div>
                    </div>
                    <div className="font-mono text-2xl font-bold text-white">₹{invoiceData.fees.processing}</div>
                  </div>
                </div>

                {/* Delivery Fee */}
                <div
                  className="group relative overflow-hidden rounded-xl p-4 hover:bg-white/[0.02] transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredCard('delivery')}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-[#C00029]/5 to-transparent transition-opacity duration-300 ${hoveredCard === 'delivery' ? 'opacity-100' : 'opacity-0'}`}></div>
                  <div className="relative flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-1 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#C00029]/20 text-[#C00029] text-xs rounded-full">{invoiceData.deliveryType}</span>
                        Delivery Fee
                        {hoveredCard === 'delivery' && (
                          <ArrowRight size={16} className="text-[#C00029] animate-pulse" />
                        )}
                      </div>
                      <div className="text-xs text-gray-400">{invoiceData.distance} • ETA: {invoiceData.estimatedTime}</div>
                    </div>
                    <div className="font-mono text-2xl font-bold text-white">₹{invoiceData.fees.delivery}</div>
                  </div>
                </div>

                {/* Deposit */}
                <div
                  className="group relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-green-900/10 to-green-800/5 border border-green-700/20 hover:border-green-600/30 transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredCard('deposit')}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="relative flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-1 flex items-center gap-2">
                        Refundable Deposit
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                          <CheckCircle size={10} />
                          97% back*
                        </span>
                        {hoveredCard === 'deposit' && (
                          <ArrowRight size={16} className="text-green-400 animate-pulse" />
                        )}
                      </div>
                      <div className="text-xs text-green-400">Responsibility credit • Return within {invoiceData.returnDeadline} days</div>
                    </div>
                    <div className="font-mono text-2xl font-bold text-green-400">₹{invoiceData.fees.deposit}</div>
                  </div>
                </div>

                {/* Total */}
                <div className="relative mt-6 pt-6 border-t border-[#C00029]/20">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#C00029]/5 via-[#C00029]/10 to-[#C00029]/5 rounded-xl blur-xl"></div>
                  <div className="relative flex justify-between items-center p-6 bg-gradient-to-r from-[#C00029]/20 to-[#8B0020]/20 rounded-xl border border-[#C00029]/30 shadow-lg">
                    <div className="font-bold text-xl text-white">Total Payable</div>
                    <div className="font-mono text-4xl font-bold bg-gradient-to-r from-[#C00029] to-[#FF4458] bg-clip-text text-transparent">
                      ₹{total}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Refund Policy Card */}
            <div
              className={`backdrop-blur-lg bg-gradient-to-br from-green-900/10 to-green-800/5 border border-green-700/30 rounded-2xl p-6 shadow-xl transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
              style={{ transitionDelay: '600ms' }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                  <AlertCircle className="text-green-400" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-green-300 mb-2">97% Refund Guarantee</h3>
                  <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                    Return a compatible <span className="font-semibold text-white">{invoiceData.customer.bloodType}</span> blood unit
                    within <span className="font-semibold text-white">{invoiceData.returnDeadline} days</span> to receive your refund.
                  </p>

                  <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 space-y-3 border border-green-700/20">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Original Deposit:</span>
                      <span className="font-mono font-semibold text-white">₹{invoiceData.fees.deposit}</span>
                    </div>
                    <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: '97%' }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-400 text-sm font-medium">You'll get back (97%):</span>
                      <span className="font-mono text-xl font-bold text-green-400">₹{invoiceData.refundPolicy.amount}</span>
                    </div>
                    <div className="text-xs text-gray-500 pt-2 border-t border-green-700/20">
                      Service retention (3%): ₹{invoiceData.refundPolicy.retained}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - QR & Actions */}
          <div className="space-y-6">

            {/* QR Code Card */}
            <div
              className={`backdrop-blur-lg bg-gradient-to-br from-[#1A1A1A]/80 to-[#151515]/80 rounded-2xl p-6 border border-gray-800/50 hover:border-[#C00029]/30 transition-all duration-700 shadow-xl sticky top-8 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: '300ms' }}
            >
              <h3 className="text-lg font-bold mb-4 text-center">Quick Access</h3>
              <div className="flex justify-center mb-4" ref={qrRef}></div>
              <div className="text-center space-y-3">
                <div className="text-xs text-gray-400">Scan for instant access</div>
                <div className="flex flex-col gap-2 text-xs">
                  {['Track Delivery', 'Blood Traceability', 'Return Status', 'Receipt History'].map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#C00029]/10 hover:bg-[#C00029]/20 border border-[#C00029]/20 px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer flex items-center justify-between group"
                    >
                      <span>{item}</span>
                      <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={downloadPDF}
                className="w-full bg-gradient-to-r from-[#C00029] to-[#8B0020] hover:from-[#D00030] hover:to-[#9B0025] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-[#C00029]/30 hover:scale-[1.02] active:scale-95"
              >
                <Download size={20} />
                Download Invoice PDF
              </button>

              {/* AUTOMATED DELIVERY STATUS BUTTON */}
              {isSearchingDriver ? (
                <button
                  disabled
                  className="w-full bg-slate-800/80 backdrop-blur-lg text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 border border-slate-700 cursor-wait animate-pulse"
                >
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Contacting Driver... ({timeLeft}s)
                </button>
              ) : (invoiceData as any).activeDelivery?.status === 'DELIVERED' ? (
                <button
                  disabled
                  className="w-full bg-slate-800/80 backdrop-blur-lg text-green-400 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 border border-green-500/30"
                >
                  <CheckCircle size={20} />
                  Delivery Completed
                </button>
              ) : deliveryAssigned ? (
                <button
                  onClick={() => router.push(`/delivery/track/${deliveryId}`)}
                  className="w-full bg-[#C00029] text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-red-900/20 hover:bg-[#a00023] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 animate-pulse"
                >
                  <Truck size={20} className="animate-bounce" />
                  Track Live Delivery
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-800/50 text-gray-400 font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 border border-gray-700"
                >
                  <AlertCircle size={20} />
                  Waiting for availability...
                </button>
              )}
            </div>

            {/* Return Requirements Compact */}
            <div className="backdrop-blur-lg bg-gradient-to-br from-[#1A1A1A]/60 to-[#151515]/60 rounded-xl p-4 border border-gray-800/50 text-xs">
              <h4 className="font-semibold text-[#C00029] mb-3 flex items-center gap-2">
                <CheckCircle size={14} />
                Return Checklist
              </h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Match blood type: <strong className="text-white">{invoiceData.customer.bloodType}</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Sealed & unexpired bag</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Within {invoiceData.returnDeadline} days</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Section - Compliance */}
        <div
          className={`backdrop-blur-lg bg-gradient-to-r from-[#1A1A1A]/60 to-[#151515]/60 rounded-2xl p-6 border border-gray-800/50 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ transitionDelay: '800ms' }}
        >
          <div className="flex items-start gap-3 mb-4">
            <Shield className="text-[#C00029] flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-white mb-2">Regulatory & Ethical Compliance</h3>
              <div className="grid md:grid-cols-2 gap-3 text-xs text-gray-400">
                <div className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Blood is <strong className="text-white">not sold</strong>. Charges for processing & logistics only.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Compliant with NACO Guidelines & CDSCO Regulations</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Aadhaar-based identity verification with PHI encryption</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Invoice link expires in 60 days for security</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs py-8 space-y-2">
          <p className="text-sm">
            <span className="bg-gradient-to-r from-[#C00029] to-[#FF4458] bg-clip-text text-transparent font-semibold">
              Powered by HemoHive
            </span>
            <span className="mx-2">—</span>
            Delivering Hope, Saving Lives.
          </p>
          <p>For support: <a href="mailto:support@hemohive.in" className="text-[#C00029] hover:underline">9751ayushsingh@gmail.com</a> | +91 9026804355</p>
        </div>
      </div>
    </div >
  );
};

export default HemoHiveInvoice;