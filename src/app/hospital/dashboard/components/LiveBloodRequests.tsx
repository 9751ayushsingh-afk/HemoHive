'use client';

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Siren, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

interface BloodRequest {
    _id: string;
    bloodGroup: string;
    units: number;
    urgency: 'Normal' | 'Urgent' | 'Emergency';
    patientHospital: string;
    reason: string;
    expiresAt: string;
}

const socket = io({ path: '/api/socket' });

const LiveBloodRequests = ({ inventory }: { inventory: any[] }) => {
    const [requests, setRequests] = useState<BloodRequest[]>([]);
    const [timers, setTimers] = useState<{ [key: string]: string }>({});
    const [isConnected, setIsConnected] = useState(false);

    // Normalize inventory for easier checking (e.g., set of available blood groups)
    const availableBloodGroups = React.useMemo(() => {
        if (!inventory) return new Set();
        // Assume inventory items have a 'bloodGroup' field and 'quantity' > 0
        return new Set(inventory.filter(item => item.quantity > 0).map(item => item.bloodGroup));
    }, [inventory]);

    useEffect(() => {
        // 0. Update Connection State
        function onConnect() {
            setIsConnected(true);
            console.log('Socket Connected!');
        }
        function onDisconnect() {
            setIsConnected(false);
            console.log('Socket Disconnected!');
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        // Initial check
        if (socket.connected) setIsConnected(true);

        // 1. Fetch Initial Pending Requests
        fetch('/api/blood-request/pending')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Filter initial requests
                    const relevantRequests = data.filter(req => availableBloodGroups.has(req.bloodGroup));
                    setRequests(relevantRequests);
                }
            })
            .catch(err => console.error("Failed to load requests", err));

        // 2. Join Room
        socket.emit('join_hospital_room');

        // 3. Listen for new requests
        socket.on('new_blood_request', (data: BloodRequest) => {
            console.log('CLIENT RECEIVED NEW REQUEST:', data); // Debug Log

            // Filter incoming requests
            if (!availableBloodGroups.has(data.bloodGroup)) {
                console.log(`Ignoring request for ${data.bloodGroup} - Not in stock.`);
                return;
            }

            setRequests(prev => {
                // Prevent duplicates
                if (prev.some(r => r._id === data._id)) return prev;
                return [data, ...prev];
            });
            toast('🚨 New Emergency Blood Request!', {
                icon: '🩸',
                style: { border: '1px solid #EF4444', color: '#EF4444' }
            });
            const audio = new Audio('/notification.mp3'); // Optional sound
            audio.play().catch(e => console.log('Audio play failed', e));
        });

        // 4. Listen for Taken Requests (Race Condition Sync)
        socket.on('request_taken', (takenId: string) => {
            setRequests(prev => prev.filter(r => r._id !== takenId));
        });

        // Cleanup
        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('new_blood_request');
            socket.off('request_taken');
        };
    }, []);

    // Timer Logic
    useEffect(() => {
        const interval = setInterval(() => {
            const newTimers: { [key: string]: string } = {};
            const now = new Date().getTime();

            setRequests(prevRequests => prevRequests.filter(req => {
                const expiryTime = new Date(req.expiresAt).getTime();
                const distance = expiryTime - now;

                if (distance < 0) return false; // Remove expired

                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                newTimers[req._id] = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
                return true;
            }));

            setTimers(newTimers);
        }, 1000);
        return () => clearInterval(interval);
    }, [requests]);

    const handleApprove = async (id: string) => {
        try {
            const res = await fetch('/api/blood-request/approve', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId: id })
            });

            if (res.ok) {
                toast.success('Request Accepted! 🏆');
                setRequests(prev => prev.filter(r => r._id !== id));
            } else {
                const err = await res.json();
                toast.error(err.message || 'Too Late! Taken by another hospital.');
                setRequests(prev => prev.filter(r => r._id !== id)); // Remove if taken
            }
        } catch (error) {
            toast.error('Connection Error');
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 font-sans">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    </span>
                    Live Emergency Feed
                </h2>
                <span className={`text-xs font-mono px-2 py-1 rounded border ${isConnected ? 'text-green-600 border-green-200 bg-green-50' : 'text-red-600 border-red-200 bg-red-50'}`}>
                    {isConnected ? '⚡ Socket: Connected' : '🔌 Socket: Disconnected'}
                </span>
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {requests.length === 0 && (
                        <div className="text-center py-10 text-slate-400 bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
                            <div className="animate-pulse mb-2 text-2xl">📡</div>
                            <p>Waiting for broadcast...</p>
                            <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
                                Requests only appear if your hospital has matching stock.
                            </p>
                        </div>
                    )}
                    {requests.map((req) => (
                        <motion.div
                            key={req._id}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`border-l-4 p-4 rounded-r-xl shadow-sm bg-slate-50 relative overflow-hidden ${req.urgency === 'Emergency' ? 'border-red-500 bg-red-50/50' :
                                req.urgency === 'Urgent' ? 'border-orange-500 bg-orange-50/50' : 'border-blue-500'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-lg text-slate-900">{req.bloodGroup}</span>
                                        <span className="text-sm text-slate-600">({req.units} Units)</span>
                                        {req.urgency === 'Emergency' && (
                                            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Siren size={10} /> EMERGENCY
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-700 font-medium">📍 {req.patientHospital}</p>
                                    {req.reason && <p className="text-xs text-slate-500 mt-1 italic">"{req.reason}"</p>}
                                </div>

                                <div className="text-right">
                                    <div className={`font-mono text-xl font-bold mb-2 ${parseInt(timers[req._id] || '30') < 5 ? 'text-red-600 animate-pulse' : 'text-slate-700'
                                        }`}>
                                        <Clock size={16} className="inline mr-1 mb-0.5" />
                                        {timers[req._id] || '--:--'}
                                    </div>
                                    <Button
                                        onClick={() => handleApprove(req._id)}
                                        size="sm"
                                        className={`${req.urgency === 'Emergency' ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-900 hover:bg-slate-800'
                                            } text-white shadow-lg shadow-red-200`}
                                    >
                                        Accept & Dispatch
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LiveBloodRequests;
