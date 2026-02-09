'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Power, Navigation, MapPin, Wallet, Clock,
    ChevronRight, Bell, Menu, LayoutGrid, RotateCcw, User, Scan, Package, LogOut
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client'; // Import Socket.IO
import dynamic from 'next/dynamic';
const QrReader = dynamic(() => import('react-qr-scanner'), { ssr: false });

const LiveMap = dynamic(() => import('./LiveMap'), { ssr: false });


export default function DriverDashboard() {
    const [isOnline, setIsOnline] = useState(false);
    const [request, setRequest] = useState<any>(null);
    const [activeDelivery, setActiveDelivery] = useState<any>(null);
    const socketRef = React.useRef<any>(null); // [FIX] Add Socket Ref
    const [verificationInput, setVerificationInput] = useState('');
    const [bloodBagId, setBloodBagId] = useState('');
    const [showScanner, setShowScanner] = useState(false); // Scanner Modal State
    const [scannedCode, setScannedCode] = useState<string | null>(null); // New state for confirmation
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment'); // Camera State
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMinimized, setIsMinimized] = useState(false);
    const [manualLocationMode, setManualLocationMode] = useState(false);

    // Real Data State
    const [profile, setProfile] = useState({ name: 'Loading...', email: '' });
    const [stats, setStats] = useState({ earnings: '₹ 0', trips: 0, hours: '0.0' });
    const [recentTrips, setRecentTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);

    // Watch GPS Position content
    useEffect(() => {
        // We will trigger this manually or via a separate 'init' function to allow user gesture if needed
        startGPS();
        return () => {
            if ((window as any).gpsWatchId) navigator.geolocation.clearWatch((window as any).gpsWatchId);
        };
    }, []);

    // [FIX] Broadcast changes to currentLocation
    useEffect(() => {
        if (currentLocation && activeDelivery && socketRef.current) {
            const deliveryId = activeDelivery._id || activeDelivery.id;
            console.log('[GPS] Broadcasting Update:', currentLocation);
            socketRef.current.emit('update_location', {
                deliveryId,
                location: { lat: currentLocation[0], lng: currentLocation[1] }
            });
        }
    }, [currentLocation, activeDelivery]);

    const startGPS = () => {
        if (!navigator.geolocation) {
            toast.error('GPS Not Supported on this device');
            return;
        }

        toast.loading('Requesting Location Access...', { id: 'gps-search' });

        const success = (pos: GeolocationPosition) => {
            const { latitude, longitude } = pos.coords;
            const newLoc: [number, number] = [latitude, longitude];
            setCurrentLocation(newLoc);
            setManualLocationMode(false);

            // [FIX] Broadcast Location to Server if Active Delivery
            if (activeDelivery && (activeDelivery._id || activeDelivery.id)) {
                // We need to access the socket instance. 
                // Since socket is initialized inside fetchDriverData (scoped), we should probably move socket to a ref or state.
                // OR: easier way, just re-emit using a broader scope socket variable if available.
                // The current component structure defines socket inside `fetchDriverData`. This is a problem.
                // I need to refactor `socket` to be a component-level state or ref.
            }
            toast.success(`GPS Locked! Accuracy: ${Math.round(pos.coords.accuracy)}m`, { id: 'gps-search' });
        };

        const error = async (err: GeolocationPositionError) => {
            console.error('GPS Error:', err);
            let specificError = '';
            switch (err.code) {
                case err.PERMISSION_DENIED: specificError = 'Permission Denied. Please enable Location in Settings.'; break;
                case err.POSITION_UNAVAILABLE: specificError = 'Signal Weak. Move outdoors.'; break;
                case err.TIMEOUT: specificError = 'GPS Timeout.'; break;
                default: specificError = err.message;
            }

            if (!window.isSecureContext) {
                toast.error("HTTPS Required for GPS.", { id: 'gps-search' });
                setManualLocationMode(true);
            } else {
                toast.error(`GPS Failed: ${specificError}`, { id: 'gps-search', duration: 5000 });

                // IP Fallback
                try {
                    const res = await fetch('https://ipapi.co/json/');
                    const data = await res.json();
                    if (data.latitude && data.longitude) {
                        setCurrentLocation([data.latitude, data.longitude]);
                        toast.success(`Using Approximate Location (${data.city})`, { id: 'gps-search' });
                    }
                } catch (e) { console.error(e); }
            }
        };

        const options = { enableHighAccuracy: true, maximumAge: 0, timeout: 60000 };

        // Use global var to track watch ID for cleanup
        if ((window as any).gpsWatchId) navigator.geolocation.clearWatch((window as any).gpsWatchId);
        (window as any).gpsWatchId = navigator.geolocation.watchPosition(success, error, options);
    };

    // Fetch Data on Load & Poll for Requests
    useEffect(() => {
        fetchDriverData();
        checkActiveDelivery();

        const interval = setInterval(() => {
            if (isOnline) checkActiveDelivery();
        }, 5000); // Poll every 5s for new assignments

        return () => clearInterval(interval);
    }, [isOnline]);

    const checkActiveDelivery = async () => {
        try {
            const res = await fetch('/api/driver/current-delivery');
            if (res.ok) {
                const data = await res.json();
                if (data.active) {
                    // Normalize data structure if needed
                    setActiveDelivery(data.delivery);
                }
            }
        } catch (e) {
            console.error(e);
        }
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

                // Initialize Socket for Real-Time Requests
                if (data.profile.id && !socketRef.current) {
                    const newSocket = io({ path: '/api/socket' });
                    socketRef.current = newSocket; // Store in Ref

                    newSocket.on('connect', () => {
                        console.log('Driver Socket Connected:', newSocket.id);
                        console.log('Joining Driver Room:', data.profile.id);
                        newSocket.emit('join_driver_room', data.profile.id);

                        // Also join delivery room if active?
                        // Actually server logic relies on 'update_location' which targets the room.
                        // Driver doesn't need to join delivery room to emit, just needs to emit TO server.
                    });

                    newSocket.on('incoming_request', (requestData) => {
                        console.log('Received Delivery Proposal:', requestData);
                        // Convert to UI format
                        setRequest({
                            id: requestData.deliveryId,
                            pickup: requestData.pickup,
                            dropoff: requestData.dropoff,
                            distance: requestData.distance,
                            time: requestData.time,
                            earnings: requestData.earnings,
                            status: 'PROPOSED', // New Status logic for UI
                            deadline: requestData.deadline
                        });
                        // Play Sound or Vibrate here if needed
                        const audio = new Audio('/sounds/notification.mp3');
                        audio.play().catch(e => console.log('Audio play failed', e));
                    });

                    // Also listen for assignment confirmation (Dual check)
                    newSocket.on('delivery_assigned', (updatedDelivery) => {
                        if (updatedDelivery.driverId === data.profile.id) {
                            setActiveDelivery(updatedDelivery);
                            setRequest(null);
                            toast.success('Delivery Assigned! Start Pickup.');
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

    const toggleOnline = async () => {
        const newStatus = !isOnline ? 'ONLINE' : 'OFFLINE';

        // Helper to get location
        const getLocation = (): Promise<{ lat: number, lng: number } | null> => {
            return new Promise((resolve) => {
                if (!navigator.geolocation) resolve(null);
                navigator.geolocation.getCurrentPosition(
                    (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                    (err) => {
                        console.error(err);
                        resolve(null); // Fallback or handle error
                    },
                    { enableHighAccuracy: true, timeout: 60000, maximumAge: 0 }
                );
            });
        };

        let location = null;
        if (newStatus === 'ONLINE') {
            toast.loading('Acquiring Location...', { id: 'loc-load' });
            location = await getLocation();
            toast.dismiss('loc-load');

            // Fallback for Dev if blocked/failed: Delhi
            if (!location) location = { lat: 28.6139, lng: 77.2090 };
        }

        // Optimistic update
        setIsOnline(!isOnline);

        try {
            const res = await fetch('/api/driver/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, location })
            });

            if (res.ok) {
                toast.success(newStatus === 'ONLINE' ? 'You are now ONLINE' : 'You are now OFFLINE');
            } else {
                toast.error('Failed to update status');
                setIsOnline(isOnline); // Revert
            }
        } catch (error) {
            toast.error('Network Error');
            setIsOnline(isOnline);
        }
    };

    // --- BUTTON HANDLERS ---

    // Simulate Request (Dev Tool)
    const simulateIncomingRequest = () => {
        // Updated with proper GeoJSON structure for Map compatibility
        setRequest({
            id: 'mock_req_123',
            pickup: {
                address: 'City Hospital, Delhi',
                location: { type: 'Point', coordinates: [77.2090, 28.6139] } // [lng, lat]
            },
            dropoff: {
                address: 'Sector 62, Noida',
                location: { type: 'Point', coordinates: [77.3639, 28.6208] }
            },
            distance: '12 km',
            time: '25 min',
            earnings: '₹ 250',
            status: 'ASSIGNED'
        });
    };

    const acceptRequest = async () => {
        if (!request || !profile) return;
        toast.loading('Accepting Delivery...', { id: 'accept-req' });

        try {
            const res = await fetch('/api/delivery/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deliveryId: request.id, driverId: (profile as any).id })
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('Confirmed! Navigate to Pickup.', { id: 'accept-req' });
                setActiveDelivery(data.delivery);
                setRequest(null);
            } else {
                toast.error(data.message || 'Accept Failed', { id: 'accept-req' });
                if (data.message === 'Offer expired') setRequest(null);
            }
        } catch (error) {
            toast.error('Network Error', { id: 'accept-req' });
        }
    };

    const declineRequest = async () => {
        if (!request) return;
        setRequest(null); // Optimistic remove

        try {
            await fetch('/api/delivery/reject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deliveryId: request.id, reason: 'manual_decline' })
            });
            toast.success('Offer Declined');
        } catch (error) {
            console.error(error);
        }
    };

    const handleVerification = async () => {
        if (!activeDelivery) return;

        const isPickupPhase = activeDelivery.status === 'ASSIGNED';
        const endpoint = isPickupPhase ? '/api/delivery/verify/pickup' : '/api/delivery/verify/dropoff';

        try {
            // Support both simulated ID and real _id
            const deliveryId = activeDelivery._id || activeDelivery.id;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deliveryId, code: verificationInput, bloodBagId }) // Send Bag ID
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(data.message);
                setVerificationInput('');

                if (isPickupPhase) {
                    // Update Local State to Next Phase
                    setActiveDelivery({ ...activeDelivery, status: 'PICKED_UP' });

                    // [FIX] Emit Status Change
                    if (socketRef.current) {
                        socketRef.current.emit('status_change', {
                            deliveryId: activeDelivery._id || activeDelivery.id,
                            status: 'PICKED_UP'
                        });
                    }
                } else {
                    // Completed
                    setActiveDelivery(null);
                    fetchDriverData(); // Refresh stats

                    // [FIX] Emit Status Change
                    if (socketRef.current) {
                        socketRef.current.emit('status_change', {
                            deliveryId: activeDelivery._id || activeDelivery.id,
                            status: 'DELIVERED'
                        });
                    }
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Verification failed');
            console.error(error);
        }
    };

    if (loading) return <div className="h-screen bg-slate-950 flex items-center justify-center text-white">Loading Dashboard...</div>;

    return (
        <div className="h-screen bg-slate-950 text-white font-sans overflow-hidden flex flex-col relative">

            {/* --- TOP BAR (Glassmorphism) --- */}
            <div className="absolute top-0 w-full z-20 px-6 pt-12 pb-4 flex justify-between items-center bg-gradient-to-b from-slate-900/90 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden">
                        <User size={20} className="text-slate-400" />
                    </div>
                    <div>
                        <h1 className="font-bold text-sm text-slate-200">Welcome Back</h1>
                        <p className="text-xs text-slate-500">{profile.name}</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => startGPS()}
                        className="p-2 bg-slate-800/50 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 backdrop-blur-md transition-colors"
                        title="Refresh GPS"
                    >
                        <Navigation size={20} />
                    </button>
                    <button
                        onClick={() => {
                            setManualLocationMode(!manualLocationMode);
                            toast.success(manualLocationMode ? 'GPS Simulation Disabled' : 'GPS Simulation Enabled');
                        }}
                        className={`p-2 rounded-full backdrop-blur-md transition-colors ${manualLocationMode ? 'bg-[#C00029] text-white' : 'bg-slate-800/50 text-slate-400 hover:text-white'}`}
                        title="Toggle GPS Simulation"
                    >
                        <MapPin size={20} />
                    </button>
                    <button onClick={simulateIncomingRequest} className="p-2 bg-slate-800/50 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 backdrop-blur-md transition-colors" title="Simulate Request">
                        <Bell size={20} />
                    </button>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-24 pt-28 px-4">

                {/* 1. STATUS CARD */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-900/50 border border-slate-800 rounded-3xl p-1 mb-6 backdrop-blur-xl relative overflow-hidden"
                >
                    <div className="flex">
                        <motion.button
                            onClick={() => !isOnline && toggleOnline()}
                            className={`flex-1 py-4 rounded-2xl font-bold flex flex-col items-center gap-2 transition-all duration-300 relative z-10 ${!isOnline ? 'text-slate-500' : 'text-slate-950'}`}
                        >
                            {isOnline && <motion.div layoutId="active-pill" className="absolute inset-0 bg-[#C00029] rounded-2xl -z-10 shadow-[0_0_20px_rgba(192,0,41,0.4)]" />}
                            <span className="text-xs tracking-widest uppercase">Go Online</span>
                            <Power size={24} />
                        </motion.button>

                        <motion.button
                            onClick={() => isOnline && toggleOnline()}
                            className={`flex-1 py-4 rounded-2xl font-bold flex flex-col items-center gap-2 transition-all duration-300 relative z-10 ${isOnline ? 'text-slate-500' : 'text-slate-950'}`}
                        >
                            {!isOnline && <motion.div layoutId="active-pill" className="absolute inset-0 bg-slate-200 rounded-2xl -z-10" />}
                            <span className="text-xs tracking-widest uppercase">Offline</span>
                            <Power size={24} />
                        </motion.button>
                    </div>
                </motion.div>

                {/* 2. DASHBOARD STATS (Only visible when Online) */}
                <AnimatePresence>
                    {isOnline && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="grid grid-cols-2 gap-3 mb-6"
                        >
                            <div className="bg-slate-800/40 p-5 rounded-3xl border border-slate-700/50">
                                <div className="flex items-start justify-between mb-2">
                                    <Wallet className="text-emerald-400" size={20} />
                                </div>
                                <h3 className="text-2xl font-bold text-white">{stats.earnings}</h3>
                                <p className="text-xs text-slate-400 mt-1">Total Earnings</p>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-slate-800/40 p-4 rounded-3xl border border-slate-700/50 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold">{stats.trips}</h3>
                                        <p className="text-[10px] text-slate-400">Total Trips</p>
                                    </div>
                                    <div className="bg-blue-500/20 p-2 rounded-full text-blue-400"><Navigation size={16} /></div>
                                </div>
                                <div className="bg-slate-800/40 p-4 rounded-3xl border border-slate-700/50 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold">{stats.hours}</h3>
                                        <p className="text-[10px] text-slate-400">Hours</p>
                                    </div>
                                    <div className="bg-amber-500/20 p-2 rounded-full text-amber-400"><Clock size={16} /></div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 3. RECENT ACTIVITY */}
                <div className="mb-4 flex justify-between items-end">
                    <h2 className="text-lg font-bold text-slate-200">Recent Activity</h2>
                    <button className="text-xs text-[#C00029] font-medium">View All</button>
                </div>

                <div className="space-y-3">
                    {recentTrips.length === 0 && <p className="text-sm text-slate-600 italic">No trips yet.</p>}
                    {recentTrips.map((trip, i) => (
                        <motion.div
                            key={trip.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-slate-800 p-3 rounded-xl text-slate-400">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-200 line-clamp-1">{trip.to}</h4>
                                    <p className="text-xs text-slate-500">{trip.time}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block font-bold text-emerald-400">{trip.earn}</span>
                                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">{trip.status}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* --- MINIMIZED ACTIVE DELIVERY BAR --- */}
            <AnimatePresence>
                {activeDelivery && isMinimized && (
                    <motion.div
                        initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                        className="fixed bottom-20 left-4 right-4 z-40 bg-slate-900 border border-slate-700/50 p-4 rounded-2xl shadow-xl flex items-center justify-between"
                        onClick={() => setIsMinimized(false)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center animate-pulse">
                                <Navigation size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">Ongoing Trip</p>
                                <h4 className="text-sm font-bold text-slate-200">
                                    {activeDelivery.status === 'ASSIGNED' ? 'To Pickup' : 'To Dropoff'}
                                </h4>
                            </div>
                        </div>
                        <button className="p-2 bg-slate-800 rounded-full text-slate-400">
                            <ChevronRight size={20} className="-rotate-90" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- BOTTOM NAVIGATION --- */}
            <div className="absolute bottom-0 w-full bg-slate-950 border-t border-slate-900 pb-6 pt-4 px-6 flex justify-between items-center z-20">
                {['dashboard', 'activity', 'wallet', 'profile'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex flex-col items-center gap-1 transition-colors ${activeTab === tab ? 'text-[#C00029]' : 'text-slate-600'}`}
                    >
                        {tab === 'dashboard' && <LayoutGrid size={24} strokeWidth={activeTab === tab ? 2.5 : 2} />}
                        {tab === 'activity' && <RotateCcw size={24} strokeWidth={activeTab === tab ? 2.5 : 2} />}
                        {tab === 'wallet' && <Wallet size={24} strokeWidth={activeTab === tab ? 2.5 : 2} />}
                        {tab === 'profile' && <User size={24} strokeWidth={activeTab === tab ? 2.5 : 2} />}
                        <span className="text-[10px] capitalize font-medium">{tab}</span>
                    </button>
                ))}
            </div>


            {/* --- OVERLAYS (Request / Navigation) --- */}
            <AnimatePresence>
                {request && (
                    <motion.div
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        className="fixed inset-x-0 bottom-0 z-50 bg-[#1a1a1a] rounded-t-[2.5rem] p-6 shadow-[0_-10px_60px_rgba(0,0,0,0.8)] border-t border-slate-800"
                    >
                        {/* Pull Bar */}
                        <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-8" />

                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <motion.div
                                    initial={{ scale: 0.5 }} animate={{ scale: 1 }}
                                    className="bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold inline-block mb-3"
                                >
                                    NEW REQUEST
                                </motion.div>
                                <h2 className="text-3xl font-bold text-white">{request.earnings}</h2>
                                <p className="text-slate-400 text-sm mt-1">{request.distance} • {request.time} drive</p>
                            </div>
                            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center animate-pulse">
                                <Clock className="text-white" size={20} />
                            </div>
                        </div>

                        <div className="space-y-6 relative mb-8">
                            {/* Connecting Line */}
                            <div className="absolute left-[11px] top-3 bottom-8 w-[2px] bg-slate-800" />

                            <div className="flex gap-4 relative">
                                <div className="w-6 h-6 rounded-full bg-slate-800 border-4 border-[#1a1a1a] flex-shrink-0 z-10" />
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-0.5">Pickup</p>
                                    <h4 className="text-slate-200">{request.pickup.address}</h4>
                                </div>
                            </div>
                            <div className="flex gap-4 relative">
                                <div className="w-6 h-6 rounded-full bg-[#C00029] border-4 border-[#1a1a1a] flex-shrink-0 z-10" />
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-0.5">Dropoff</p>
                                    <h4 className="text-slate-200">{request.dropoff.address}</h4>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={declineRequest} className="flex-1 py-4 rounded-xl bg-slate-800 font-bold text-slate-300 hover:bg-slate-700">Decline</button>
                            <button onClick={acceptRequest} className="flex-[2] py-4 rounded-xl bg-[#C00029] font-bold text-white shadow-lg shadow-red-900/20 hover:bg-red-600">Accept Delivery</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Delivery Mode */}
            {activeDelivery && !isMinimized && (
                <motion.div
                    layoutId="active-delivery-overlay"
                    className="fixed inset-0 z-50 bg-slate-950 flex flex-col"
                >
                    {/* Real Map View */}
                    <div className="flex-1 bg-slate-900 relative">
                        <LiveMap
                            driverLocation={currentLocation || [28.6139, 77.2090]} // Use Real GPS or fallback
                            destination={
                                activeDelivery.status === 'ASSIGNED'
                                    ? (activeDelivery.pickup.location?.coordinates ? [activeDelivery.pickup.location.coordinates[1], activeDelivery.pickup.location.coordinates[0]] : [28.6139, 77.2090])
                                    : (activeDelivery.dropoff.location?.coordinates ? [activeDelivery.dropoff.location.coordinates[1], activeDelivery.dropoff.location.coordinates[0]] : [28.6139, 77.2090])
                            }
                            draggable={manualLocationMode} // Enable dragging if manual mode
                            onDragEnd={(lat, lng) => {
                                setCurrentLocation([lat, lng]);
                                toast.success('Location Updated (Drag)', { id: 'loc-drag' });
                            }}
                            onMapClick={(lat, lng) => {
                                if (manualLocationMode) {
                                    setCurrentLocation([lat, lng]);
                                    toast.success('Location Set (Click)');
                                }
                            }}
                        />

                        {/* Manual Mode Indicator */}
                        {manualLocationMode && (
                            <div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-[400]">
                                <div className="bg-yellow-500/20 text-yellow-500 px-4 py-1 rounded-full text-xs font-bold border border-yellow-500/50 backdrop-blur-md animate-pulse">
                                    Laptop Mode: Drag Marker to Move
                                </div>
                                <div className="text-[10px] text-slate-400 bg-black/50 px-2 rounded">
                                    GPS Simulation Active
                                </div>
                            </div>
                        )}

                        {/* Header */}
                        <div className="absolute top-0 w-full p-6 pt-12 flex justify-between z-[400]">
                            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold border border-white/10 text-white">
                                {activeDelivery.status === 'ASSIGNED' ? 'Heading to Pickup' : 'Heading to Dropoff'}
                            </div>
                            <button
                                onClick={() => setIsMinimized(true)}
                                className="bg-black/60 backdrop-blur-md p-3 rounded-full border border-white/10 text-white hover:bg-white/10"
                            >
                                <ChevronRight size={20} className="rotate-90" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#1a1a1a] p-6 rounded-t-[2.5rem] border-t border-slate-800">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold">
                                    {activeDelivery.status === 'ASSIGNED'
                                        ? (typeof activeDelivery.pickup === 'string' ? activeDelivery.pickup : activeDelivery.pickup.address)
                                        : (typeof activeDelivery.dropoff === 'string' ? activeDelivery.dropoff : activeDelivery.dropoff.address)
                                    }
                                </h3>
                                <p className="text-slate-400 text-sm">
                                    {activeDelivery.status === 'ASSIGNED' ? 'Navigate to Hospital' : 'Navigate to Donor'}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    const dest = activeDelivery.status === 'ASSIGNED' ? activeDelivery.pickup : activeDelivery.dropoff;
                                    // Handle both string and object cases (though object is preferred)
                                    if (typeof dest === 'object' && dest.location?.coordinates) {
                                        const [lng, lat] = dest.location.coordinates;
                                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                                    } else {
                                        // Fallback for string addresses or missing coords
                                        const address = typeof dest === 'string' ? dest : dest.address;
                                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank');
                                    }
                                }}
                                className="w-12 h-12 bg-[#C00029] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-600/30 hover:bg-red-700 active:scale-95 transition-all"
                            >
                                <Navigation size={24} />
                            </button>
                        </div>

                        {/* PICKUP PHASE: Extra Input for Blood Bag ID */}
                        {activeDelivery.status === 'ASSIGNED' && (
                            <div className="mb-6">
                                <label className="text-xs text-slate-500 uppercase font-bold block mb-2">
                                    Step 1: Verify Blood Bag
                                </label>
                                <div className="relative flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Scan Bag ID (e.g. BAG-123)"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 pl-12 text-white font-mono font-bold focus:border-[#C00029] focus:outline-none"
                                        value={bloodBagId}
                                        onChange={(e) => setBloodBagId(e.target.value)}
                                    />
                                    <div className="absolute left-4 text-slate-500">
                                        <Package size={20} />
                                    </div>
                                    <button
                                        className="bg-slate-800 p-4 rounded-xl text-white hover:bg-slate-700 active:scale-95 transition-all"
                                        onClick={() => setShowScanner(true)}
                                    >
                                        <Scan size={24} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* QR Scanner Modal */}
                        <AnimatePresence>
                            {showScanner && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4"
                                >
                                    <div className="w-full max-w-sm bg-slate-900 rounded-3xl overflow-hidden relative shadow-2xl border border-slate-700">
                                        <div className="absolute top-4 right-4 z-10 flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
                                                    setScannedCode(null); // Reset scan on switch
                                                }}
                                                className="bg-black/50 p-2 rounded-full text-white backdrop-blur-md hover:bg-black/70"
                                            >
                                                <RotateCcw size={20} />
                                            </button>
                                            <button onClick={() => setShowScanner(false)} className="bg-black/50 p-2 rounded-full text-white backdrop-blur-md hover:bg-black/70">
                                                <LogOut size={20} />
                                            </button>
                                        </div>

                                        <div className="p-4 text-center">
                                            <h3 className="text-white font-bold text-lg mb-1">Scan Blood Bag</h3>
                                            <p className="text-slate-400 text-xs">Align barcode within the frame</p>
                                        </div>

                                        <div className="relative aspect-square bg-black overflow-hidden rounded-lg mx-4">
                                            <div className="relative w-full h-full">
                                                {/* LIVE Camera View - ALWAYS ACTIVE */}
                                                <QrReader
                                                    key={facingMode}
                                                    delay={500}
                                                    onError={(err: any) => {
                                                        // Silent error to avoid spam
                                                    }}
                                                    onScan={(data: any) => {
                                                        if (data) {
                                                            const text = data?.text || data;
                                                            if (typeof text === 'string' && text.length > 3) {
                                                                // Don't set state if same code (debouncing)
                                                                if (scannedCode !== text) {
                                                                    setScannedCode(text);
                                                                    toast.success("Code Found!", { id: 'scan-success', duration: 1000 }); // Updates existing toast
                                                                }
                                                            }
                                                        }
                                                    }}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    constraints={useMemo(() => ({
                                                        audio: false,
                                                        video: { facingMode: facingMode }
                                                    }), [facingMode])}
                                                />

                                                {/* Active Overlay: Green Box when code found */}
                                                {scannedCode ? (
                                                    <div className="absolute inset-0 border-4 border-green-500 m-8 rounded-xl pointer-events-none shadow-[0_0_50px_rgba(34,197,94,0.5)] transition-all">
                                                        <div className="absolute bottom-4 left-0 right-0 text-center">
                                                            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce">
                                                                Code Detected
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Scanning Animation
                                                    <div className="absolute inset-0 border-2 border-[#C00029]/80 m-8 rounded-xl animate-pulse pointer-events-none shadow-[0_0_20px_rgba(192,0,41,0.5)]"></div>
                                                )}
                                            </div>

                                            {/* OVERLAY UI for Found Code (On top of video) */}
                                            {scannedCode && (
                                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-end p-4 pb-20 backdrop-blur-sm transition-all">
                                                    <div className="bg-white text-black p-4 rounded-2xl shadow-2xl w-full text-center animate-in slide-in-from-bottom-10 fade-in duration-300">
                                                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Scanned ID</p>
                                                        <h2 className="text-2xl font-mono font-bold text-[#C00029] mb-4 tracking-wider">{scannedCode}</h2>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setScannedCode(null)}
                                                                className="flex-1 py-3 bg-slate-200 rounded-xl font-bold hover:bg-slate-300 active:scale-95"
                                                            >
                                                                Rescan
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setBloodBagId(scannedCode);
                                                                    setShowScanner(false);
                                                                    setScannedCode(null);
                                                                }}
                                                                className="flex-1 py-3 bg-[#C00029] text-white rounded-xl font-bold shadow-lg shadow-red-500/30 hover:bg-red-700 active:scale-95"
                                                            >
                                                                Confirm
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 bg-slate-900">
                                            <button onClick={() => setShowScanner(false)} className="w-full py-3 text-slate-400 font-bold hover:text-white transition-colors">Close</button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <label className="text-xs text-slate-500 uppercase font-bold block mb-2">
                            {activeDelivery.status === 'ASSIGNED' ? 'Step 2: Enter Pickup Code' : 'Enter Dropoff Code'}
                        </label>

                        {/* Input Fix: Use a real input purely styled, rather than hidden overlay hack which fails on some mobiles */}
                        <div className="relative">
                            <input
                                type="text"
                                pattern="\d*"
                                inputMode="numeric"
                                maxLength={4}
                                placeholder="• • • •"
                                className="w-full bg-black border border-slate-800 rounded-xl p-4 text-center text-3xl font-mono font-bold tracking-[1em] text-white focus:border-[#C00029] focus:outline-none placeholder:tracking-widest"
                                value={verificationInput}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, ''); // Only numbers
                                    setVerificationInput(val);
                                }}
                            />
                        </div>

                        <button
                            onClick={handleVerification}
                            className="w-full mt-6 bg-[#C00029] py-4 rounded-xl font-bold text-white shadow-lg shadow-red-900/20 active:scale-95 transition-transform"
                        >
                            {activeDelivery.status === 'ASSIGNED' ? 'Verify Pickup & Bag' : 'Complete Delivery'}
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
