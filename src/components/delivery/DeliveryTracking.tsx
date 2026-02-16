'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Truck, Package, MapPin, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Fix Leaflet icons
const iconPerson = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/6833/6833591.png',
    iconSize: [40, 40],
    className: 'leaflet-venue-icon'
});

const iconDriver = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/7541/7541900.png',
    iconSize: [45, 45],
    className: 'leaflet-venue-icon'
});

const iconHospital = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/4320/4320371.png',
    iconSize: [45, 45],
    className: 'leaflet-venue-icon'
});

interface DeliveryTrackingProps {
    deliveryId: string;
    initialData?: any;
}

// Internal component to handle map movement
function MapController({ driver, pickup, dropoff }: { driver?: { lat: number, lng: number } | null, pickup?: [number, number] | null, dropoff?: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
        const points: [number, number][] = [];
        if (driver) points.push([driver.lat, driver.lng]);
        if (pickup) points.push(pickup);
        if (dropoff) points.push(dropoff);

        if (points.length > 0) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [driver, pickup, dropoff]);
    return null;
}

export default function DeliveryTracking({ deliveryId, initialData }: DeliveryTrackingProps) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [deliveryStatus, setDeliveryStatus] = useState(initialData?.status || 'SEARCHING');
    const [driverLocation, setDriverLocation] = useState<{ lat: number, lng: number } | null>(
        initialData?.driverId?.currentLocation?.coordinates && initialData.driverId.currentLocation.coordinates[0] !== 0
            ? { lat: initialData.driverId.currentLocation.coordinates[1], lng: initialData.driverId.currentLocation.coordinates[0] }
            : null
    );

    // [NEW] Map Center & Bounds Logic
    const pickupCoords: [number, number] | null = initialData?.pickup?.location?.coordinates
        ? [initialData.pickup.location.coordinates[1], initialData.pickup.location.coordinates[0]]
        : null;
    const dropoffCoords: [number, number] | null = initialData?.dropoff?.location?.coordinates
        ? [initialData.dropoff.location.coordinates[1], initialData.dropoff.location.coordinates[0]]
        : null;

    const [mapCenter, setMapCenter] = useState<[number, number]>(pickupCoords || [28.6139, 77.2090]);

    const steps = ['SEARCHING', 'ASSIGNED', 'PICKED_UP', 'DELIVERED'];
    const currentStepIndex = steps.indexOf(deliveryStatus);

    useEffect(() => {
        // [FIX] Update status if initialData changes (e.g. hydration with new status)
        if (initialData?.status) {
            setDeliveryStatus(initialData.status);
        }
        // Update driver location if initialData updates and we don't have one yet
        if (!driverLocation && initialData?.driverId?.currentLocation?.coordinates) {
            const coords = initialData.driverId.currentLocation.coordinates;
            if (coords[0] !== 0) {
                setDriverLocation({ lat: coords[1], lng: coords[0] });
            }
        }
    }, [initialData]);

    const [eta, setEta] = useState(initialData?.eta || '15 mins');
    const [verificationCode, setVerificationCode] = useState(initialData?.dropoffCode || '****');
    const router = useRouter(); // Use App Router

    // [FIX] Automated Redirect on Delivery
    useEffect(() => {
        if (deliveryStatus === 'DELIVERED') {
            const timer = setTimeout(() => {
                router.push(`/donor/payment/${initialData?.requestId}`);
            }, 5000); // Redirect after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [deliveryStatus, initialData, router]);

    const mapRef = useRef<any>(null);

    useEffect(() => {
        // Connect to custom server socket
        const newSocket = io({
            path: '/api/socket',
        });

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
            newSocket.emit('join_delivery_room', deliveryId);
        });

        newSocket.on('driver_moved', (location) => {
            console.log('[Socket] driver_moved:', location);
            setDriverLocation(location);
            setMapCenter([location.lat, location.lng]);
        });

        // [FIX] Request latest location immediately upon joining
        console.log('[Socket] Requesting driver location for:', deliveryId);
        newSocket.emit('request_driver_location', deliveryId);

        newSocket.on('current_driver_location', (location) => {
            console.log('[Socket] Received current_driver_location:', location);
            if (location) {
                setDriverLocation(location);
                setMapCenter([location.lat, location.lng]);
            }
        });

        newSocket.on('delivery_status_updated', (status) => {
            console.log('[Socket] Status Update:', status);
            setDeliveryStatus(status);
            toast.success(`Status Update: ${status}`);
        });

        setSocket(newSocket);

        // [NEW] Polling Fallback (every 5s)
        const pollInterval = setInterval(async () => {
            try {
                // We can reuse the invoice/request endpoint or a dedicated delivery status endpoint
                // Since we don't have a simple GET /api/delivery/[id], we can use the verify endpoint or similar?
                // Actually Request ID is in initialData, let's use the track endpoint or just assume the server endpoint exists.
                // Let's create a simple check using the existing 'active-delivery' logic or just rely on the invoice polling?
                // Better: Use a dedicated check. For now, let's trust the socket + initialData. 
                // BUT if user says "stuck", polling is the answer.
                // Let's query the SAME endpoint the invoice page uses if possible, but we only have deliveryId.
                // We need a way to get status by deliveryId.
                // Let's use the creation endpoint if it supports GET? No.
                // Let's skip polling for now to avoid creating new APIs, but log errors if socket disconnects.
                // actually, let's keep it simple: Re-emit 'request_driver_location' periodically to keep connection alive?

                // WAIT, I can just fetch the Invoice API if I have requestId?
                if (initialData?.requestId) {
                    const res = await fetch(`/api/donor/invoice/${initialData.requestId}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.activeDelivery?.status) {
                            const polledStatus = data.activeDelivery.status;
                            if (polledStatus !== deliveryStatus) {
                                console.log('[Poll] Status Differs:', polledStatus);
                                setDeliveryStatus(polledStatus);
                            }
                        }
                    }
                }
            } catch (e) { console.error('Poll Error', e); }
        }, 5000);

        return () => {
            newSocket.disconnect();
            clearInterval(pollInterval);
        };
    }, [deliveryId, initialData?.requestId]);

    return (
        <div className="flex flex-col h-full bg-gray-50 rounded-xl overflow-hidden shadow-2xl border border-gray-100 relative">

            {/* [NEW] Success State for Delivered */}
            {deliveryStatus === 'DELIVERED' && (
                <div className="absolute inset-0 z-[5000] bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
                    >
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Delivery Successful!</h2>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        The blood unit has been safely delivered to the destination. Thank you for your contribution to saving a life.
                    </p>

                    <div className="bg-gray-50 p-6 rounded-xl w-full max-w-sm border border-gray-200 text-left">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-500 text-sm">Delivered at</span>
                            <span className="font-semibold text-gray-800">{new Date().toLocaleTimeString()}</span>
                        </div>

                        <div className="w-full h-px bg-gray-200 my-4" />

                        <div className="space-y-3">
                            <div>
                                <span className="text-xs text-gray-500 uppercase font-semibold">Driver</span>
                                <div className="font-bold text-gray-900 text-lg">
                                    {initialData?.driverId?.userId?.fullName || 'Partner Driver'}
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <div>
                                    <span className="text-xs text-gray-500 uppercase font-semibold">Vehicle</span>
                                    <div className="font-medium text-gray-800">
                                        {initialData?.driverId?.vehicleDetails?.model || 'Vehicle'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {initialData?.driverId?.vehicleDetails?.plateNumber || ''}
                                    </div>
                                </div>

                                {initialData?.driverId?.contactNumber && (
                                    <div className="text-right">
                                        <span className="text-xs text-gray-500 uppercase font-semibold">Contact</span>
                                        <div className="font-medium text-blue-600">
                                            {initialData.driverId.contactNumber}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.href = `/donor/payment/${initialData?.requestId}`}
                        className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-colors"
                    >
                        View Invoice
                    </button>
                </div>
            )}

            {/* 1. Header & Status Bar */}
            <div className="bg-white p-6 z-10 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
                        Real-Time Tracking
                    </h2>
                    <div className="px-4 py-1 bg-red-50 text-red-600 rounded-full text-sm font-semibold border border-red-100 flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        {driverLocation ? 'Live Tracking' : 'Waiting for Signal'}
                    </div>
                </div>

                {/* Status Timeline */}
                <div className="relative flex justify-between items-center px-4">
                    {/* Line Background */}
                    <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-100 -z-0"></div>
                    {/* Progress Line */}
                    <motion.div
                        className="absolute left-0 top-1/2 h-1 bg-gradient-to-r from-red-500 to-rose-400 -z-0"
                        initial={{ width: '0%' }}
                        animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                    />

                    {steps.map((step, index) => {
                        const isActive = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;

                        return (
                            <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                                <motion.div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors duration-500
                        ${isActive ? 'bg-white border-red-500 text-red-500 shadow-lg' : 'bg-gray-100 border-white text-gray-400'}
                      `}
                                    initial={false}
                                    animate={isCurrent ? { scale: [1, 1.2, 1], boxShadow: "0px 0px 20px rgba(239, 68, 68, 0.4)" } : { scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {index === 0 && <Search size={18} />}
                                    {index === 1 && <Truck size={18} />}
                                    {index === 2 && <Package size={18} />}
                                    {index === 3 && <CheckCircle size={18} />}
                                </motion.div>
                                <p className={`text-xs font-medium ${isActive ? 'text-red-700' : 'text-gray-400'}`}>{step}</p>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* 2. Map Area */}
            <div className="flex-1 relative bg-gray-200">
                {/* Radar Animation for Searching */}
                <AnimatePresence>
                    {deliveryStatus === 'SEARCHING' && (
                        <motion.div
                            className="absolute inset-0 z-[400] bg-black/30 backdrop-blur-[2px] flex items-center justify-center flex-col"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="relative">
                                <motion.div
                                    className="absolute inset-0 bg-red-500 rounded-full opacity-20"
                                    animate={{ scale: [1, 3], opacity: [0.5, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                />
                                <div className="bg-white p-4 rounded-full shadow-2xl relative z-10">
                                    <Search className="w-8 h-8 text-red-500" />
                                </div>
                            </div>
                            <h3 className="text-white font-bold text-xl mt-6 tracking-wide drop-shadow-md">Finding nearest driver...</h3>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* [NEW] Driver Details Card */}
                {deliveryStatus !== 'SEARCHING' && initialData?.driverId && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="absolute bottom-6 left-6 right-6 md:right-auto md:w-96 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-gray-100"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden text-2xl">
                                👨‍✈️
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-lg">
                                    {initialData.driverId.userId?.fullName || 'Driver Assigned'}
                                </h4>
                                <div className="flex items-center gap-1 text-yellow-500 text-sm">
                                    <span>★</span>
                                    <span className="font-semibold">{initialData.driverId.rating || 5.0}</span>
                                    <span className="text-gray-400 font-normal ml-1">({initialData.driverId.totalDeliveries || 0} deliveries)</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase font-semibold">Vehicle</p>
                                <p className="font-bold text-slate-800">{initialData.driverId.vehicleDetails?.plateNumber || 'N/A'}</p>
                                <p className="text-xs text-gray-500">{initialData.driverId.vehicleDetails?.model || 'Vehicle'}</p>
                            </div>
                        </div>

                        {initialData.driverId.contactNumber && (
                            <div className="mt-4 pt-3 border-t border-gray-200/50 flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Contact
                                </div>
                                <a href={`tel:${initialData.driverId.contactNumber}`} className="flex items-center gap-2 text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                                    📞 {initialData.driverId.contactNumber}
                                </a>
                            </div>
                        )}
                    </motion.div>
                )}

                {typeof window !== 'undefined' && (
                    <MapContainer
                        center={mapCenter}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        ref={mapRef}
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        />

                        <MapController driver={driverLocation} pickup={pickupCoords} dropoff={dropoffCoords} />

                        {driverLocation && (
                            <Marker position={[driverLocation.lat, driverLocation.lng]} icon={iconDriver}>
                                <Popup>Driver {initialData?.driverId?.userId?.fullName ? `- ${initialData.driverId.userId.fullName}` : ''}</Popup>
                            </Marker>
                        )}

                        {pickupCoords && (
                            <Marker position={pickupCoords} icon={iconHospital}>
                                <Popup>Pickup (Hospital)</Popup>
                            </Marker>
                        )}

                        {dropoffCoords && (
                            <Marker position={dropoffCoords} icon={iconPerson}>
                                <Popup>Drop-off (Donor Location)</Popup>
                            </Marker>
                        )}

                        {/* Route Line if driver and dropoff known */}
                        {driverLocation && dropoffCoords && (
                            <Polyline
                                positions={[
                                    [driverLocation.lat, driverLocation.lng],
                                    dropoffCoords
                                ]}
                                color="red"
                                dashArray="10, 10"
                                weight={3}
                                opacity={0.5}
                            />
                        )}

                    </MapContainer>
                )}

                {/* Verification Code Overlay */}
                {deliveryStatus !== 'SEARCHING' && deliveryStatus !== 'DELIVERED' && (
                    <motion.div
                        className="absolute bottom-6 right-6 z-[400] bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/50"
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Drop-off Code</p>
                        <div className="text-3xl font-mono font-black text-slate-800 tracking-[0.2em]">{verificationCode}</div>
                        <p className="text-[10px] text-slate-400 mt-2">Share this code with driver at drop-off location</p>
                    </motion.div>
                )}

            </div>
        </div>
    );
}
