'use client';

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Siren, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { toast } from 'react-hot-toast';

interface BloodRequest {
    _id: string;
    bloodGroup: string;
    units: number;
    urgency: 'Normal' | 'Urgent' | 'Emergency';
    patientHospital: string;
    reason: string;
    expiresAt: string;
    document?: string;
}

const viewDocument = async (doc: string) => {
    if (!doc) return;

    console.log('[DocumentView] Initial URL:', doc);
    const toastId = toast.loading('Preparing document...');

    try {
        let processedUrl = doc;
        if (doc.includes('cloudinary.com') && doc.startsWith('http:')) {
            processedUrl = doc.replace('http:', 'https:');
            console.log('[DocumentView] Promoted to HTTPS:', processedUrl);
        } else if (doc.startsWith('//')) {
            processedUrl = 'https:' + doc;
            console.log('[DocumentView] Fixed protocol-relative:', processedUrl);
        }

        if (processedUrl.startsWith('http')) {
            // High-reliability: Fetch as Blob first to bypass browser plugin security quirks
            const response = await fetch(processedUrl);
            if (!response.ok) throw new Error(`Server returned ${response.status}`);

            let blob = await response.blob();

            // Force PDF type if URL suggests it, to prevent "unreadable text" (misidentified binary)
            if (processedUrl.toLowerCase().endsWith('.pdf') || processedUrl.includes('/raw/')) {
                blob = new Blob([blob], { type: 'application/pdf' });
            }

            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Document opened', { id: toastId });
        } else if (processedUrl.startsWith('data:')) {
            const res = await fetch(processedUrl);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Document opened', { id: toastId });
        } else {
            window.open(processedUrl, '_blank');
            toast.dismiss(toastId);
        }
    } catch (e) {
        console.error('[DocumentView] High-reliability view failed:', e);
        toast.error('Direct view failed. Downloading fallback...', { id: toastId });

        // Fallback: Direct Download or direct window open
        const link = document.createElement('a');
        link.href = doc;
        link.target = '_blank';
        link.download = 'medical-report';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

const socket = io({ path: '/api/socket' });

const BloodRequestCard = React.memo(({
    req,
    i,
    availableBloodGroups,
    handleApprove,
    handleReject
}: {
    req: BloodRequest,
    i: number,
    availableBloodGroups: Set<string>,
    handleApprove: (id: string) => void,
    handleReject: (id: string) => void
}) => {
    const [timer, setTimer] = useState<string>('--:--');

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date().getTime();
            const expiryTime = new Date(req.expiresAt).getTime();
            const distance = expiryTime - now;

            if (distance < 0) {
                setTimer('EXPIRED');
                return;
            }

            const hours = Math.floor(distance / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if (hours > 0) {
                setTimer(`${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
            } else {
                setTimer(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
            }
        };

        const interval = setInterval(updateTimer, 1000);
        updateTimer();
        return () => clearInterval(interval);
    }, [req.expiresAt]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: Math.min(i * 0.1, 0.5) }}
            whileHover={{ scale: 1.02, rotateX: 2, zIndex: 50 }}
            className={`relative group/card p-6 rounded-2xl border backdrop-blur-xl overflow-hidden shadow-2xl transition-all ${req.urgency === 'Emergency'
                ? 'bg-gradient-to-r from-red-950/80 to-slate-900/80 border-red-500/30 hover:border-red-500/60 shadow-red-900/20'
                : req.urgency === 'Urgent'
                    ? 'bg-gradient-to-r from-orange-950/80 to-slate-900/80 border-orange-500/30 hover:border-orange-500/60 shadow-orange-900/20'
                    : 'bg-gradient-to-r from-slate-800/80 to-slate-900/80 border-white/10 hover:border-indigo-500/50 shadow-indigo-900/20'
                }`}
        >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-1000"></div>

            <div className="flex justify-between items-start relative z-10">
                <div className="flex items-start gap-6">
                    <div className="relative">
                        <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border-2 shadow-[0_0_30px_rgba(0,0,0,0.3)] ${req.urgency === 'Emergency' ? 'bg-red-600 border-red-400 text-white animate-pulse' : 'bg-slate-800 border-slate-600 text-slate-200'
                            }`}>
                            <span className="text-3xl font-black">{req.bloodGroup}</span>
                            <span className="text-[10px] font-bold opacity-80">{req.units} UNITS</span>
                        </div>
                        <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap shadow-lg border ${req.urgency === 'Emergency'
                            ? 'bg-red-950 text-red-500 border-red-500/50'
                            : req.urgency === 'Urgent'
                                ? 'bg-orange-950 text-orange-500 border-orange-500/50'
                                : 'bg-slate-950 text-slate-400 border-slate-700'
                            }`}>
                            {req.urgency}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                            {req.patientHospital}
                        </h4>
                        <div className="flex items-center gap-4 text-sm font-mono text-slate-400 mb-2">
                            <span className="flex items-center gap-1">
                                <Clock size={14} className="text-indigo-400" />
                                Expires at {new Date(req.expiresAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </span>
                            {availableBloodGroups.has(req.bloodGroup) ? (
                                <span className="text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                    <CheckCircle size={14} /> IN STOCK
                                </span>
                            ) : (
                                <span className="text-rose-400 flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                                    <AlertTriangle size={14} /> OUT OF STOCK
                                </span>
                            )}
                        </div>
                        {req.reason && (
                            <p className="text-slate-500 italic border-l-2 border-white/10 pl-3 py-1 text-sm max-w-md">
                                "{req.reason}"
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <div className={`text-4xl font-black tracking-tighter font-mono tabular-nums drop-shadow-lg ${parseInt(timer.split(':')[0]) < 10 && timer !== 'EXPIRED' ? 'text-rose-500 animate-pulse' : 'text-slate-200'
                        }`}>
                        {timer}
                    </div>

                    <div className="flex gap-2 mt-2">
                        {req.document && (
                            <Button
                                onClick={() => viewDocument(req.document!)}
                                variant="ghost"
                                size="sm"
                                className="text-slate-400 hover:text-white hover:bg-white/10 border border-white/5"
                            >
                                📄 DOC
                            </Button>
                        )}
                        <Button
                            onClick={() => handleReject(req._id)}
                            variant="outline"
                            className="font-bold border-rose-500/50 text-rose-500 hover:bg-rose-500/10 hover:text-rose-400"
                        >
                            REJECT ✖
                        </Button>
                        <Button
                            onClick={() => handleApprove(req._id)}
                            className={`font-bold shadow-lg transition-all active:scale-95 ${req.urgency === 'Emergency'
                                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                                }`}
                        >
                            ACCEPT & DISPATCH 🚀
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div >
    );
});

BloodRequestCard.displayName = 'BloodRequestCard';

const LiveBloodRequests = ({ inventory, hospitalId }: { inventory: any[], hospitalId?: string }) => {
    const [requests, setRequests] = useState<BloodRequest[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    // Derived sorted requests
    const sortedRequests = React.useMemo(() => {
        const urgencyWeight = { 'Emergency': 3, 'Urgent': 2, 'Normal': 1 };

        return [...requests].sort((a, b) => {
            const weightDiff = (urgencyWeight[b.urgency as keyof typeof urgencyWeight] || 0) -
                (urgencyWeight[a.urgency as keyof typeof urgencyWeight] || 0);

            if (weightDiff !== 0) return weightDiff;
            return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
        });
    }, [requests]);

    const availableBloodGroups = React.useMemo(() => {
        if (!inventory) return new Set();
        return new Set(
            inventory
                .filter(item => item.quantity > 0)
                .map(item => item.bloodGroup.toUpperCase())
        );
    }, [inventory]);

    useEffect(() => {
        function onConnect() { setIsConnected(true); }
        function onDisconnect() { setIsConnected(false); }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        if (socket.connected) setIsConnected(true);

        const fetchRequests = () => {
            fetch('/api/blood-request/pending')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setRequests(data.map(req => ({ ...req, document: req.document || undefined })));
                    } else {
                        setRequests([]);
                    }
                })
                .catch(err => console.error("Failed to load requests:", err));
        };

        fetchRequests();
        const pollInterval = setInterval(fetchRequests, 30000); // Reduce polling frequency as we have sockets

        socket.emit('join_hospital_room', hospitalId);

        socket.on('new_blood_request', (data: BloodRequest) => {
            console.log("🚨 [Socket] Received New Request:", data._id);
            setRequests(prev => {
                // Prevent duplicates
                if (prev.some(r => r._id === data._id)) return prev;
                return [{ ...data, document: data.document || undefined }, ...prev];
            });

            toast('🚨 New Emergency Blood Request!', {
                icon: '🩸',
                style: { border: '1px solid #EF4444', color: '#EF4444' }
            });
            new Audio('/notification.mp3').play().catch(e => console.log('Audio play failed', e));
        });

        socket.on('request_taken', (takenId: string) => {
            setRequests(prev => prev.filter(r => r._id !== takenId));
        });

        return () => {
            clearInterval(pollInterval);
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('new_blood_request');
            socket.off('request_taken');
        };
    }, []);

    // Effect for auto-cleaning expired items from list to keep UI fresh
    useEffect(() => {
        const cleanup = setInterval(() => {
            const now = new Date().getTime();
            setRequests(prev => {
                const filtered = prev.filter(r => new Date(r.expiresAt).getTime() > now);
                return filtered.length !== prev.length ? filtered : prev;
            });
        }, 5000);
        return () => clearInterval(cleanup);
    }, []);

    const handleApprove = React.useCallback(async (requestId: string) => {
        try {
            const res = await fetch('/api/blood-request/approve', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId }),
            });

            if (res.ok) {
                toast.success('Request accepted and tokens recorded!');
                setRequests(prev => prev.filter(req => req._id !== requestId));
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to approve request');
            }
        } catch (error) {
            toast.error('Connection error');
        }
    }, []);

    const handleReject = React.useCallback(async (requestId: string) => {
        try {
            const res = await fetch('/api/blood-request/reject', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId }),
            });

            if (res.ok) {
                toast.success('Request Rejected');
                setRequests(prev => prev.filter(req => req._id !== requestId));
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to reject request');
            }
        } catch (error) {
            toast.error('Connection error');
        }
    }, []);

    return (
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 rounded-3xl blur opacity-25 group-hover:opacity-100 transition duration-1000"></div>

            <div className="relative bg-slate-900/90 backdrop-blur-3xl p-8 rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>

                <div className="relative z-10 flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                            <span className="relative flex h-4 w-4">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                                <span className={`relative inline-flex rounded-full h-4 w-4 ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            </span>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-fuchsia-400 to-indigo-400">
                                LIVE EMERGENCY FEED
                            </span>
                        </h2>
                        <p className="text-slate-400 font-mono text-xs mt-1 uppercase tracking-widest pl-7">
                            Real-time Hemohive Network • {isConnected ? 'ONLINE' : 'OFFLINE'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`px-4 py-2 rounded-xl text-xs font-bold font-mono border backdrop-blur-md transition-all ${isConnected
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            }`}>
                            {isConnected ? '⚡ SOCKET_ACTIVE' : '🔌 DISCONNECTED'}
                        </div>
                    </div>
                </div>

                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 8px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.5); border-radius: 8px; border: 2px solid rgba(0, 0, 0, 0.1); }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.8); }
                    .scroll-smooth { scroll-behavior: smooth; }
                `}</style>

                <div className="space-y-4 h-[500px] overflow-y-auto pr-2 custom-scrollbar scroll-smooth">
                    <AnimatePresence mode='popLayout'>
                        {sortedRequests.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20 rounded-2xl border-2 border-dashed border-white/5 bg-white/5"
                            >
                                <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-black/50">
                                    <span className="text-5xl animate-pulse">📡</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Network Silent</h3>
                                <p className="text-slate-500 font-mono text-sm">Scanning for emergency signals...</p>
                                <Button
                                    onClick={() => window.location.reload()}
                                    variant="outline"
                                    className="mt-6 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                                >
                                    🔄 FORCE SYNC
                                </Button>
                            </motion.div>
                        ) : (
                            sortedRequests.map((req, i) => (
                                <BloodRequestCard
                                    key={req._id}
                                    req={req}
                                    i={i}
                                    availableBloodGroups={availableBloodGroups}
                                    handleApprove={handleApprove}
                                    handleReject={handleReject}
                                />
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default LiveBloodRequests;
