
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, User, Mail, Lock, Car, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AddDriverPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        contactNumber: '',
        password: '',
        vehicleType: 'Car',
        model: '',
        plateNumber: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/admin/drivers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('Driver registered successfully!');
                // Ideally redirect to list, but we'll stick here or reset
                setFormData({
                    fullName: '',
                    email: '',
                    contactNumber: '',
                    password: '',
                    vehicleType: 'Car',
                    model: '',
                    plateNumber: ''
                });
            } else {
                toast.error(data.message || 'Failed to register driver');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="bg-white/10 p-3 rounded-lg">
                            <Truck size={24} className="text-green-400" />
                        </div>
                        <h1 className="text-3xl font-bold">Register New Driver</h1>
                    </div>
                    <p className="text-slate-400">Create credentials for delivery partners.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Personal Info */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-700 border-b pb-2">Personal Details</h3>

                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    name="fullName" value={formData.fullName} onChange={handleChange} required
                                    placeholder="Full Name"
                                    className="w-full pl-10 p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                />
                            </div>

                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    name="email" type="email" value={formData.email} onChange={handleChange} required
                                    placeholder="Email Address"
                                    className="w-full pl-10 p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    name="password" type="password" value={formData.password} onChange={handleChange} required
                                    placeholder="Password"
                                    className="w-full pl-10 p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                />
                            </div>

                            <div className="relative">
                                {/* Using Mail icon as placeholder or maybe Phone is better if available */}
                                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                {/* I should import Phone icon */}
                                <input
                                    name="contactNumber" value={formData.contactNumber} onChange={handleChange} required
                                    placeholder="Contact Number"
                                    pattern="[0-9]{10}"
                                    title="10 digit mobile number"
                                    className="w-full pl-10 p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Vehicle Info */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-700 border-b pb-2">Vehicle Details</h3>

                            <div className="relative">
                                <Car className="absolute left-3 top-3 text-gray-400" size={18} />
                                <select
                                    name="vehicleType" value={formData.vehicleType} onChange={handleChange}
                                    className="w-full pl-10 p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none appearance-none"
                                >
                                    <option value="Car">Car</option>
                                    <option value="Bike">Bike</option>
                                    <option value="Van">Van</option>
                                </select>
                            </div>

                            <div className="relative">
                                <Shield className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    name="plateNumber" value={formData.plateNumber} onChange={handleChange} required
                                    placeholder="License Plate (e.g. DL-01-AB-1234)"
                                    className="w-full pl-10 p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                />
                            </div>

                            <div className="relative">
                                <Car className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    name="model" value={formData.model} onChange={handleChange} required
                                    placeholder="Vehicle Model (e.g. Maruti Swift)"
                                    className="w-full pl-10 p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50"
                    >
                        {loading ? 'Registering Driver...' : 'Create Driver Account'}
                    </button>

                </form>
            </div>
        </div>
    );
}
