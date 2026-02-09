"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { gsap } from 'gsap';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserIcon,
    EnvelopeIcon,
    LockClosedIcon,
    ShieldCheckIcon,
    BuildingOfficeIcon,
    HeartIcon,
    DevicePhoneMobileIcon,
    HomeIcon,
    MapPinIcon,
    CalendarIcon,
    ScaleIcon,
    ClipboardDocumentCheckIcon,
    BellIcon,
    CameraIcon,
    PhoneArrowDownLeftIcon,
    BuildingLibraryIcon,
    IdentificationIcon,
    BeakerIcon
} from '@heroicons/react/24/solid';
import MaleIcon from '../../components/atoms/MaleIcon';
import FemaleIcon from '../../components/atoms/FemaleIcon';
import OtherIcon from '../../components/atoms/OtherIcon';
import PulseWheelBloodSelector from '../../components/PulseWheelBloodSelector';
import { useRouter } from 'next/navigation';

const roles: any = {
    donor: {
        icon: HeartIcon,
        color: '#EC4899', // pink-500
        gradient: 'from-pink-500 to-fuchsia-600',
        title: 'Donor',
        description: 'Join the lifeline. Donate or request blood credits.'
    },
    hospital: {
        icon: BuildingOfficeIcon,
        color: '#F43F5E', // rose-500
        gradient: 'from-rose-500 to-pink-600',
        title: 'Hospital',
        description: 'Manage blood requests and inventory in real-time.'
    },
    admin: {
        icon: ShieldCheckIcon,
        color: '#9333EA', // purple-600
        gradient: 'from-purple-500 to-violet-600',
        title: 'Admin',
        description: 'Oversee the entire HemoHive ecosystem.'
    }
};

const validationSchema = yup.lazy(values => {
    const role = values.role;
    if (role === 'donor') {
        return yup.object().shape({
            fullName: yup.string().required('Full name is required'),
            email: yup.string().email('Invalid email format').required('Email is required'),
            password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
            confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Please confirm your password'),
            role: yup.string().oneOf(Object.keys(roles)).required('Please select a role'),
            gender: yup.string().required('Gender is required'),
            dob: yup.date().typeError('Enter a valid date').max(new Date(), 'Date of birth cannot be in the future').required('Date of birth is required'),
            mobile: yup.string().matches(/^[0-9]{10}$/, 'Must be 10 digits').required('Mobile number is required'),
            aadhaar: yup.string().matches(/^[0-9]{12}$/, 'Must be 12 digits').required('Aadhaar number is required'),
            address: yup.string().required('Address is required'),
            city: yup.string().required('City is required'),
            state: yup.string().required('State is required'),
            pincode: yup.string().matches(/^[0-9]{6}$/, 'Must be 6 digits').required('Pincode is required'),
            lastDonationDate: yup.date().max(new Date(), 'Donation date cannot be in the future'),
            weight: yup.number().typeError('Weight must be a number').positive('Weight must be positive'),
            medicalConditions: yup.string(),
            preferredDonationType: yup.string(),
            bloodGroup: yup.string().required('Blood group is required'),
            agreeTerms: yup.boolean().oneOf([true], 'You must agree to the terms and conditions'),
            notificationPreference: yup.string(),
            profilePicture: yup.mixed(),
            emergencyContactName: yup.string(),
            emergencyContactNumber: yup.string(),
            preferredBloodBank: yup.string(),
        });
    } else if (role === 'hospital') {
        return yup.object().shape({
            fullName: yup.string().required('Hospital Name is required'),
            email: yup.string().email('Invalid email format').required('Email is required'),
            password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
            confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Please confirm your password'),
            role: yup.string().oneOf(Object.keys(roles)).required('Please select a role'),
            address: yup.string().required('Hospital Address is required'),
            city: yup.string().required('City is required'),
            state: yup.string().required('State is required'),
            pincode: yup.string().matches(/^[0-9]{6}$/, 'Must be 6 digits').required('Pincode is required'),
            location: yup.object().shape({
                lat: yup.number().required('GPS Location is required'),
                lng: yup.number().required()
            }).required('Please detect GPS location for accuracy')
        });
    } else {
        return yup.object().shape({
            fullName: yup.string().required('Full name is required'),
            email: yup.string().email('Invalid email format').required('Email is required'),
            password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
            confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Please confirm your password'),
            role: yup.string().oneOf(Object.keys(roles)).required('Please select a role'),
        });
    }
});

const donorSteps = [
    { title: 'Personal Info', fields: ['fullName', 'gender', 'dob', 'mobile', 'aadhaar'] },
    { title: 'Contact', fields: ['email', 'address', 'city', 'state', 'pincode'] },
    { title: 'Health', fields: ['lastDonationDate', 'weight', 'medicalConditions', 'preferredDonationType'] },
    { title: 'Blood Group', fields: ['bloodGroup'] },
    { title: 'Account', fields: ['password', 'confirmPassword', 'notificationPreference', 'agreeTerms'] },
    { title: 'Optional', fields: ['profilePicture', 'emergencyContactName', 'emergencyContactNumber', 'preferredBloodBank'] }
];

const RegistrationForm = () => {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState('donor');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<{ success: boolean, message: string } | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [showCamera, setShowCamera] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { register, handleSubmit, watch, formState: { errors }, setValue, trigger } = useForm<any>({
        resolver: yupResolver(validationSchema),
        defaultValues: { role: 'donor', notificationPreference: 'Email' }
    });

    const role = watch('role');
    const genderValue = watch('gender');

    useEffect(() => {
        setSelectedRole(role);
        setCurrentStep(0); // Reset step when role changes
        gsap.to('.bg-container', {
            background: `linear-gradient(135deg, ${roles[role].gradient.split(' ')[0].replace('from-', '')} 0%, ${roles[role].gradient.split(' ')[1].replace('to-', '')} 100%)`,
            duration: 0.8,
            ease: 'power3.inOut'
        });
    }, [role]);

    const openCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error("Error accessing camera:", error);
        }
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const imageDataUrl = canvas.toDataURL('image/png');
                setCapturedImage(imageDataUrl);
                setValue('profilePicture', dataURLtoFile(imageDataUrl, 'capture.png'));
            }
            setShowCamera(false);
            const stream = video.srcObject as MediaStream;
            if (stream) {
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
                video.srcObject = null;
            }
        }
    };

    const dataURLtoFile = (dataurl: string, filename: string) => {
        let arr = dataurl.split(',');
        let match = arr[0].match(/:(.*?);/);
        let mime = match ? match[1] : 'image/png';
        let bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    useEffect(() => {
        if (showCamera) {
            openCamera();
        }
    }, [showCamera]);

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        setSubmissionStatus(null);
        try {
            const formData = new FormData();
            for (const key in data) {
                if (key === 'profilePicture' && data[key] && data[key][0]) {
                    formData.append(key, data[key][0]);
                } else if (key === 'location' && data[key]) {
                    // Start of Selection
                    formData.append('location[lat]', data[key].lat.toString());
                    formData.append('location[lng]', data[key].lng.toString());
                    // End of Selection
                } else {
                    formData.append(key, data[key] as string);
                }
            }
            // Replace with your API endpoint
            const response = await axios.post('/api/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSubmissionStatus({ success: true, message: `Welcome, ${data.fullName}! Registration successful.` });

            // Redirect to login page after successful registration
            router.push('/login');

        } catch (error) {
            setSubmissionStatus({ success: false, message: (error as any).response?.data?.message || 'An error occurred.' });
        }
        setIsSubmitting(false);
    };

    const InputField = ({ name, type, placeholder, icon: Icon }: { name: string; type: string; placeholder: string; icon?: React.ElementType }) => (
        <div className="relative mb-4">
            {Icon && <Icon className={`absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors duration-300 ${errors[name] ? 'text-red-400' : 'group-focus-within:text-white'}`} />}
            <input
                {...register(name)}
                type={type}
                placeholder={placeholder}
                className={`w-full py-3 pl-12 pr-4 bg-gray-900 bg-opacity-40 rounded-lg border transition-all duration-300 outline-none focus:ring-2 focus:bg-opacity-60 ${errors[name] ? 'border-red-500 ring-red-500' : `border-gray-600 focus:ring-[${roles[role].color}] focus:border-[${roles[role].color}]`}`}
            />
            <AnimatePresence>
                {errors[name] && (
                    <motion.p className="text-xs text-red-400 mt-1 ml-2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        {(errors[name] as any)?.message}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );

    const nextStep = async () => {
        const fields = donorSteps[currentStep].fields;
        const isValid = await trigger(fields);
        if (isValid) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    return (
        <div className="bg-container min-h-screen font-sans">
            <div className="h-20" />
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 p-8">
                <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }} className="flex flex-col justify-start pt-16">
                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-tight shadow-lg">
                        Join the Lifeline.
                        <br />
                        <span style={{ color: roles[selectedRole].color }}>Save a Life.</span>
                    </h1>
                    <p className="mt-4 text-lg text-gray-300 max-w-md">
                        Your registration is the first step in a chain of events that delivers hope. Choose your role and become part of the HemoHive network.
                    </p>
                </motion.div>

                <motion.div className="glass-card bg-black bg-opacity-25 backdrop-blur-xl border border-white border-opacity-10 rounded-2xl shadow-2xl p-8" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}>
                    <div className="flex justify-center space-x-4 mb-6">
                        {Object.keys(roles).map(r => (
                            <button key={r} onClick={() => setValue('role', r, { shouldValidate: true })} className={`p-3 rounded-full transition-all duration-300 ${role === r ? 'scale-110 shadow-lg' : 'opacity-60 hover:opacity-100'}`}>
                                <span className={`block p-3 rounded-full bg-gray-800`} style={{ backgroundColor: role === r ? roles[r].color : '#1F2937' }}
                                >
                                    {React.createElement(roles[r].icon, { className: 'w-6 h-6 text-white' })}
                                </span>
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div key={selectedRole} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white">{roles[selectedRole].title} Registration</h2>
                            <p className="text-sm text-gray-400">{roles[selectedRole].description}</p>
                        </motion.div>
                    </AnimatePresence>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        {role === 'donor' ? (
                            <>
                                <div className="relative mb-12">
                                    {/* Background bar */}
                                    <div className="absolute top-4 left-0 w-full h-1 bg-gray-700" />
                                    {/* Progress bar */}
                                    <div
                                        className="absolute top-4 left-0 h-1 bg-[#EC4899] transition-all duration-500"
                                        style={{ width: `${(currentStep / (donorSteps.length - 1)) * 100}%` }}
                                    />
                                    {/* Steps */}
                                    <div className="flex justify-between">
                                        {donorSteps.map((step, index) => (
                                            <div key={index} className="z-10 flex flex-col items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${index <= currentStep ? 'bg-[#EC4899] shadow-lg' : 'bg-gray-700'} text-white font-bold`}>
                                                    {index + 1}
                                                </div>
                                                <p className={`text-xs mt-2 text-center transition-colors duration-300 ${index <= currentStep ? 'text-white' : 'text-gray-400'}`}>{step.title}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <AnimatePresence mode="wait">
                                    <motion.div key={currentStep} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
                                        {currentStep === 0 && (
                                            <>
                                                <InputField name="fullName" type="text" placeholder="Full Name" icon={UserIcon} />
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                                                    <div className="flex justify-around">
                                                        <div
                                                            className={`cursor-pointer p-4 rounded-lg transition-all duration-200 ${genderValue === 'male' ? 'bg-pink-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                                            onClick={() => setValue('gender', 'male', { shouldValidate: true })}
                                                        >
                                                            <MaleIcon className="h-8 w-8 mx-auto" />
                                                            <p className="text-center text-xs mt-1">Male</p>
                                                        </div>
                                                        <div
                                                            className={`cursor-pointer p-4 rounded-lg transition-all duration-200 ${genderValue === 'female' ? 'bg-pink-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                                            onClick={() => setValue('gender', 'female', { shouldValidate: true })}
                                                        >
                                                            <FemaleIcon className="h-8 w-8 mx-auto" />
                                                            <p className="text-center text-xs mt-1">Female</p>
                                                        </div>
                                                        <div
                                                            className={`cursor-pointer p-4 rounded-lg transition-all duration-200 ${genderValue === 'other' ? 'bg-pink-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                                            onClick={() => setValue('gender', 'other', { shouldValidate: true })}
                                                        >
                                                            <OtherIcon className="h-8 w-8 mx-auto" />
                                                            <p className="text-center text-xs mt-1">Other</p>
                                                        </div>
                                                    </div>
                                                    {errors.gender && <p className="text-xs text-red-400 mt-1 ml-2">{(errors.gender as any)?.message}</p>}
                                                </div>
                                                <InputField name="dob" type="date" placeholder="Date of Birth" icon={CalendarIcon} />
                                                <InputField name="mobile" type="text" placeholder="Mobile Number" icon={DevicePhoneMobileIcon} />
                                                <InputField name="aadhaar" type="text" placeholder="Aadhaar Number" icon={ShieldCheckIcon} />
                                            </>
                                        )}
                                        {currentStep === 1 && (
                                            <>
                                                <InputField name="email" type="email" placeholder="Email Address" icon={EnvelopeIcon} />
                                                <InputField name="address" type="text" placeholder="Full Address" icon={HomeIcon} />
                                                <InputField name="city" type="text" placeholder="City" icon={MapPinIcon} />
                                                <InputField name="state" type="text" placeholder="State" icon={MapPinIcon} />
                                                <InputField name="pincode" type="text" placeholder="Pincode" icon={MapPinIcon} />
                                            </>
                                        )}
                                        {currentStep === 2 && (
                                            <>
                                                <InputField name="lastDonationDate" type="date" placeholder="Last Donation Date (Optional)" icon={CalendarIcon} />
                                                <InputField name="weight" type="number" placeholder="Weight in kg (Optional)" icon={ScaleIcon} />
                                                <InputField name="medicalConditions" type="text" placeholder="Medical Conditions (Optional)" icon={ClipboardDocumentCheckIcon} />
                                                <InputField name="preferredDonationType" type="text" placeholder="Preferred Donation (Optional)" icon={BeakerIcon} />
                                            </>
                                        )}
                                        {currentStep === 3 && (
                                            <PulseWheelBloodSelector
                                                onSelect={(bloodGroup: string) => setValue('bloodGroup', bloodGroup, { shouldValidate: true })}
                                                onNext={nextStep}
                                            />
                                        )}
                                        {currentStep === 4 && (
                                            <>
                                                <InputField name="password" type="password" placeholder="Password" icon={LockClosedIcon} />
                                                <InputField name="confirmPassword" type="password" placeholder="Confirm Password" icon={LockClosedIcon} />
                                                <div className="relative mb-4">
                                                    <BellIcon className="absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                    <select {...register("notificationPreference")} className="w-full py-3 pl-12 pr-4 bg-gray-900 bg-opacity-40 rounded-lg border border-gray-600 focus:ring-2 focus:ring-[#EC4899] focus:border-[#EC4899] outline-none">
                                                        <option>Email</option>
                                                        <option>SMS</option>
                                                        <option>WhatsApp</option>
                                                    </select>
                                                </div>
                                                <div className="flex items-center">
                                                    <input {...register("agreeTerms")} type="checkbox" id="agreeTerms" className="h-4 w-4 rounded border-gray-300 text-[#EC4899] focus:ring-[#EC4899]" />
                                                    <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-300">
                                                        I agree to the <a href="/terms" className="font-medium text-[#EC4899] hover:underline">Terms and Conditions</a>
                                                    </label>
                                                </div>
                                                {errors.agreeTerms && <p className="text-xs text-red-400 mt-1">{(errors.agreeTerms as any)?.message}</p>}
                                            </>
                                        )}
                                        {currentStep === 5 && (
                                            <>
                                                <div className="relative mb-4">
                                                    <div className="flex items-center">
                                                        <CameraIcon className="absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                        <input {...register("profilePicture")} type="file" className="w-full py-3 pl-12 pr-4 bg-gray-900 bg-opacity-40 rounded-lg border border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#EC4899] file:text-white hover:file:bg-pink-600" />
                                                        <button type="button" onClick={() => setShowCamera(prev => !prev)} className="ml-4 py-3 px-4 bg-gray-700 rounded-lg text-white">
                                                            <CameraIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                    {showCamera && (
                                                        <div className="mt-4">
                                                            <video ref={videoRef} autoPlay className="w-full rounded-lg"></video>
                                                            <button type="button" onClick={captureImage} className="mt-2 py-2 px-4 bg-pink-500 rounded-lg text-white">
                                                                Capture
                                                            </button>
                                                        </div>
                                                    )}
                                                    <canvas ref={canvasRef} className="hidden"></canvas>
                                                    {capturedImage && (
                                                        <div className="mt-4">
                                                            <p className="text-white">Captured Image:</p>
                                                            <img src={capturedImage} alt="Captured" className="w-32 h-32 rounded-lg mt-2" />
                                                        </div>
                                                    )}
                                                </div>
                                                <InputField name="emergencyContactName" type="text" placeholder="Emergency Contact Name" icon={UserIcon} />
                                                <InputField name="emergencyContactNumber" type="text" placeholder="Emergency Contact Number" icon={PhoneArrowDownLeftIcon} />
                                                <InputField name="preferredBloodBank" type="text" placeholder="Preferred Blood Bank" icon={BuildingLibraryIcon} />
                                            </>
                                        )}
                                    </motion.div>
                                </AnimatePresence>

                                <div className="flex justify-between mt-8">
                                    <div>
                                        {currentStep > 0 && (
                                            <motion.button type="button" onClick={prevStep} className="py-2 px-6 font-bold text-white rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                                                Back
                                            </motion.button>
                                        )}
                                    </div>
                                    <div>
                                        {currentStep < donorSteps.length - 1 && currentStep !== 3 && (
                                            <motion.button type="button" onClick={nextStep} className={`py-2 px-8 font-bold text-white rounded-lg bg-gradient-to-r ${roles[selectedRole].gradient}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                                                Next
                                            </motion.button>
                                        )}
                                        {currentStep === donorSteps.length - 1 && (
                                            <motion.button type="submit" disabled={isSubmitting} className={`py-2 px-8 font-bold text-white rounded-lg shadow-lg transition-all duration-300 ${isSubmitting ? 'bg-gray-600' : `bg-gradient-to-r ${roles[selectedRole].gradient}`}`} whileHover={{ scale: 1.05, y: -2, boxShadow: `0 10px 20px ${roles[selectedRole].color}40` }} whileTap={{ scale: 0.98 }}>
                                                {isSubmitting ? 'Creating Account...' : 'Finish'}
                                            </motion.button>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : role === 'hospital' ? (
                            <>
                                <InputField name="fullName" type="text" placeholder="Hospital Name" icon={UserIcon} />
                                <InputField name="email" type="email" placeholder="Email Address" icon={EnvelopeIcon} />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField name="address" type="text" placeholder="Hospital Address" icon={BuildingOfficeIcon} />
                                    <InputField name="pincode" type="text" placeholder="Pincode" icon={MapPinIcon} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField name="city" type="text" placeholder="City" icon={MapPinIcon} />
                                    <InputField name="state" type="text" placeholder="State" icon={MapPinIcon} />
                                </div>

                                {/* GPS Location Capture */}
                                <div className="mb-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!navigator.geolocation) {
                                                alert("GPS not supported");
                                                return;
                                            }
                                            navigator.geolocation.getCurrentPosition(
                                                (pos) => {
                                                    const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                                                    setValue('location', loc, { shouldValidate: true });
                                                    // Auto-fill address if empty using reverse geocoding could go here, 
                                                    // but for now we just capture accurate GPS.
                                                    alert("GPS Location Captured! ✅");
                                                },
                                                (err) => alert("GPS Error: " + err.message),
                                                { enableHighAccuracy: true }
                                            );
                                        }}
                                        className="w-full py-3 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-pink-400 font-bold border border-gray-600 border-dashed transition-all"
                                    >
                                        <MapPinIcon className="w-5 h-5" />
                                        {watch('location') ? 'Location Captured ✅' : 'Detect Accurate Location (Required)'}
                                    </button>
                                    {errors.location && <p className="text-xs text-red-400 mt-1 ml-2">{(errors.location as any)?.message}</p>}
                                </div>

                                <InputField name="password" type="password" placeholder="Password" icon={LockClosedIcon} />
                                <InputField name="confirmPassword" type="password" placeholder="Confirm Password" icon={LockClosedIcon} />

                                <motion.button type="submit" disabled={isSubmitting} className={`w-full py-3 mt-4 font-bold text-white rounded-lg shadow-lg transition-all duration-300 ${isSubmitting ? 'bg-gray-600' : `bg-gradient-to-r ${roles[selectedRole].gradient}`}`} whileHover={{ scale: 1.05, y: -2, boxShadow: `0 10px 20px ${roles[selectedRole].color}40` }} whileTap={{ scale: 0.98 }}>
                                    {isSubmitting ? 'Registering...' : 'Register Hospital'}
                                </motion.button>
                            </>
                        ) : (
                            <>
                                <InputField name="fullName" type="text" placeholder="Full Name" icon={UserIcon} />
                                <InputField name="email" type="email" placeholder="Email Address" icon={EnvelopeIcon} />
                                <InputField name="password" type="password" placeholder="Password" icon={LockClosedIcon} />
                                <InputField name="confirmPassword" type="password" placeholder="Confirm Password" icon={LockClosedIcon} />
                                <motion.button type="submit" disabled={isSubmitting} className={`w-full py-3 mt-4 font-bold text-white rounded-lg shadow-lg transition-all duration-300 ${isSubmitting ? 'bg-gray-600' : `bg-gradient-to-r ${roles[selectedRole].gradient}`}`} whileHover={{ scale: 1.05, y: -2, boxShadow: `0 10px 20px ${roles[selectedRole].color}40` }} whileTap={{ scale: 0.98 }}>
                                    {isSubmitting ? 'Registering...' : 'Create Account'}
                                </motion.button>
                            </>
                        )}
                    </form>

                    {submissionStatus && (
                        <motion.div className={`mt-4 p-3 rounded-lg text-center text-sm ${submissionStatus.success ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            {submissionStatus.message}
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

export default RegistrationForm;

''