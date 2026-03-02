import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useQueryClient } from '@tanstack/react-query';

interface ExchangeUnit {
    _id: string;
    bagId: string;
    bloodGroup: string;
    quantity: number;
    expiryDate: string;
    exchangeStatus: string;
    originHospitalId: {
        _id: string;
        fullName: string;
        address: string;
    };
}

const TransitTracker = () => {
    const [inboundUnits, setInboundUnits] = useState<ExchangeUnit[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState<string | null>(null);
    const [coldChainCheckBag, setColdChainCheckBag] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const blipRef = useRef<HTMLDivElement>(null);

    // Auto-dismiss messages
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchInbound = async () => {
        try {
            const res = await fetch('/api/hemoflux/exchange?type=inbound');
            const data = await res.json();
            if (data.pool) setInboundUnits(data.pool);
        } catch (err) {
            console.error('Failed to fetch inbound units:', err);
        } finally {
            setLoading(false);
        }
    };

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchInbound();
    }, []);

    useEffect(() => {
        // God-level glowing map animation
        if (!loading && inboundUnits.length > 0 && mapRef.current && blipRef.current) {
            gsap.to(blipRef.current, {
                x: '100%',
                duration: 3,
                ease: 'power1.inOut',
                yoyo: true,
                repeat: -1
            });
        }
    }, [loading, inboundUnits.length]);

    const queryClient = useQueryClient();

    const handleConfirmReceipt = async (bagId: string, isColdChainIntact: boolean) => {
        setColdChainCheckBag(null);
        setConfirming(bagId);
        setMessage({ text: 'Updating central inventory...', type: 'info' });

        try {
            const res = await fetch('/api/hemoflux/exchange', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'CONFIRM_RECEIPT',
                    bagId,
                    coldChainIntact: isColdChainIntact
                })
            });

            if (res.ok) {
                setInboundUnits(prev => prev.filter(u => u.bagId !== bagId));
                setMessage({ text: 'Receipt confirmed. Unit safely added to your inventory.', type: 'success' });

                // Instantly synchronize global React Query cache
                queryClient.invalidateQueries({ queryKey: ['inventory'] });
            } else {
                const data = await res.json();
                setMessage({ text: `System Error: ${data.message}`, type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Network instability detected. Confirmation failed.', type: 'error' });
        } finally {
            setConfirming(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 bg-black rounded-2xl border border-white/10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
        );
    }

    if (inboundUnits.length === 0) {
        return (
            <div className="p-16 text-center bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none" />
                <h3 className="text-xl font-bold text-white mb-2 font-headline">No Inbound Shipments</h3>
                <p className="text-white/50">Units you claim from the exchange will appear here while in transit.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black text-white px-2 font-headline">
                <span className="text-red-500">◉</span> Live Transit Tracking
            </h2>

            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence>
                    {inboundUnits.map((unit) => (
                        <motion.div
                            key={unit._id}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden relative group"
                        >
                            {/* Animated Background Glow */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-1000 group-hover:duration-200" />

                            <div className="relative p-6 flex flex-col md:flex-row gap-8 items-center justify-between">

                                {/* Info Section */}
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-red-500 blur-lg flex opacity-40 animate-pulse" />
                                        <div className="relative bg-gradient-to-br from-red-500 to-red-700 text-white font-black p-4 rounded-xl text-3xl shadow-2xl border border-red-400/30">
                                            {unit.bloodGroup}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-mono text-white/50 text-sm mb-1">{unit.bagId}</p>
                                        <h3 className="text-xl font-bold text-white font-headline">
                                            Origin: {unit.originHospitalId?.fullName || 'Unknown'}
                                        </h3>
                                        <p className="text-white/60 text-sm mt-1">{unit.quantity}ml</p>
                                    </div>
                                </div>

                                {/* Abstract Tracking Visual (The "God Level" bit) */}
                                <div className="flex-1 w-full px-8 hidden md:block" ref={mapRef}>
                                    <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,0,0,0.2)_50%,transparent_100%)] w-full block animate-[shimmer_2s_infinite]" />
                                        <div
                                            ref={blipRef}
                                            className="absolute top-0 left-0 h-full w-1/4 bg-gradient-to-r from-transparent via-red-500 to-white shadow-[0_0_15px_rgba(255,0,0,0.8)] rounded-full"
                                        />
                                    </div>
                                    <div className="flex justify-between mt-2 text-[10px] text-white/40 uppercase font-bold tracking-widest">
                                        <span>Dispatched</span>
                                        <span className="text-red-400">In Transit</span>
                                        <span>Destination</span>
                                    </div>
                                </div>

                                {/* Action Section */}
                                <div className="w-full md:w-auto flex flex-col gap-2">
                                    <button
                                        onClick={() => setColdChainCheckBag(unit.bagId)}
                                        disabled={confirming === unit.bagId}
                                        className="relative group/btn overflow-hidden px-8 py-3.5 rounded-xl bg-white text-black font-black uppercase tracking-widest text-sm transition-all duration-500 hover:scale-[1.05] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none border border-white/20 hover:border-red-500"
                                    >
                                        <span className="invisible block">Verify & Receive</span>

                                        <span className="absolute inset-0 flex items-center justify-center gap-2 transform transition-all duration-500 ease-in-out group-hover/btn:-translate-y-[150%] group-hover/btn:opacity-0 group-hover/btn:scale-95 text-black">
                                            {confirming === unit.bagId ? (
                                                <span className="w-4 h-4 border-2 border-black border-t-transparent animate-spin rounded-full" />
                                            ) : (
                                                <>Verify & Receive</>
                                            )}
                                        </span>

                                        {/* Liquid Magma Fill */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-red-600 via-red-500 to-orange-500 translate-y-[101%] group-hover/btn:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-0 rounded-xl" />

                                        {/* Light sweep */}
                                        <div className="absolute top-0 -left-[100%] w-[60%] h-[200%] bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-30deg] group-hover/btn:left-[200%] transition-all duration-700 ease-in-out z-0 delay-[50ms]" />

                                        <span className="absolute inset-0 flex items-center justify-center text-white font-black tracking-widest opacity-0 transform translate-y-[150%] scale-95 group-hover/btn:translate-y-0 group-hover/btn:scale-100 group-hover/btn:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-10 pointer-events-none drop-shadow-lg">
                                            <span className="mr-2 animate-pulse text-yellow-300">🛡️</span> CONFIRM RECEIPT
                                        </span>
                                    </button>
                                </div>

                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            {/* Premium Messaging & Modals (Portaled to Body) */}
            {mounted && createPortal(
                <>
                    {/* Premium Message Toast Layer */}
                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="fixed top-24 left-1/2 -translate-x-1/2 z-[99999] w-full max-w-md px-4 pointer-events-none"
                            >
                                <div className={`p-4 rounded-2xl backdrop-blur-xl border flex items-start gap-4 shadow-2xl ${message.type === 'success' ? 'bg-green-950/80 border-green-500/50 text-green-200' : message.type === 'error' ? 'bg-red-950/80 border-red-500/50 text-red-200' : 'bg-black/80 border-white/20 text-white'}`}>
                                    <div className="mt-1 flex-shrink-0 text-lg">
                                        {message.type === 'success' ? '✅' : message.type === 'error' ? '⚠️' : 'ℹ️'}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`font-black uppercase tracking-wider text-[10px] mb-1 ${message.type === 'success' ? 'text-green-400' : message.type === 'error' ? 'text-red-400' : 'text-blue-400'}`}>
                                            {message.type === 'success' ? 'Protocol Success' : message.type === 'error' ? 'System Warning' : 'Operation Active'}
                                        </h4>
                                        <p className="text-xs font-medium">{message.text}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Cold Chain Verification Modal */}
                    <AnimatePresence>
                        {coldChainCheckBag && (
                            <div className="fixed inset-0 z-[99998] flex items-center justify-center px-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
                                    onClick={() => setColdChainCheckBag(null)}
                                />

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, rotateX: 15 }}
                                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, rotateX: -15 }}
                                    className="relative w-full max-w-lg bg-blue-950/40 border border-blue-500/30 rounded-[3rem] p-12 overflow-hidden shadow-[0_0_100px_rgba(59,130,246,0.2)] perspective-1000"
                                >
                                    {/* Animated Frost Background */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1),transparent)] pointer-events-none" />
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent animate-[scan_4s_linear_infinite]" />

                                    <div className="relative z-10 text-center flex flex-col items-center">
                                        {/* Ice/Blue Hazard Icon */}
                                        <div className="mb-8 relative">
                                            <div className="absolute inset-0 bg-blue-400 animate-pulse blur-2xl opacity-20" />
                                            <div className="w-24 h-24 bg-blue-600/10 border-2 border-blue-500/50 rounded-full flex items-center justify-center backdrop-blur-md">
                                                <span className="text-4xl">❄️</span>
                                            </div>
                                        </div>

                                        <div className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full mb-6 text-blue-400 font-mono text-[10px] uppercase tracking-[0.3em] font-black">
                                            Critical Quality Check
                                        </div>

                                        <h2 className="text-4xl font-black text-white font-outfit tracking-tighter mb-4">
                                            Cold Chain Integrity
                                        </h2>

                                        <p className="text-blue-100/60 text-sm font-medium leading-relaxed mb-10 max-w-sm">
                                            Has the blood unit maintained its required temperature protocol throughout the entire transit duration?
                                        </p>

                                        <div className="grid grid-cols-2 gap-4 w-full">
                                            <button
                                                onClick={() => handleConfirmReceipt(coldChainCheckBag, true)}
                                                className="py-4 px-6 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-green-500 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-green-500/20"
                                            >
                                                YES, INTACT
                                            </button>
                                            <button
                                                onClick={() => handleConfirmReceipt(coldChainCheckBag, false)}
                                                className="py-4 px-6 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400 font-black uppercase tracking-widest text-xs hover:bg-red-600 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-red-500/10"
                                            >
                                                NO, REJECT
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => setColdChainCheckBag(null)}
                                            className="mt-8 text-[10px] text-white/30 uppercase tracking-[0.2em] font-black hover:text-white transition-colors"
                                        >
                                            Cancel Verification
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </>,
                document.body
            )}
        </div>
    );
};

export default TransitTracker;
