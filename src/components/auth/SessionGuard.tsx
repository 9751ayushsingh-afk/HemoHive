'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, LogOut, RefreshCw, Smartphone } from 'lucide-react';

export default function SessionGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (status === 'authenticated') {
            console.log('[SESSION-GUARD] Sync Status:', {
                email: session?.user?.email,
                error: (session as any)?.error
            });
        }

        if (status === 'authenticated' && (session as any)?.error === 'SESSION_OVERRIDDEN') {
            setShowModal(true);
        }
    }, [session, status]);

    const handleLogout = () => {
        signOut({ callbackUrl: '/login' });
    };

    const handleRelogin = () => {
        // Clear session and direct to login for fresh 'Winner' status
        signOut({ callbackUrl: '/login' });
    };

    return (
        <>
            {children}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-6 overflow-hidden">
                        {/* Ultra-Premium Glass Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-[32px]"
                        />

                        {/* Animated background glows */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.1, 0.2, 0.1],
                                    x: [0, 50, 0],
                                    y: [0, -30, 0]
                                }}
                                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-red-600/20 blur-[120px]"
                            />
                            <motion.div
                                animate={{
                                    scale: [1.2, 1, 1.2],
                                    opacity: [0.1, 0.15, 0.1],
                                    x: [0, -40, 0],
                                    y: [0, 60, 0]
                                }}
                                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[100px]"
                            />
                        </div>

                        {/* Security Card */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 40, rotateX: 15 }}
                            animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            transition={{ type: "spring", damping: 20, stiffness: 100 }}
                            className="relative w-full max-w-lg perspective-1000"
                        >
                            <div className="relative overflow-hidden rounded-[40px] border border-white/20 bg-gradient-to-b from-white/10 to-white/5 p-12 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-md">

                                {/* Inner glow border */}
                                <div className="absolute inset-0 rounded-[40px] border-[0.5px] border-white/10 pointer-events-none" />

                                <div className="relative z-20">
                                    {/* Icon Container with Pulse */}
                                    <div className="mb-10 flex justify-center">
                                        <div className="relative">
                                            <motion.div
                                                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                                className="absolute inset-0 rounded-full bg-red-500/20 blur-xl"
                                            />
                                            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30">
                                                <ShieldAlert className="h-12 w-12" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Text Content */}
                                    <div className="text-center">
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <h2 className="mb-4 text-4xl font-black tracking-tight text-white">
                                                Security <span className="text-red-500">Lockout</span>
                                            </h2>
                                            <div className="mx-auto mb-8 h-1 w-20 rounded-full bg-gradient-to-r from-red-500 to-transparent" />
                                        </motion.div>

                                        <motion.p
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="mb-12 text-lg font-medium leading-relaxed text-slate-300"
                                        >
                                            Your account was accessed on a <span className="text-white font-bold italic">new device</span>.
                                            For your safety, this session has been securely paused.
                                        </motion.p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleRelogin}
                                            className="flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-5 text-sm font-black uppercase tracking-wider text-slate-950 transition-all hover:bg-slate-100 shadow-[0_10px_20px_rgba(255,255,255,0.1)]"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                            Relogin
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -2, backgroundColor: "rgba(255,255,255,0.1)" }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleLogout}
                                            className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-8 py-5 text-sm font-black uppercase tracking-wider text-white transition-all"
                                        >
                                            <LogOut className="h-4 w-4 text-red-400" />
                                            Logout
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Modern Background Decor */}
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <div className="text-[120px] font-black leading-none text-white select-none pointer-events-none">🛡️</div>
                                </div>
                            </div>

                            {/* Floating Branding Tag */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="mt-8 flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500"
                            >
                                <div className="h-px w-8 bg-slate-800" />
                                HemoHive Secure Access Protocol
                                <div className="h-px w-8 bg-slate-800" />
                            </motion.div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
