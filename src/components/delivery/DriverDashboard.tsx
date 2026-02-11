'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Navigation, MapPin, Wallet, Clock,
    ChevronRight, Bell, LayoutGrid, RotateCcw, User, Scan, Package, LogOut, Search, Star, BadgeCheck
} from 'lucide-react';
import OnlineButton from './OnlineButton';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import dynamic from 'next/dynamic';
const QrReader = dynamic(() => import('react-qr-scanner'), { ssr: false });

import { PulseBackground } from './PulseBackground';
import { SwipeToOnline } from './SwipeToOnline';

// Mock Data / Types
interface UserProfile {
    name: string;
    id: string;
    avatar?: string;
    rating: number;
    totalTrips: number;
    joinDate: string;
    vehicleType: string;
    plateNumber: string;
    profilePicture?: string;
    isVerified?: boolean;
}

const LiveMap = dynamic(() => import('./LiveMap'), { ssr: false });

// CountUp Hook
const useCountUp = (end: number, duration: number = 2000) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let startTime: number;
        const animate = (time: number) => {
            if (!startTime) startTime = time;
            const progress = Math.min((time - startTime) / duration, 1);
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(Math.floor(ease * end));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [end, duration]);
    return count;
};

// Stat Card Component (Light Theme)
const StatCard = ({ icon: Icon, label, value, color, delay, bgColor }: any) => {
    const numValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
    const isCurrency = value.includes('₹');
    const shouldAnimate = !isNaN(numValue) && numValue > 0;
    const count = useCountUp(numValue);
    const displayValue = shouldAnimate ? count : value;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}
            transition={{ delay, type: 'spring', stiffness: 300 }}
            className="bg-white p-5 rounded-[1.5rem] border border-zinc-100 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:border-zinc-200 transition-colors"
        >
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                <Icon size={48} />
            </div>
            <div className="flex justify-between items-start mb-3 relative z-10">
                <div className={`p-2 rounded-xl ${bgColor} ${color} bg-opacity-10`}>
                    <Icon size={18} />
                </div>
            </div>
            <div>
                <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider mb-1">{label}</p>
                <h3 className="text-2xl font-bold text-zinc-900 relative z-10 tracking-tight">
                    {isCurrency ? '₹ ' : ''}{shouldAnimate ? displayValue : value}
                </h3>
            </div>
        </motion.div>
    );
};


export default function DriverDashboard() {
    const [isOnline, setIsOnline] = useState(false);
    const [request, setRequest] = useState<any>(null);
    const [activeDelivery, setActiveDelivery] = useState<any>(null);
    const socketRef = React.useRef<any>(null);
    const [verificationInput, setVerificationInput] = useState('');
    const [bloodBagId, setBloodBagId] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const [scannedCode, setScannedCode] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMinimized, setIsMinimized] = useState(false);
    const [manualLocationMode, setManualLocationMode] = useState(false);

    const [profile, setProfile] = useState<UserProfile>({
        name: 'Loading...',
        id: '',
        rating: 5.0,
        totalTrips: 0,
        joinDate: '',
        vehicleType: '',
        plateNumber: '',
        isVerified: false,
        profilePicture: ''
    });
    const [stats, setStats] = useState({ earnings: '₹ 0', trips: 0, hours: '0.0' });
    const [recentTrips, setRecentTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);

    const earningsNum = parseInt(stats.earnings.replace(/[^0-9]/g, '')) || 0;
    const animatedEarnings = useCountUp(earningsNum);

    useEffect(() => {
        startGPS();
        return () => {
            if ((window as any).gpsWatchId) navigator.geolocation.clearWatch((window as any).gpsWatchId);
        };
    }, []);

    useEffect(() => {
        if (currentLocation && activeDelivery && socketRef.current) {
            const deliveryId = activeDelivery._id || activeDelivery.id;
            socketRef.current.emit('update_location', {
                deliveryId,
                location: { lat: currentLocation[0], lng: currentLocation[1] }
            });
        }
    }, [currentLocation, activeDelivery]);

    const startGPS = () => {
        if (!navigator.geolocation) {
            toast.error('GPS Not Supported');
            return;
        }

        const success = (pos: GeolocationPosition) => {
            const { latitude, longitude } = pos.coords;
            setCurrentLocation([latitude, longitude]);
            setManualLocationMode(false);
        };

        const error = async (err: GeolocationPositionError) => {
            console.error('GPS Error:', err);
            if (!window.isSecureContext) {
                setManualLocationMode(true);
            } else {
                try {
                    const res = await fetch('https://ipapi.co/json/');
                    const data = await res.json();
                    if (data.latitude && data.longitude) {
                        setCurrentLocation([data.latitude, data.longitude]);
                    }
                } catch (e) { console.error(e); }
            }
        };

        const options = { enableHighAccuracy: true, maximumAge: 0, timeout: 60000 };
        if ((window as any).gpsWatchId) navigator.geolocation.clearWatch((window as any).gpsWatchId);
        (window as any).gpsWatchId = navigator.geolocation.watchPosition(success, error, options);
    };

    useEffect(() => {
        fetchDriverData();
        checkActiveDelivery();
        const interval = setInterval(() => {
            if (isOnline) checkActiveDelivery();
        }, 5000);
        return () => clearInterval(interval);
    }, [isOnline]);

    const checkActiveDelivery = async () => {
        try {
            const res = await fetch('/api/driver/current-delivery');
            if (res.ok) {
                const data = await res.json();
                if (data.active) setActiveDelivery(data.delivery);
            }
        } catch (e) { console.error(e); }
    };

    const fetchDriverData = async () => {
        try {
            const res = await fetch('/api/driver/me');
            if (res.ok) {
                const data = await res.json();
                setProfile(data.profile);
                setStats(data.stats);
                setRecentTrips(data.recentTrips);
                setIsOnline(data.profile.isOnline);

                if (data.profile.id && !socketRef.current) {
                    const newSocket = io({ path: '/api/socket' });
                    socketRef.current = newSocket;
                    newSocket.on('connect', () => {
                        newSocket.emit('join_driver_room', data.profile.id);
                    });
                    newSocket.on('incoming_request', (requestData) => {
                        setRequest({
                            id: requestData.deliveryId,
                            pickup: requestData.pickup,
                            dropoff: requestData.dropoff,
                            distance: requestData.distance,
                            time: requestData.time,
                            earnings: requestData.earnings,
                            status: 'PROPOSED',
                            deadline: requestData.deadline
                        });
                        const audio = new Audio('/sounds/notification.mp3');
                        audio.play().catch(e => console.log('Audio play failed', e));
                    });
                    newSocket.on('delivery_assigned', (updatedDelivery) => {
                        if (updatedDelivery.driverId === data.profile.id) {
                            setActiveDelivery(updatedDelivery);
                            setRequest(null);
                            toast.success('Delivery Assigned!');
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching driver data', error);
        } finally {
            setLoading(false);
        }
    };

    // Use a ref to track if we are currently toggling to prevent external updates or double-clicks
    const isTogglingRef = useRef(false);

    const toggleOnline = async () => {
        if (loading || isTogglingRef.current) return;

        isTogglingRef.current = true;
        const targetStatus = !isOnline;

        // 1. Optimistic Update immediately
        setIsOnline(targetStatus);

        try {
            let location = null;
            if (targetStatus) {
                try {
                    // Short timeout for location to keep UI snappy
                    location = await new Promise<{ lat: number, lng: number } | null>((resolve) => {
                        if (!navigator.geolocation) resolve(null);
                        navigator.geolocation.getCurrentPosition(
                            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                            (err) => resolve(null),
                            { enableHighAccuracy: false, timeout: 3000 }
                        );
                    });
                } catch (e) { console.warn('Loc failed', e); }
            }

            const res = await fetch('/api/driver/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: targetStatus ? 'ONLINE' : 'OFFLINE',
                    location: location || { lat: 28.6139, lng: 77.2090 }
                })
            });

            if (!res.ok) throw new Error('Failed');

            toast.success(targetStatus ? 'You are now ONLINE' : 'You are now OFFLINE');
        } catch (error) {
            // Revert on failure
            setIsOnline(!targetStatus);
            toast.error('Connection Failed');
        } finally {
            // Add a small delay before allowing interactions again
            setTimeout(() => {
                isTogglingRef.current = false;
            }, 1000);
        }
    };

    const simulateIncomingRequest = () => {
        setRequest({
            id: 'mock_req_123',
            pickup: { address: 'City Hospital, Delhi', location: { type: 'Point', coordinates: [77.2090, 28.6139] } },
            dropoff: { address: 'Sector 62, Noida', location: { type: 'Point', coordinates: [77.3639, 28.6208] } },
            distance: '12 km', time: '25 min', earnings: '₹ 250', status: 'ASSIGNED'
        });
    };

    const acceptRequest = async () => {
        if (!request || !profile) return;
        toast.loading('Accepting...', { id: 'accept-req' });
        try {
            const res = await fetch('/api/delivery/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deliveryId: request.id, driverId: (profile as any).id })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Confirmed!', { id: 'accept-req' });
                setActiveDelivery(data.delivery);
                setRequest(null);
            } else {
                toast.error(data.message || 'Failed', { id: 'accept-req' });
            }
        } catch (error) { toast.error('Network Error', { id: 'accept-req' }); }
    };

    const declineRequest = async () => {
        if (!request) return;
        setRequest(null);
        await fetch('/api/delivery/reject', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deliveryId: request.id, reason: 'manual_decline' })
        });
        toast.success('Declined');
    };

    const handleVerification = async () => {
        if (!activeDelivery) return;
        const isPickupPhase = activeDelivery.status === 'ASSIGNED';
        const endpoint = isPickupPhase ? '/api/delivery/verify/pickup' : '/api/delivery/verify/dropoff';
        try {
            const deliveryId = activeDelivery._id || activeDelivery.id;
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deliveryId, code: verificationInput, bloodBagId })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                setVerificationInput('');
                if (isPickupPhase) {
                    setActiveDelivery({ ...activeDelivery, status: 'PICKED_UP' });
                    socketRef.current?.emit('status_change', { deliveryId, status: 'PICKED_UP' });
                } else {
                    setActiveDelivery(null);
                    fetchDriverData();
                    socketRef.current?.emit('status_change', { deliveryId, status: 'DELIVERED' });
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) { console.error(error); }
    };

    if (loading) return <div className="h-screen bg-gray-50 flex items-center justify-center text-zinc-400 font-bold animate-pulse">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 text-zinc-900 font-sans flex flex-col relative selection:bg-rose-500/20 pt-24">

            {/* Light Theme Background Blobs */}
            <PulseBackground isOnline={isOnline} />

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 pb-32 px-6">

                {/* 0. ULTIMATE "VITALITY" PROFILE CARD (Red-Tech Aesthetic) */}
                <motion.div
                    initial={{ y: -30, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: "spring", duration: 0.8, bounce: 0.3 }}
                    className="relative w-full group isolate perspective-1000 mb-10"
                >
                    <div className="absolute inset-0 bg-rose-500/5 rounded-[2.5rem] blur-xl transform translate-y-4 scale-95 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-gradient-to-br from-white/80 via-white/50 to-rose-50/40 backdrop-blur-3xl shadow-[0_20px_50px_-12px_rgba(225,29,72,0.15)] p-8 md:p-10 transition-all duration-500 hover:shadow-[0_30px_60px_-12px_rgba(225,29,72,0.25)]">

                        {/* Dynamic Background Flow */}
                        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                            <motion.div
                                className="absolute -top-[50%] -left-[20%] w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.08),transparent_70%)]"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                            />
                            <motion.div
                                className="absolute top-[20%] right-[10%] w-64 h-64 bg-rose-400/10 rounded-full blur-3xl mix-blend-multiply"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <motion.div
                                className="absolute bottom-[10%] left-[20%] w-80 h-80 bg-orange-400/10 rounded-full blur-3xl mix-blend-multiply"
                                animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 1.3] }}
                                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            />
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-10">

                            {/* LEFT: Hero Avatar with Pulse Ring */}
                            <div className="relative shrink-0 group/avatar cursor-pointer">
                                {/* Rotating Ring */}
                                <div className="absolute inset-[-4px] rounded-full border-2 border-transparent border-t-rose-400/60 border-r-orange-400/60 animate-[spin_8s_linear_infinite] pointer-events-none" />
                                <div className="absolute inset-[-4px] rounded-full border-2 border-transparent border-b-rose-400/30 border-l-orange-400/30 animate-[spin_8s_linear_infinite_reverse] pointer-events-none" />

                                <div className="w-32 h-32 rounded-full p-2 bg-white shadow-xl shadow-rose-900/5 relative overflow-hidden ring-1 ring-black/5">
                                    <div className="w-full h-full rounded-full overflow-hidden relative bg-zinc-100">
                                        {profile.profilePicture ? (
                                            <motion.img
                                                whileHover={{ scale: 1.15 }}
                                                transition={{ duration: 0.5 }}
                                                src={profile.profilePicture}
                                                alt={profile.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                                <User size={56} strokeWidth={1.5} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Glass Online Indicator */}
                                    <div className="absolute bottom-1 right-1">
                                        <div className="relative flex items-center justify-center w-8 h-8">
                                            {isOnline && <span className="absolute w-full h-full bg-emerald-400/30 rounded-full animate-ping" />}
                                            <div className={`w-5 h-5 rounded-full border-[3px] border-white shadow-sm flex items-center justify-center ${isOnline ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-zinc-400'}`}>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {profile.isVerified && (
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="absolute -top-2 -right-2 bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-2 rounded-full border-4 border-white shadow-lg z-20"
                                    >
                                        <BadgeCheck size={18} strokeWidth={3} />
                                    </motion.div>
                                )}
                            </div>

                            {/* MIDDLE: Identity & Metrics */}
                            <div className="flex-1 text-center md:text-left w-full">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="mb-6 space-y-1"
                                >
                                    <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                                        <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-800 to-rose-900 tracking-tight">
                                            {profile.name}
                                        </h2>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-4 text-sm font-semibold text-zinc-500">
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 rounded-full text-rose-700 border border-rose-100">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                            {profile.vehicleType}
                                        </span>
                                        <span className="text-zinc-400 ml-1">Member since {new Date(profile.joinDate || Date.now()).getFullYear()}</span>
                                    </div>
                                </motion.div>

                                {/* Holographic Stats Grid */}
                                <div className="grid grid-cols-3 gap-3 md:max-w-md">
                                    {[
                                        { label: 'Plate', value: profile.plateNumber, icon: Scan, color: 'text-zinc-600', bg: 'bg-zinc-50' },
                                        { label: 'Rating', value: profile.rating, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', fill: true },
                                        { label: 'Trips', value: profile.totalTrips, icon: Navigation, color: 'text-blue-500', bg: 'bg-blue-50' }
                                    ].map((stat, idx) => (
                                        <motion.div
                                            key={stat.label}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 + (idx * 0.1) }}
                                            whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
                                            className="flex flex-col items-center justify-center py-3 bg-white/60 rounded-2xl border border-white/80 shadow-sm backdrop-blur-sm group/card cursor-default relative overflow-hidden"
                                        >
                                            <div className={`absolute top-0 right-0 p-1.5 opacity-20 group-hover/card:opacity-100 transition-opacity ${stat.color}`}>
                                                <stat.icon size={12} fill={stat.fill ? "currentColor" : "none"} />
                                            </div>
                                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-0.5">{stat.label}</span>
                                            <span className={`text-base font-bold ${stat.color.replace('text-', 'text-opacity-80 group-hover/card:text-')}`}>
                                                {stat.value}
                                            </span>
                                            <div className={`absolute bottom-0 left-0 h-1 bg-current opacity-0 group-hover/card:opacity-100 transition-opacity w-full ${stat.color}`} />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* RIGHT: Magnetic Actions */}
                            <div className="flex flex-row md:flex-col gap-4 pl-0 md:pl-8 md:border-l border-rose-100/50">
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -12px rgba(244,63,94,0.4)" }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={simulateIncomingRequest}
                                    className="w-16 h-16 rounded-[1.2rem] bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-200 relative overflow-hidden group/btn"
                                    title="Simulate Request"
                                >
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
                                    <Bell size={28} className="drop-shadow-md" fill="currentColor" />
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => startGPS()}
                                    className="w-16 h-16 rounded-[1.2rem] bg-white text-zinc-600 flex items-center justify-center shadow-lg shadow-zinc-100 border border-white/80 relative overflow-hidden group/btn"
                                    title="Update GPS"
                                >
                                    <div className="absolute inset-0 bg-zinc-50 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                    <Navigation size={28} className="relative z-10 group-hover/btn:text-indigo-600 transition-colors" />
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. CUSTOM ONLINE BUTTON */}
                <div className="flex justify-center mb-8">
                    <OnlineButton isOnline={isOnline} toggleOnline={toggleOnline} />
                </div>

                {/* 2. STATS (Premium Glass Grid) */}
                <AnimatePresence>
                    {isOnline && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="grid grid-cols-2 gap-5 mb-8"
                        >
                            {/* TOTAL EARNINGS (Large, Dark Premium Card) */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                whileHover={{ scale: 1.02, y: -4, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)" }}
                                className="col-span-2 relative overflow-hidden rounded-[2.5rem] bg-zinc-900 p-8 shadow-2xl text-white group isolate min-h-[220px] flex flex-col justify-between"
                            >
                                {/* Livable Background Animation */}
                                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-rose-950 z-0" />
                                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.15)_0%,transparent_50%)] animate-[spin_10s_linear_infinite] opacity-50 blur-3xl" />
                                <div className="absolute bottom-[-50%] right-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,transparent_50%)] animate-[spin_15s_linear_infinite_reverse] opacity-50 blur-3xl" />

                                {/* Floating 3D Elements */}
                                <div className="absolute top-4 right-4 p-4 opacity-20 group-hover:opacity-40 transition-opacity duration-700 transform group-hover:scale-110 group-hover:-rotate-12">
                                    <Wallet size={140} className="text-rose-500" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                                                <Wallet size={20} className="text-white" />
                                            </div>
                                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Total Earnings</p>
                                        </div>
                                        <div className="bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-2">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </span>
                                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live Updates</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 mt-auto">
                                    <h3 className="text-6xl font-black tracking-tighter flex items-center gap-2">
                                        <span className="text-4xl text-zinc-500 font-bold mb-2">₹</span>
                                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-rose-100 to-white animate-text-shimmer bg-[length:200%_auto]">
                                            {animatedEarnings}
                                        </span>
                                    </h3>
                                    {/* Removed mock "vs yesterday" data */}
                                </div>
                            </motion.div>

                            {/* TOTAL TRIPS (Glass Card) */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1, type: "spring" }}
                                whileHover={{ scale: 1.05 }}
                                className="relative bg-white p-6 rounded-[2rem] shadow-lg border border-zinc-100 flex flex-col items-start justify-between min-h-[160px] group overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-50" />
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 rounded-full blur-2xl group-hover:bg-blue-200 transition-colors" />

                                <div className="relative p-2 bg-blue-100/50 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                                    <Navigation className="text-blue-600" size={24} />
                                </div>
                                <div className="relative">
                                    <h4 className="text-3xl font-black text-zinc-900">{stats.trips}</h4>
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Total Trips</p>
                                </div>
                            </motion.div>

                            {/* HOURS ONLINE (Glass Card) */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                whileHover={{ scale: 1.05 }}
                                className="relative bg-white p-6 rounded-[2rem] shadow-lg border border-zinc-100 flex flex-col items-start justify-between min-h-[160px] group overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-50" />
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-100 rounded-full blur-2xl group-hover:bg-amber-200 transition-colors" />

                                <div className="relative p-2 bg-amber-100/50 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                                    <Clock className="text-amber-600" size={24} />
                                </div>
                                <div className="relative">
                                    <h4 className="text-3xl font-black text-zinc-900">{stats.hours}</h4>
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Hours Online</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 3. RECENT ACTIVITY (Staggered List) */}
                <div className="mb-6 flex justify-between items-end px-2">
                    <h2 className="text-xl font-black text-zinc-900 tracking-tight">Recent Activity</h2>
                    <motion.button
                        whileHover={{ x: 5 }}
                        className="text-sm text-rose-600 font-bold flex items-center gap-1"
                    >
                        View All <ChevronRight size={16} />
                    </motion.button>
                </div>

                <div className="space-y-3 pb-24">
                    {recentTrips.length === 0 && (
                        <div className="text-center py-12">
                            <div className="bg-zinc-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Search size={24} className="text-zinc-400" />
                            </div>
                            <p className="text-sm font-semibold text-zinc-500">No recent activity</p>
                        </div>
                    )}
                    {recentTrips.map((trip, i) => (
                        <motion.div
                            key={trip.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            whileHover={{ scale: 1.02, backgroundColor: '#ffffff' }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white border border-zinc-100 p-4 rounded-3xl flex items-center justify-between shadow-sm cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-zinc-50 p-3 rounded-2xl text-zinc-500">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-zinc-900">{trip.to}</h4>
                                    <p className="text-xs text-zinc-500 font-medium">{trip.time}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block font-extrabold text-emerald-600">{trip.earn}</span>
                                <span className="text-[10px] text-zinc-400 font-bold uppercase">{trip.status}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div >

            {/* --- MINIMIZED ACTIVE DELIVERY (Floating) --- */}
            <AnimatePresence>
                {
                    activeDelivery && isMinimized && (
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            onClick={() => setIsMinimized(false)}
                            className="fixed bottom-24 left-6 right-6 z-40 bg-zinc-900 text-white p-4 rounded-[1.5rem] shadow-2xl flex items-center justify-between cursor-pointer ring-4 ring-white/50"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center animate-pulse">
                                    <Navigation size={24} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase mb-0.5">Current Mission</p>
                                    <h4 className="text-sm font-bold">In Progress</h4>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-zinc-500 -rotate-90" />
                        </motion.div>
                    )
                }
            </AnimatePresence >

            {/* --- BOTTOM NAV (Wide Dark Premium Island) --- */}
            <div className="fixed bottom-6 left-6 right-6 top-auto z-40 flex justify-center pointer-events-none">
                <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-2 pl-8 pr-8 flex items-center justify-between shadow-2xl ring-1 ring-black/5 pointer-events-auto w-full max-w-2xl relative overflow-visible group">

                    {/* Ambient Glow behind navbar */}
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 via-transparent to-blue-500/20 blur-3xl -z-10 rounded-[2.5rem]" />

                    {['dashboard', 'activity', 'wallet', 'profile'].map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); }}
                                className={`relative w-16 h-16 rounded-[2rem] flex flex-col items-center justify-center transition-all duration-500 ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-0 bg-rose-600 rounded-[2rem] shadow-[0_8px_16px_rgba(225,29,72,0.4)]"
                                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                    >
                                        {/* Inner gloss effect for premium feel */}
                                        <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/20 to-transparent rounded-t-[2rem]" />
                                    </motion.div>
                                )}

                                <div className="relative z-10 flex flex-col items-center gap-1">
                                    <motion.div
                                        animate={isActive ? {
                                            y: [0, -6, 0],
                                            scale: [1, 1.25, 1],
                                            filter: ["drop-shadow(0 0 0 rgba(0,0,0,0))", "drop-shadow(0 4px 12px rgba(0,0,0,0.5))", "drop-shadow(0 0 0 rgba(0,0,0,0))"]
                                        } : {}}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                    >
                                        {tab === 'dashboard' && <LayoutGrid size={26} strokeWidth={isActive ? 2.5 : 2} />}
                                        {tab === 'activity' && <RotateCcw size={26} strokeWidth={isActive ? 2.5 : 2} />}
                                        {tab === 'wallet' && <Wallet size={26} strokeWidth={isActive ? 2.5 : 2} />}
                                        {tab === 'profile' && <User size={26} strokeWidth={isActive ? 2.5 : 2} />}
                                    </motion.div>
                                </div>

                                {tab === 'activity' && !isActive && (
                                    <span className="absolute top-4 right-4 w-2 h-2 bg-rose-500 rounded-full animate-ping ring-2 ring-zinc-900 opacity-75" />
                                )}
                                {tab === 'activity' && !isActive && (
                                    <span className="absolute top-4 right-4 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-zinc-900" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* --- REQUEST OVERLAY (Premium Acceptance Modal - No Tilt) --- */}
            <AnimatePresence>
                {request && (
                    <motion.div
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-x-0 bottom-0 z-50 p-4 pb-24 flex items-end justify-center pointer-events-none"
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl pointer-events-auto" onClick={() => { }} />

                        <motion.div
                            layoutId="request-card"
                            className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-[0_0_100px_rgba(244,63,94,0.4)] overflow-hidden pointer-events-auto border border-white/20"
                        >
                            {/* Header / Map Area Placeholder */}
                            <div className="h-40 bg-zinc-100 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/77.2090,28.6139,13,0/600x300?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJja2xsIn0.Opz')] bg-cover bg-center opacity-50 grayscale" />
                                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />

                                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-zinc-100 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                    <span className="text-xs font-black text-rose-500 uppercase tracking-widest">New Priority Request</span>
                                </div>
                                <div className="absolute top-6 right-6 bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg font-black text-sm">
                                    Active
                                </div>
                            </div>

                            <div className="p-8 -mt-10 relative z-10 bg-white rounded-t-[3rem]">
                                {/* Price & Distance Row */}
                                <div className="flex justify-between items-end mb-8 border-b border-zinc-100 pb-6">
                                    <div>
                                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Estimated Earnings</p>
                                        <h2 className="text-5xl font-black text-zinc-900 tracking-tighter">
                                            <span className="text-3xl text-zinc-400 align-top mr-1">₹</span>{request.earnings}
                                        </h2>
                                    </div>
                                    <div className="text-right">
                                        <div className="bg-zinc-100 px-4 py-2 rounded-2xl mb-2 inline-block">
                                            <span className="text-zinc-900 font-bold">{request.distance}</span>
                                        </div>
                                        <p className="text-zinc-400 text-xs font-bold">{request.time} away</p>
                                    </div>
                                </div>

                                {/* Timeline Visual */}
                                <div className="relative pl-8 mb-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-zinc-300 before:to-zinc-100 before:border-l before:border-dashed before:border-zinc-300">
                                    <div className="relative">
                                        <div className="absolute -left-[38px] w-6 h-6 rounded-full border-4 border-white bg-zinc-900 shadow-md ml-1" />
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Pick Up</p>
                                        <h4 className="text-lg font-bold text-zinc-900 leading-tight">{request.pickup.address}</h4>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -left-[38px] w-6 h-6 rounded-full border-4 border-white bg-rose-500 shadow-md ml-1" />
                                        <p className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">Drop Off</p>
                                        <h4 className="text-lg font-bold text-zinc-900 leading-tight">{request.dropoff.address}</h4>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-4">
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={declineRequest}
                                        className="py-5 rounded-[2rem] bg-zinc-100 text-zinc-500 font-bold text-lg hover:bg-zinc-200 transition-colors"
                                    >
                                        Decline
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={acceptRequest}
                                        className="py-5 rounded-[2rem] bg-zinc-900 text-white font-bold text-lg hover:bg-zinc-800 transition-colors shadow-xl shadow-zinc-900/20 relative overflow-hidden"
                                    >
                                        <span className="relative z-10">Accept Order</span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- ACTIVE DELIVERY (Real Map + Light UI) --- */}
            {
                activeDelivery && !isMinimized && (
                    <motion.div layoutId="active-delivery-overlay" className="fixed inset-0 z-50 bg-white flex flex-col">
                        <div className="flex-1 bg-zinc-100 relative">
                            <LiveMap
                                driverLocation={currentLocation || [28.6139, 77.2090]}
                                destination={
                                    activeDelivery.status === 'ASSIGNED'
                                        ? (activeDelivery.pickup.location?.coordinates ? [activeDelivery.pickup.location.coordinates[1], activeDelivery.pickup.location.coordinates[0]] : [28.6139, 77.2090])
                                        : (activeDelivery.dropoff.location?.coordinates ? [activeDelivery.dropoff.location.coordinates[1], activeDelivery.dropoff.location.coordinates[0]] : [28.6139, 77.2090])
                                }
                                draggable={manualLocationMode}
                                onDragEnd={(lat, lng) => { setCurrentLocation([lat, lng]); toast.success('Location Updated'); }}
                                onMapClick={(lat, lng) => { if (manualLocationMode) { setCurrentLocation([lat, lng]); toast.success('Location Set'); } }}
                            />

                            {manualLocationMode && (
                                <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-600 px-4 py-1 rounded-full text-xs font-bold border border-amber-200 shadow-lg z-[400]">
                                    Dev Mode: Drag Marker
                                </div>
                            )}

                            <div className="absolute top-6 left-6 right-6 flex justify-between z-[400]">
                                <div className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-full text-sm font-bold shadow-lg text-zinc-800 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                    {activeDelivery.status === 'ASSIGNED' ? 'Heading to Pickup' : 'Heading to Dropoff'}
                                </div>
                                <button onClick={() => setIsMinimized(true)} className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg text-zinc-500 hover:text-zinc-900">
                                    <ChevronRight size={20} className="rotate-90" />
                                </button>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-t-[2.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.1)]">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex-1 pr-4">
                                    <h3 className="text-2xl font-extrabold text-zinc-900 leading-tight mb-1">
                                        {activeDelivery.status === 'ASSIGNED'
                                            ? (typeof activeDelivery.pickup === 'string' ? activeDelivery.pickup : activeDelivery.pickup.address)
                                            : (typeof activeDelivery.dropoff === 'string' ? activeDelivery.dropoff : activeDelivery.dropoff.address)
                                        }
                                    </h3>
                                    <p className="text-zinc-500 text-sm font-medium">
                                        {activeDelivery.status === 'ASSIGNED' ? 'Navigate to Hospital' : 'Navigate to Donor'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        const dest = activeDelivery.status === 'ASSIGNED' ? activeDelivery.pickup : activeDelivery.dropoff;
                                        const address = typeof dest === 'string' ? dest : dest.address;
                                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank');
                                    }}
                                    className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-xl active:scale-95 transition-all"
                                >
                                    <Navigation size={28} />
                                </button>
                            </div>

                            {activeDelivery.status === 'ASSIGNED' && (
                                <div className="mb-6">
                                    <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-3 tracking-wider">Step 1: Bag Verification</label>
                                    <div className="relative flex items-center gap-3">
                                        <input
                                            type="text" placeholder="Scan Bag ID (e.g. BAG-123)"
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 pl-12 text-zinc-900 font-bold focus:border-rose-500 focus:outline-none transition-all placeholder:text-zinc-400"
                                            value={bloodBagId} onChange={(e) => setBloodBagId(e.target.value)}
                                        />
                                        <Package size={20} className="absolute left-4 text-zinc-400" />
                                        <button className="bg-zinc-100 p-4 rounded-2xl text-zinc-600 hover:bg-zinc-200" onClick={() => setShowScanner(true)}>
                                            <Scan size={24} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <label className="text-xs text-zinc-400 uppercase font-bold block mb-2">
                                {activeDelivery.status === 'ASSIGNED' ? 'Step 2: Pickup Code' : 'Dropoff Code'}
                            </label>
                            <div className="relative mb-6">
                                <input
                                    type="text" pattern="\d*" maxLength={4} placeholder="• • • •"
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-center text-3xl font-mono font-bold tracking-[1em] text-zinc-900 focus:border-rose-500 focus:outline-none"
                                    value={verificationInput} onChange={(e) => setVerificationInput(e.target.value.replace(/\D/g, ''))}
                                />
                            </div>

                            <button onClick={handleVerification} className="w-full bg-rose-600 py-5 rounded-3xl font-bold text-white shadow-lg shadow-rose-200 active:scale-95 transition-transform">
                                {activeDelivery.status === 'ASSIGNED' ? 'Verify Pickup' : 'Complete Mission'}
                            </button>
                        </div>

                        {/* QR SCANNER (Fullscreen) */}
                        <AnimatePresence>
                            {showScanner && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[600] bg-black flex flex-col">
                                    <div className="p-6 flex justify-between items-center bg-black">
                                        <h3 className="text-white font-bold text-lg">Scan Barcode</h3>
                                        <button onClick={() => setShowScanner(false)} className="p-2 bg-zinc-800 rounded-full text-white"><LogOut size={20} /></button>
                                    </div>
                                    <div className="flex-1 relative overflow-hidden bg-zinc-900">
                                        <QrReader
                                            delay={500} onError={() => { }}
                                            onScan={(data: any) => {
                                                if (data?.text && data.text !== scannedCode) {
                                                    setScannedCode(data.text);
                                                    toast.success("Code Found!");
                                                }
                                            }}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            constraints={{ video: { facingMode } }}
                                        />
                                        {scannedCode && (
                                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-8">
                                                <div className="bg-white p-6 rounded-3xl text-center w-full">
                                                    <p className="text-xs font-bold text-zinc-400 uppercase mb-2">Detected</p>
                                                    <h2 className="text-3xl font-mono font-bold text-zinc-900 mb-6">{scannedCode}</h2>
                                                    <div className="flex gap-3">
                                                        <button onClick={() => setScannedCode(null)} className="flex-1 py-3 bg-zinc-100 rounded-xl font-bold">Retry</button>
                                                        <button onClick={() => { setBloodBagId(scannedCode); setShowScanner(false); setScannedCode(null); }} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold">Confirm</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )
            }
        </div >
    );
}
