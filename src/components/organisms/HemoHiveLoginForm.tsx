
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import '../MonkeyAnimation.css';

const loginSchema = yup.object().shape({
    identifier: yup.string().required('Email or Mobile is required'),
    password: yup.string().required('Password is required'),
});

const InputField = ({ name, type, placeholder, icon: Icon, register, errors, rightElement }: any) => (
    <div className="relative mb-6">
        {Icon && <Icon className={`absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors duration-300 z-10 ${errors[name] ? 'text-red-400' : 'group-focus-within:text-white'}`} />}
        <input
            {...register(name)}
            type={type}
            placeholder={placeholder}
            className={`w-full h-[52px] pl-12 pr-20 bg-gray-900 bg-opacity-40 rounded-lg border border-gray-600 transition-all duration-300 outline-none focus:ring-2 focus:ring-[#EC4899] focus:border-[#EC4899] focus:bg-opacity-60 ${errors[name] ? 'border-red-500 ring-red-500' : ''}`}
        />
        {rightElement}
        <AnimatePresence>
            {errors[name] && (
                <motion.p className="text-xs text-red-400 mt-1 ml-2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    {errors[name]?.message as string}
                </motion.p>
            )}
        </AnimatePresence>
    </div>
);

const HemoHiveLoginForm = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<{ success: boolean; message: string } | null>(null);
    const [isBlind, setIsBlind] = useState(true);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(loginSchema),
    });

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        setSubmissionStatus(null);

        const result = await signIn('credentials', {
            redirect: false,
            email: data.identifier,
            password: data.password,
        });

        if (result?.error) {
            setSubmissionStatus({ success: false, message: 'Login failed. Please check your credentials.' });
        } else if (result?.ok) {
            setSubmissionStatus({ success: true, message: 'Login successful! Redirecting...' });
            router.push('/auth/redirect');
        }

        setIsSubmitting(false);
    };



    return (
        <motion.div
            className="glass-card bg-black bg-opacity-25 backdrop-blur-xl border border-white border-opacity-10 rounded-2xl shadow-2xl p-8 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <div className="card">
                <input
                    checked={isBlind}
                    onChange={(e) => setIsBlind(e.target.checked)}
                    className="blind-check"
                    type="checkbox"
                    id="blind-input"
                    name="blindcheck"
                    hidden
                />
                <form onSubmit={handleSubmit(onSubmit)} className="form">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
                        <p className="text-sm text-gray-400">Sign in to continue to HemoHive</p>
                    </div>
                    <InputField name="identifier" type="text" placeholder="Email or Mobile Number" icon={EnvelopeIcon} register={register} errors={errors} />
                    <InputField
                        name="password"
                        type={isBlind ? "password" : "text"}
                        placeholder="Password"
                        icon={LockClosedIcon}
                        register={register}
                        errors={errors}
                        rightElement={
                            <label htmlFor="blind-input" className="blind_input">
                                {isBlind ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </label>
                        }
                    />

                    <div className="text-right mb-6">
                        <a href="#" className="text-sm text-gray-400 hover:text-white hover:underline transition-colors">Forgot Password?</a>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-3 font-bold text-white rounded-xl relative overflow-hidden group transition-all duration-700 ${isSubmitting ? 'bg-gray-600' : 'bg-gradient-to-br from-pink-500 via-pink-600 to-fuchsia-700'}`}
                        whileHover={{
                            borderRadius: "32px",
                            boxShadow: "0 25px 50px -12px rgba(236, 72, 153, 0.4), 0 0 15px rgba(236, 72, 153, 0.1)"
                        }}
                        whileTap={{ borderRadius: "20px" }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                            borderRadius: { duration: 0.1 }
                        }}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {isSubmitting ? 'Signing In...' : 'Sign In'}
                        </span>
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent z-0"
                            initial={{ x: '-150%', skewX: -20 }}
                            whileHover={{ x: '150%' }}
                            transition={{ duration: 1.2, ease: "easeInOut" }}
                        />
                    </motion.button>

                    <div className="relative my-6 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <span className="relative px-4 text-xs font-bold uppercase tracking-widest text-gray-500 bg-transparent">OR</span>
                    </div>

                    <motion.button
                        type="button"
                        onClick={() => signIn('google', { callbackUrl: '/auth/redirect' })}
                        className="w-full py-3 flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-xl font-bold text-white relative overflow-hidden transition-all duration-700"
                        whileHover={{
                            borderRadius: "32px",
                            backgroundColor: "rgba(255, 255, 255, 0.12)",
                            boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.4)"
                        }}
                        whileTap={{ borderRadius: "20px" }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                            borderRadius: { duration: 0.1 }
                        }}
                    >
                        <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="relative z-10">Continue with Google</span>
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent z-0"
                            initial={{ x: '-150%', skewX: -20 }}
                            whileHover={{ x: '150%' }}
                            transition={{ duration: 1.4, ease: "easeInOut" }}
                        />
                    </motion.button>
                </form>
                <label htmlFor="blind-input" className="avatar">
                    <svg xmlns="http://www.w3.org/2000/svg" width={35} height={35} viewBox="0 0 64 64" id="monkey">
                        <ellipse cx="53.7" cy={33} rx="8.3" ry="8.2" fill="#89664c" />
                        <ellipse cx="53.7" cy={33} rx="5.4" ry="5.4" fill="#ffc5d3" />
                        <ellipse cx="10.2" cy={33} rx="8.2" ry="8.2" fill="#89664c" />
                        <ellipse cx="10.2" cy={33} rx="5.4" ry="5.4" fill="#ffc5d3" />
                        <g fill="#89664c">
                            <path d="m43.4 10.8c1.1-.6 1.9-.9 1.9-.9-3.2-1.1-6-1.8-8.5-2.1 1.3-1 2.1-1.3 2.1-1.3-20.4-2.9-30.1 9-30.1 19.5h46.4c-.7-7.4-4.8-12.4-11.8-15.2" />
                            <path d="m55.3 27.6c0-9.7-10.4-17.6-23.3-17.6s-23.3 7.9-23.3 17.6c0 2.3.6 4.4 1.6 6.4-1 2-1.6 4.2-1.6 6.4 0 9.7 10.4 17.6 23.3 17.6s23.3-7.9 23.3-17.6c0-2.3-.6-4.4-1.6-6.4 1-2 1.6-4.2 1.6-6.4" />
                        </g>
                        <path d="m52 28.2c0-16.9-20-6.1-20-6.1s-20-10.8-20 6.1c0 4.7 2.9 9 7.5 11.7-1.3 1.7-2.1 3.6-2.1 5.7 0 6.1 6.6 11 14.7 11s14.7-4.9 14.7-11c0-2.1-.8-4-2.1-5.7 4.4-2.7 7.3-7 7.3-11.7" fill="#e0ac7e" />
                        <g fill="#3b302a" className="monkey-eye-nose">
                            <path d="m35.1 38.7c0 1.1-.4 2.1-1 2.1-.6 0-1-.9-1-2.1 0-1.1.4-2.1 1-2.1.6.1 1 1 1 2.1" />
                            <path d="m30.9 38.7c0 1.1-.4 2.1-1 2.1-.6 0-1-.9-1-2.1 0-1.1.4-2.1 1-2.1.5.1 1 1 1 2.1" />
                            <ellipse cx="40.7" cy="31.7" rx="3.5" ry="4.5" className="monkey-eye-r" />
                            <ellipse cx="23.3" cy="31.7" rx="3.5" ry="4.5" className="monkey-eye-l" />
                        </g>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width={35} height={35} viewBox="0 0 64 64" id="monkey-hands">
                        <path fill="#89664C" d="M9.4,32.5L2.1,61.9H14c-1.6-7.7,4-21,4-21L9.4,32.5z" />
                        <path fill="#FFD6BB" d="M15.8,24.8c0,0,4.9-4.5,9.5-3.9c2.3,0.3-7.1,7.6-7.1,7.6s9.7-8.2,11.7-5.6c1.8,2.3-8.9,9.8-8.9,9.8
      	s10-8.1,9.6-4.6c-0.3,3.8-7.9,12.8-12.5,13.8C11.5,43.2,6.3,39,9.8,24.4C11.6,17,13.3,25.2,15.8,24.8" />
                        <path fill="#89664C" d="M54.8,32.5l7.3,29.4H50.2c1.6-7.7-4-21-4-21L54.8,32.5z" />
                        <path fill="#FFD6BB" d="M48.4,24.8c0,0-4.9-4.5-9.5-3.9c-2.3,0.3,7.1,7.6,7.1,7.6s-9.7-8.2-11.7-5.6c-1.8,2.3,8.9,9.8,8.9,9.8
      	s-10-8.1-9.7-4.6c0.4,3.8,8,12.8,12.6,13.8c6.6,1.3,11.8-2.9,8.3-17.5C52.6,17,50.9,25.2,48.4,24.8" />
                    </svg>
                </label>
            </div>

            {submissionStatus && (
                <motion.div
                    className={`mt-4 p-3 rounded-lg text-center text-sm ${submissionStatus.success ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {submissionStatus.message}
                </motion.div>
            )}

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                    Don't have an account? <a href="/register" className="font-medium text-[#EC4899] hover:underline">Sign Up</a>
                </p>
            </div>
        </motion.div>
    );
};

export default HemoHiveLoginForm;
