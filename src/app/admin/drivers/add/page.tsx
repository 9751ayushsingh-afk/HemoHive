
'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, User, Mail, Lock, Car, Shield, Camera, X, Phone, Bike } from 'lucide-react';
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
        plateNumber: '',
        profilePicture: ''
    });

    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        let value = e.target.value;
        if (e.target.name === 'plateNumber') {
            // Auto-format License Plate: DL-01-AB-1234
            // Remove non-alphanumeric
            const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            // Insert hyphens
            if (cleaned.length > 8) {
                value = `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 10)}`;
            } else if (cleaned.length > 4) {
                value = `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4)}`;
            } else if (cleaned.length > 2) {
                value = `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
            } else {
                value = cleaned;
            }
            // Limit length (assuming standard max length)
            value = value.substring(0, 13);
        }
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Resize Image before setting state to avoid large payloads
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 480;
                    const MAX_HEIGHT = 480;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // Compress to 80%
                    setFormData(prev => ({ ...prev, profilePicture: dataUrl }));
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const startCamera = async () => {
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            toast.error("Could not access camera");
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        const stream = videoRef.current?.srcObject as MediaStream;
        const tracks = stream?.getTracks();
        tracks?.forEach(track => track.stop());
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        const width = 400;
        const height = 400; // Square aspect ratio

        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext('2d');
            if (context) {
                // Draw video frame to canvas
                context.drawImage(video, 0, 0, width, height);
                // Convert to data URL
                const dataUrl = canvas.toDataURL('image/jpeg');
                setFormData(prev => ({ ...prev, profilePicture: dataUrl }));
                stopCamera();
            }
        }
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
                    plateNumber: '',
                    profilePicture: ''
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

                            {/* Profile Picture Upload & Camera */}
                            <div className="flex flex-col gap-3 mb-4">
                                <p className="text-sm font-bold text-gray-700">Profile Photo</p>

                                <div className="flex items-center gap-4">
                                    <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group shrink-0">
                                        {formData.profilePicture ? (
                                            <img src={formData.profilePicture} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="text-gray-400" size={32} />
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        {/* File Upload Button */}
                                        <div className="relative overflow-hidden">
                                            <button type="button" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors w-full">
                                                Upload Image
                                            </button>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                        </div>

                                        {/* Camera Button */}
                                        <button
                                            type="button"
                                            onClick={startCamera}
                                            className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Camera size={16} /> Use Camera
                                        </button>
                                    </div>
                                </div>

                                {/* Camera Modal / Viewport */}
                                {isCameraOpen && (
                                    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
                                        <div className="relative max-w-sm w-full bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
                                            <div className="p-4 flex justify-between items-center border-b border-zinc-800">
                                                <h3 className="text-white font-bold">Take Photo</h3>
                                                <button onClick={stopCamera} className="text-zinc-400 hover:text-white"><X size={24} /></button>
                                            </div>
                                            <div className="relative aspect-square bg-black">
                                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                                            </div>
                                            <canvas ref={canvasRef} className="hidden"></canvas>
                                            <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex justify-center">
                                                <button
                                                    type="button"
                                                    onClick={capturePhoto}
                                                    className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:bg-white/10 transition-colors"
                                                >
                                                    <div className="w-12 h-12 bg-white rounded-full"></div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    name="fullName" value={formData.fullName} onChange={handleChange} required
                                    placeholder="Full Name"
                                    className="w-full pl-10 p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-gray-900"
                                />
                            </div>

                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    name="email" type="email" value={formData.email} onChange={handleChange} required
                                    placeholder="Email Address"
                                    className="w-full pl-10 p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-gray-900"
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    name="password" type="password" value={formData.password} onChange={handleChange} required
                                    placeholder="Password"
                                    className="w-full pl-10 p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-gray-900"
                                />
                            </div>

                            <div className="relative">
                                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    name="contactNumber" value={formData.contactNumber} onChange={handleChange} required
                                    placeholder="Contact Number"
                                    pattern="[0-9]{10}"
                                    title="10 digit mobile number"
                                    className="w-full pl-10 p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-gray-900"
                                />
                            </div>
                        </div>

                        {/* Vehicle Info */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-700 border-b pb-2">Vehicle Details</h3>

                            <div className="relative">
                                {formData.vehicleType === 'Bike' ? (
                                    <Bike className="absolute left-3 top-3 text-gray-400" size={18} />
                                ) : formData.vehicleType === 'Van' ? (
                                    <Truck className="absolute left-3 top-3 text-gray-400" size={18} />
                                ) : (
                                    <Car className="absolute left-3 top-3 text-gray-400" size={18} />
                                )}
                                <select
                                    name="vehicleType" value={formData.vehicleType} onChange={handleChange}
                                    className="w-full pl-10 p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none appearance-none text-gray-900"
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
                                    pattern="^[A-Z]{2}-[0-9]{2}-[A-Z0-9]{1,3}-[0-9]{4}$"
                                    title="Format: DL-01-AB-1234"
                                    maxLength={13}
                                    className="w-full pl-10 p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-gray-900"
                                />
                            </div>

                            <div className="relative">
                                <Car className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    name="model" value={formData.model} onChange={handleChange} required
                                    placeholder="Vehicle Model (e.g. Maruti Swift)"
                                    className="w-full pl-10 p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-gray-900"
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
