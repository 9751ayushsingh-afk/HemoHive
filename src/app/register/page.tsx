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
    BeakerIcon,
    QuestionMarkCircleIcon,
    EyeIcon,
    EyeSlashIcon
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
    const checkUniqueness = async (field: string, value: string | undefined) => {
        if (!value) return true;
        try {
            const res = await axios.post('/api/register/check', { field, value });
            return !res.data.exists;
        } catch (error) {
            console.error("Uniqueness check error", error);
            return true;
        }
    };

    if (role === 'donor') {
        return yup.object().shape({
            fullName: yup.string().required('Full name is required'),
            email: yup.string().email('Invalid email format').required('Email is required')
                .test('unique-email', 'Email already registered', value => checkUniqueness('email', value)),
            password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
            confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Please confirm your password'),
            role: yup.string().oneOf(Object.keys(roles)).required('Please select a role'),
            gender: yup.string().required('Gender is required'),
            mobile: yup.string().matches(/^[0-9]{10}$/, 'Must be 10 digits').required('Mobile number is required')
                .test('unique-mobile', 'Mobile number already registered', value => checkUniqueness('mobile', value)),
            address: yup.string().required('Address is required'),
            city: yup.string().required('City is required'),
            state: yup.string().required('State is required'),
            pincode: yup.string().matches(/^[0-9]{6}$/, 'Must be 6 digits').required('Pincode is required'),
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
            email: yup.string().email('Invalid email format').required('Email is required')
                .test('unique-email', 'Email already registered', value => checkUniqueness('email', value)),
            mobile: yup.string().matches(/^[0-9]{10}$/, 'Must be 10 digits').required('Contact number is required')
                .test('unique-mobile', 'Contact number already registered', value => checkUniqueness('mobile', value)),
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
            email: yup.string().email('Invalid email format').required('Email is required')
                .test('unique-email', 'Email already registered', value => checkUniqueness('email', value)),
            password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
            confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Please confirm your password'),
            role: yup.string().oneOf(Object.keys(roles)).required('Please select a role'),
        });
    }
});

const InputField = ({ name, type, placeholder, icon: Icon, errors, register, role, roles, tooltip, onEnter }: { name: string; type: string; placeholder: string; icon?: React.ElementType; errors: any; register: any; role: string; roles: any; tooltip?: string, onEnter?: () => void }) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const form = e.currentTarget.form;
            if (!form) return;

            const allElements = Array.from(form.elements) as HTMLElement[];
            const focusableElements = allElements.filter(el =>
                (el.tagName === 'INPUT' || el.tagName === 'SELECT') &&
                !(el as HTMLInputElement).disabled
            );

            const currentIndex = focusableElements.indexOf(e.currentTarget);
            const nextElement = focusableElements[currentIndex + 1];

            if (nextElement) {
                nextElement.focus();
            } else if (onEnter) {
                onEnter();
            }
        }
    };

    const isPasswordField = type === 'password';
    const inputType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className="relative mb-4 group">
            <div className="flex items-center justify-between mb-1">
                {tooltip && (
                    <div className="relative flex items-center group/tooltip ml-auto">
                        <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
                        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-white text-[10px] rounded shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 border border-white/10">
                            {tooltip}
                        </div>
                    </div>
                )}
            </div>
            <div className="relative">
                {Icon && <Icon className={`absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors duration-300 ${errors[name] ? 'text-red-400' : 'group-focus-within:text-white'}`} />}
                <input
                    {...register(name)}
                    type={inputType}
                    placeholder={placeholder}
                    onKeyDown={handleKeyDown}
                    className={`w-full py-3 pl-12 pr-12 bg-gray-900 bg-opacity-40 rounded-lg border transition-all duration-300 outline-none focus:ring-2 focus:bg-opacity-60 ${errors[name] ? 'border-red-500 ring-red-500' : `border-gray-600 focus:ring-[${roles[role].color}] focus:border-[${roles[role].color}]`}`}
                />
                {isPasswordField && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                )}
            </div>
            <AnimatePresence>
                {errors[name] && (
                    <motion.p className="text-xs text-red-400 mt-1 ml-2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        {(errors[name] as any)?.message}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
};

const donorSteps = [
    { title: 'Personal Info', fields: ['fullName', 'gender', 'mobile', 'email'] },
    { title: 'Contact', fields: ['address', 'city', 'state', 'pincode'] },
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

    const { register, handleSubmit, watch, formState: { errors, isValid }, setValue, trigger } = useForm<any>({
        resolver: yupResolver(validationSchema),
        mode: 'onChange',
        defaultValues: { role: 'donor', notificationPreference: 'Email' }
    });

    const role = watch('role');
    const genderValue = watch('gender');
    const pincodeValue = watch('pincode');

    // Handle Pincode Auto-fetch
    useEffect(() => {
        if (pincodeValue && pincodeValue.length === 6) {
            const fetchCityState = async () => {
                try {
                    const response = await axios.get(`https://api.postalpincode.in/pincode/${pincodeValue}`);
                    if (response.data[0].Status === "Success") {
                        const postOffice = response.data[0].PostOffice[0];
                        setValue('city', postOffice.District, { shouldValidate: true });
                        setValue('state', postOffice.State, { shouldValidate: true });
                    }
                } catch (error) {
                    console.error("Pincode fetch error:", error);
                }
            };
            fetchCityState();
        }
    }, [pincodeValue, setValue]);

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
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play().catch(e => console.error("Auto-play failed:", e));
                };
            }
        } catch (error) {
            console.error("Error accessing camera:", error);
            alert("Camera Error: Please ensure camera permissions are allowed.");
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
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [showCamera]);

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        setSubmissionStatus(null);
        try {
            const formData = new FormData();
            if (capturedImage) {
                const capturedFile = dataURLtoFile(capturedImage, 'profile-picture.png');
                formData.set('profilePicture', capturedFile);
            }

            for (const key in data) {
                if (key === 'profilePicture' && data[key] && data[key][0]) {
                    if (!capturedImage) formData.append(key, data[key][0]);
                } else if (key === 'location' && data[key]) {
                    formData.append('location[lat]', data[key].lat.toString());
                    formData.append('location[lng]', data[key].lng.toString());
                } else {
                    formData.append(key, data[key] as string);
                }
            }

            // Stop camera before submission finishes
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
            setShowCamera(false);

            const response = await axios.post('/api/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSubmissionStatus({ success: true, message: `Welcome, ${data.fullName}! Registration successful.` });
            router.push('/login');

        } catch (error) {
            setSubmissionStatus({ success: false, message: (error as any).response?.data?.message || 'An error occurred.' });
        }
        setIsSubmitting(false);
    };



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
                                                <InputField name="fullName" type="text" placeholder="Full Name" icon={UserIcon} errors={errors} register={register} role={role} roles={roles} />
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
                                                <InputField name="mobile" type="text" placeholder="Mobile Number" icon={DevicePhoneMobileIcon} errors={errors} register={register} role={role} roles={roles} tooltip="Your 10-digit mobile number will be used for critical blood requests and emergency alerts." />
                                                <InputField name="email" type="email" placeholder="Email Address" icon={EnvelopeIcon} errors={errors} register={register} role={role} roles={roles} onEnter={nextStep} tooltip="We will send your digital donor card and donation history details to this email." />
                                            </>
                                        )}
                                        {currentStep === 1 && (
                                            <>
                                                <InputField name="pincode" type="text" placeholder="Pincode" icon={MapPinIcon} errors={errors} register={register} role={role} roles={roles} />
                                                <InputField name="address" type="text" placeholder="Full Address" icon={HomeIcon} errors={errors} register={register} role={role} roles={roles} />
                                                <InputField name="city" type="text" placeholder="City" icon={MapPinIcon} errors={errors} register={register} role={role} roles={roles} />
                                                <InputField name="state" type="text" placeholder="State" icon={MapPinIcon} errors={errors} register={register} role={role} roles={roles} onEnter={nextStep} />
                                            </>
                                        )}
                                        {currentStep === 2 && (
                                            <PulseWheelBloodSelector
                                                onSelect={(bloodGroup: string) => setValue('bloodGroup', bloodGroup, { shouldValidate: true })}
                                                onNext={nextStep}
                                            />
                                        )}

                                        {currentStep === 3 && (
                                            <>
                                                <InputField name="password" type="password" placeholder="Password" icon={LockClosedIcon} errors={errors} register={register} role={role} roles={roles} />
                                                <InputField name="confirmPassword" type="password" placeholder="Confirm Password" icon={LockClosedIcon} errors={errors} register={register} role={role} roles={roles} onEnter={nextStep} />
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
                                        {currentStep === 4 && (
                                            <>
                                                <div className="mb-6 text-center">
                                                    <p className="text-pink-400 font-bold mb-1">Final Step: Optional</p>
                                                    <p className="text-xs text-gray-400 italic mb-4">Feel free to skip this section and click "Finish" to submit directly.</p>
                                                </div>
                                                <div className="relative mb-6 p-4 bg-gray-900 bg-opacity-30 rounded-xl border border-dashed border-gray-600">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <label className="text-sm font-medium text-gray-300">Profile Picture</label>
                                                        <button type="button" onClick={() => setShowCamera(prev => !prev)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${showCamera ? 'bg-red-500 hover:bg-red-600' : 'bg-[#EC4899] hover:bg-pink-600'} text-white text-xs font-bold`}>
                                                            <CameraIcon className="h-4 w-4" />
                                                            {showCamera ? 'Close Camera' : 'Take Photo'}
                                                        </button>
                                                    </div>

                                                    <div className="flex flex-col gap-4">
                                                        <input {...register("profilePicture")} type="file" className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-gray-800 file:text-pink-400 hover:file:bg-gray-700" />

                                                        <AnimatePresence>
                                                            {showCamera && (
                                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                                                    <div className="relative aspect-video bg-black rounded-lg border border-gray-700 overflow-hidden shadow-2xl">
                                                                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                                                                        <button type="button" onClick={captureImage} className="absolute bottom-4 left-1/2 -translate-x-1/2 p-4 bg-[#EC4899] hover:bg-pink-600 text-white rounded-full shadow-lg transition-transform active:scale-90">
                                                                            <CameraIcon className="h-6 w-6" />
                                                                        </button>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>

                                                        {capturedImage && (
                                                            <div className="flex items-center gap-4 p-2 bg-green-500/10 rounded-lg border border-green-500/30">
                                                                <img src={capturedImage} alt="Captured" className="w-16 h-16 rounded object-cover shadow-md" />
                                                                <div>
                                                                    <p className="text-green-400 text-xs font-bold">Photo Captured! ✅</p>
                                                                    <p className="text-[10px] text-gray-400">This photo will be used for your ID card.</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <canvas ref={canvasRef} className="hidden"></canvas>
                                                </div>
                                                <InputField name="emergencyContactName" type="text" placeholder="Emergency Contact Name" icon={UserIcon} errors={errors} register={register} role={role} roles={roles} />
                                                <InputField name="emergencyContactNumber" type="text" placeholder="Emergency Contact Number" icon={PhoneArrowDownLeftIcon} errors={errors} register={register} role={role} roles={roles} />
                                                <InputField name="preferredBloodBank" type="text" placeholder="Preferred Blood Bank" icon={BuildingLibraryIcon} errors={errors} register={register} role={role} roles={roles} />
                                            </>
                                        )}
                                    </motion.div>
                                </AnimatePresence>

                                <div className="flex justify-between mt-8 relative z-50">
                                    <div className="flex gap-4">
                                        {currentStep > 0 && (
                                            <motion.button type="button" onClick={prevStep} className="py-2 px-6 font-bold text-white rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                                                Back
                                            </motion.button>
                                        )}
                                    </div>
                                    <div className="flex gap-4">
                                        {currentStep < donorSteps.length - 1 && currentStep !== 2 && (
                                            <motion.button
                                                type="button"
                                                onClick={nextStep}
                                                disabled={donorSteps[currentStep].fields.some(f => !!errors[f])}
                                                className={`py-2 px-8 font-bold text-white rounded-lg transition-all duration-300 ${donorSteps[currentStep].fields.some(f => !!errors[f]) ? 'bg-gray-600 opacity-50 cursor-not-allowed' : `bg-gradient-to-r ${roles[selectedRole].gradient}`}`}
                                                whileHover={donorSteps[currentStep].fields.some(f => !!errors[f]) ? {} : { scale: 1.05 }}
                                                whileTap={donorSteps[currentStep].fields.some(f => !!errors[f]) ? {} : { scale: 0.98 }}
                                            >
                                                Next
                                            </motion.button>
                                        )}
                                        {currentStep === donorSteps.length - 1 && (
                                            <motion.button
                                                type="submit"
                                                disabled={isSubmitting || donorSteps[currentStep].fields.some(f => !!errors[f]) || (showCamera && !capturedImage)}
                                                className={`py-2 px-8 font-bold text-white rounded-lg shadow-lg transition-all duration-300 ${isSubmitting || donorSteps[currentStep].fields.some(f => !!errors[f]) || (showCamera && !capturedImage) ? 'bg-gray-600 opacity-50 cursor-not-allowed' : `bg-gradient-to-r ${roles[selectedRole].gradient}`}`}
                                                whileHover={isSubmitting || donorSteps[currentStep].fields.some(f => !!errors[f]) || (showCamera && !capturedImage) ? {} : { scale: 1.05, y: -2, boxShadow: `0 10px 20px ${roles[selectedRole].color}40` }}
                                                whileTap={isSubmitting || donorSteps[currentStep].fields.some(f => !!errors[f]) || (showCamera && !capturedImage) ? {} : { scale: 0.98 }}
                                            >
                                                {isSubmitting ? 'Creating Account...' : 'Finish'}
                                            </motion.button>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : role === 'hospital' ? (
                            <>
                                <InputField name="fullName" type="text" placeholder="Hospital Name" icon={UserIcon} errors={errors} register={register} role={role} roles={roles} />
                                <InputField name="mobile" type="text" placeholder="Contact Number (10 digits)" icon={DevicePhoneMobileIcon} errors={errors} register={register} role={role} roles={roles} />
                                <InputField name="email" type="email" placeholder="Email Address" icon={EnvelopeIcon} errors={errors} register={register} role={role} roles={roles} />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField name="address" type="text" placeholder="Hospital Address" icon={BuildingOfficeIcon} errors={errors} register={register} role={role} roles={roles} />
                                    <InputField name="pincode" type="text" placeholder="Pincode" icon={MapPinIcon} errors={errors} register={register} role={role} roles={roles} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField name="city" type="text" placeholder="City" icon={MapPinIcon} errors={errors} register={register} role={role} roles={roles} />
                                    <InputField name="state" type="text" placeholder="State" icon={MapPinIcon} errors={errors} register={register} role={role} roles={roles} />
                                </div>
                                {/* ... Hospital location button ... */}
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

                                <InputField name="password" type="password" placeholder="Password" icon={LockClosedIcon} errors={errors} register={register} role={role} roles={roles} />
                                <InputField name="confirmPassword" type="password" placeholder="Confirm Password" icon={LockClosedIcon} errors={errors} register={register} role={role} roles={roles} />

                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting || !isValid}
                                    className={`w-full py-3 mt-4 font-bold text-white rounded-lg shadow-lg transition-all duration-300 ${isSubmitting || !isValid ? 'bg-gray-600 opacity-50 cursor-not-allowed' : `bg-gradient-to-r ${roles[selectedRole].gradient}`}`}
                                    whileHover={isSubmitting || !isValid ? {} : { scale: 1.05, y: -2, boxShadow: `0 10px 20px ${roles[selectedRole].color}40` }}
                                    whileTap={isSubmitting || !isValid ? {} : { scale: 0.98 }}
                                >
                                    {isSubmitting ? 'Registering...' : 'Register Hospital'}
                                </motion.button>
                            </>
                        ) : (
                            <>
                                <InputField name="fullName" type="text" placeholder="Full Name" icon={UserIcon} errors={errors} register={register} role={role} roles={roles} />
                                <InputField name="email" type="email" placeholder="Email Address" icon={EnvelopeIcon} errors={errors} register={register} role={role} roles={roles} />
                                <InputField name="password" type="password" placeholder="Password" icon={LockClosedIcon} errors={errors} register={register} role={role} roles={roles} />
                                <InputField name="confirmPassword" type="password" placeholder="Confirm Password" icon={LockClosedIcon} errors={errors} register={register} role={role} roles={roles} />
                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting || Object.keys(errors).length > 0}
                                    className={`w-full py-3 mt-4 font-bold text-white rounded-lg shadow-lg transition-all duration-300 ${isSubmitting || Object.keys(errors).length > 0 ? 'bg-gray-600 opacity-50 cursor-not-allowed' : `bg-gradient-to-r ${roles[selectedRole].gradient}`}`}
                                    whileHover={isSubmitting || Object.keys(errors).length > 0 ? {} : { scale: 1.05, y: -2, boxShadow: `0 10px 20px ${roles[selectedRole].color}40` }}
                                    whileTap={isSubmitting || Object.keys(errors).length > 0 ? {} : { scale: 0.98 }}
                                >
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