
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { Search, ShieldAlert, Edit, Eye, X, CheckCircle, Save, Car, Bike, Truck } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Driver {
    _id: string;
    userId: {
        fullName: string;
        email: string;
        mobile: string;
    };
    status: string;
    isBlocked: boolean;
    vehicleDetails: {
        type: string;
        plateNumber: string;
        model: string;
    };
}

export default function AllDriversPage() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

    // Modal States
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockReason, setBlockReason] = useState('');

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        vehicleType: '',
        model: '',
        plateNumber: ''
    });

    // Refs for GSAP
    const tableRef = useRef<HTMLTableSectionElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);

    // Fetch Drivers
    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const res = await fetch('/api/admin/drivers/list');
            const data = await res.json();
            setDrivers(data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load drivers');
            setLoading(false);
        }
    };

    // GSAP Entrance Animation
    useEffect(() => {
        if (!loading && drivers.length > 0) {
            gsap.fromTo(titleRef.current,
                { opacity: 0, x: -50 },
                { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" }
            );

            if (tableRef.current) {
                gsap.fromTo(tableRef.current.children,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1, y: 0,
                        duration: 0.5,
                        stagger: 0.1,
                        ease: "back.out(1.7)"
                    }
                );
            }
        }
    }, [loading, drivers]);

    // Handle Block
    const handleBlockDriver = async () => {
        if (!selectedDriver) return;
        try {
            const res = await fetch(`/api/admin/drivers/${selectedDriver._id}`, {
                method: 'PATCH',
                body: JSON.stringify({ isBlocked: true, blockReason }),
            });
            if (res.ok) {
                toast.success(`Blocked ${selectedDriver.userId.fullName}`);
                fetchDrivers();
                closeModals();
            } else {
                toast.error('Failed to block driver');
            }
        } catch (error) {
            toast.error('Error blocking driver');
        }
    };

    // Handle Unblock
    const handleUnblockDriver = async (driver: Driver) => {
        if (!confirm(`Unblock ${driver.userId.fullName}?`)) return;
        try {
            const res = await fetch(`/api/admin/drivers/${driver._id}`, {
                method: 'PATCH',
                body: JSON.stringify({ isBlocked: false, blockReason: '' }),
            });
            if (res.ok) {
                toast.success(`Unblocked ${driver.userId.fullName}`);
                fetchDrivers();
            }
        } catch (error) {
            toast.error('Error unblocking');
        }
    };

    // Update Driver Details
    const handleUpdateDriver = async () => {
        if (!selectedDriver) return;
        try {
            const res = await fetch(`/api/admin/drivers/${selectedDriver._id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    vehicleDetails: {
                        type: editForm.vehicleType,
                        model: editForm.model,
                        plateNumber: editForm.plateNumber
                    }
                }),
            });

            if (res.ok) {
                toast.success('Driver details updated');
                fetchDrivers();
                closeModals();
            } else {
                toast.error('Failed to update driver');
            }
        } catch (error) {
            toast.error('Error updating driver');
        }
    };

    // GSAP Modal Animation Helper
    const animateModalIn = () => {
        setTimeout(() => {
            if (modalRef.current) {
                gsap.fromTo(modalRef.current,
                    { opacity: 0, scale: 0.8, rotationX: 10 },
                    { opacity: 1, scale: 1, rotationX: 0, duration: 0.4, ease: "poster.out" }
                );
            }
        }, 10);
    };

    const openBlockModal = (driver: Driver) => {
        setSelectedDriver(driver);
        setShowBlockModal(true);
        animateModalIn();
    };

    const openEditModal = (driver: Driver) => {
        setSelectedDriver(driver);
        setEditForm({
            vehicleType: driver.vehicleDetails?.type || '',
            model: driver.vehicleDetails?.model || '',
            plateNumber: driver.vehicleDetails?.plateNumber || ''
        });
        setShowEditModal(true);
        animateModalIn();
    };

    const closeModals = () => {
        setShowBlockModal(false);
        setShowEditModal(false);
        setBlockReason('');
        setSelectedDriver(null);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Drivers...</div>;

    return (
        <div className="p-8 min-h-screen bg-gray-50/50">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 ref={titleRef} className="text-3xl font-bold text-gray-800">All Delivery Partners</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage, track, and monitor driver fleet.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    <input
                        placeholder="Search drivers..."
                        className="pl-10 pr-4 py-2 border rounded-full bg-white focus:ring-2 focus:ring-slate-200 outline-none w-64 shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Driver Name</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Vehicle</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Rating</th>
                            <th className="p-4 text-xs font-bold text-gray-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody ref={tableRef}>
                        {drivers.map((driver) => (
                            <tr key={driver._id} className={`border-b hover:bg-slate-50 transition-colors ${driver.isBlocked ? 'bg-red-50 hover:bg-red-100' : ''}`}>
                                <td className="p-4">
                                    <div className="font-bold text-gray-800">{driver.userId?.fullName || 'Unknown'}</div>
                                    <div className="text-xs text-gray-400">{driver.userId?.email}</div>
                                    {driver.isBlocked && <span className="text-xs text-red-600 font-bold">BLOCKED</span>}
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${driver.status === 'ONLINE' ? 'bg-green-100 text-green-700' :
                                        driver.status === 'BUSY' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {driver.status}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                            {driver.vehicleDetails?.type === 'Bike' ? <Bike size={16} /> :
                                                driver.vehicleDetails?.type === 'Van' ? <Truck size={16} /> :
                                                    <Car size={16} />}
                                        </div>
                                        <span>{driver.vehicleDetails?.model} <span className="text-gray-400">({driver.vehicleDetails?.plateNumber})</span></span>
                                    </div>
                                </td>
                                <td className="p-4 text-sm font-bold text-yellow-500">
                                    ★ {driver.rating}
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    {/* Edit Button */}
                                    <button onClick={() => openEditModal(driver)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="Edit Driver">
                                        <Edit size={18} />
                                    </button>

                                    {/* Block/Unblock Button */}
                                    {driver.isBlocked ? (
                                        <button onClick={() => handleUnblockDriver(driver)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100" title="Unblock">
                                            <CheckCircle size={18} />
                                        </button>
                                    ) : (
                                        <button onClick={() => openBlockModal(driver)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Block Driver">
                                            <ShieldAlert size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {drivers.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No drivers found.</div>
                )}
            </div>

            {/* Block Modal */}
            {showBlockModal && selectedDriver && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md m-4 transform perspective-1000">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-red-100 p-2 rounded-full text-red-600">
                                    <ShieldAlert size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Block Driver</h2>
                            </div>
                            <button onClick={closeModals} className="text-gray-400 hover:text-gray-600"><X /></button>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to block <span className="font-bold text-gray-900">{selectedDriver.userId.fullName}</span>?
                        </p>
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Reason</label>
                            <textarea
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-red-200 outline-none resize-none h-24 text-sm"
                                placeholder="Violation details..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={closeModals} className="flex-1 py-3 rounded-xl bg-gray-100 font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                            <button onClick={handleBlockDriver} disabled={!blockReason} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors disabled:opacity-50">Block Driver</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedDriver && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md m-4 transform perspective-1000">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                    <Edit size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Edit Driver Details</h2>
                            </div>
                            <button onClick={closeModals} className="text-gray-400 hover:text-gray-600"><X /></button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vehicle Type</label>
                                <select
                                    className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-100"
                                    value={editForm.vehicleType}
                                    onChange={(e) => setEditForm({ ...editForm, vehicleType: e.target.value })}
                                >
                                    <option value="Car">Car</option>
                                    <option value="Bike">Bike</option>
                                    <option value="Van">Van</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Model</label>
                                <input
                                    className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-100"
                                    value={editForm.model}
                                    onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Plate Number</label>
                                <input
                                    className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-100"
                                    value={editForm.plateNumber}
                                    onChange={(e) => setEditForm({ ...editForm, plateNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={closeModals} className="flex-1 py-3 rounded-xl bg-gray-100 font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                            <button onClick={handleUpdateDriver} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
