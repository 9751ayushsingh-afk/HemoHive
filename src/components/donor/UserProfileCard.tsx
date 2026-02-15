'use client';

import React, { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { User as UserIcon, Mail, Phone, MapPin, Award, ShieldCheck, Zap } from 'lucide-react';
import { type DefaultSession } from 'next-auth';

interface UserProfileCardProps {
    fullName?: string;
    profilePicture?: string;
    email?: string;
    mobile?: string;
    address?: string;
    joinedAt?: string;
    bloodGroup?: string;
    totalDonations?: number;
    credits?: number;
    status?: string;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
    fullName,
    profilePicture,
    email,
    mobile,
    address,
    joinedAt,
    bloodGroup,
    totalDonations,
    credits,
    status
}) => {
    const { data: session } = useSession();
    const cardRef = useRef<HTMLDivElement>(null);
    const shimmerRef = useRef<HTMLDivElement>(null);
    const flareRef = useRef<HTMLDivElement>(null);

    const user = {
        id: session?.user?.id || '000000',
        fullName: fullName || session?.user?.name || 'HEMO_RESIDENT_01',
        profilePicture: profilePicture || session?.user?.image,
        email: email || session?.user?.email || 'unassigned@hemohive.io',
        mobile: mobile || '+XX XXXX XXXXX',
        address: address || 'Sector 7G, Neo City',
        joinedAt: joinedAt,
        bloodGroup: bloodGroup || 'AB+',
        totalDonations: totalDonations || 0,
        credits: credits || 0,
        status: 'ELITE_DONOR'
    };

    // 4. Dynamic Identity Generation
    const residentId = `#HMH-${new Date().getFullYear()}-${user.id.slice(-6).toUpperCase()}`;

    const generateAccessKey = () => {
        const seed = `${user.email}-${user.id}`;
        // Simple but aesthetic hex generator based on identity
        const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const segments = [
            (hash % 99).toString().padStart(2, '0'),
            (hash % 88).toString(16).toUpperCase().padStart(2, '0'),
            ((hash * 2) % 77).toString(16).toUpperCase().padStart(2, '0'),
            ((hash * 3) % 66).toString().padStart(2, '0')
        ];
        return `HH-${segments.join('-')}-SYS`;
    };
    const accessKey = generateAccessKey();

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const handleMouseMove = (e: MouseEvent) => {
            const { left, top, width, height } = card.getBoundingClientRect();
            const x = e.clientX - left;
            const y = e.clientY - top;
            const px = (x / width) * 100;
            const py = (y / height) * 100;

            const rotateX = gsap.utils.mapRange(0, height, -20, 20)(y);
            const rotateY = gsap.utils.mapRange(0, width, 20, -20)(x);

            gsap.to(card, {
                duration: 0.8,
                rotationX: rotateX,
                rotationY: rotateY,
                ease: 'power3.out',
                transformPerspective: 2000,
            });

            // Holographic Shimmer and Flare logic
            if (shimmerRef.current && flareRef.current) {
                gsap.to(shimmerRef.current, {
                    duration: 0.5,
                    backgroundPosition: `${px}% ${py}%`,
                    opacity: 0.6,
                });
                gsap.to(flareRef.current, {
                    duration: 0.7,
                    x: x - 150,
                    y: y - 150,
                    opacity: 0.4,
                });
            }
        };

        const handleMouseLeave = () => {
            gsap.to(card, {
                duration: 2,
                rotationX: 0,
                rotationY: 0,
                ease: 'elastic.out(1, 0.4)',
            });
            if (shimmerRef.current) gsap.to(shimmerRef.current, { duration: 1, opacity: 0 });
            if (flareRef.current) gsap.to(flareRef.current, { duration: 1, opacity: 0 });
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, rotateY: -30 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="perspective-3000 h-full w-full group"
        >
            <div
                ref={cardRef}
                className="relative h-full w-full overflow-hidden rounded-[40px] bg-slate-950 p-[1.5px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)]"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* 1. Micro-Crystal Border (Multi-Stop Gradient) */}
                <div className="absolute inset-0 z-0 rounded-[40px] bg-gradient-to-br from-cyan-400 via-purple-500 via-rose-500 to-lime-400 opacity-20" />

                <div className="relative h-full w-full overflow-hidden rounded-[39px] bg-[#020617]/95 p-8 backdrop-blur-3xl">

                    {/* 2. Aurora Flow Background */}
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                        <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[150%] animate-aurora-1 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/40 via-transparent to-transparent blur-[120px]" />
                        <div className="absolute bottom-[-50%] right-[-20%] w-[150%] h-[150%] animate-aurora-2 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/40 via-transparent to-transparent blur-[120px]" />
                        <div className="absolute top-[20%] right-[-10%] w-[120%] h-[120%] animate-aurora-3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/30 via-transparent to-transparent blur-[140px]" />
                    </div>

                    {/* 3. Holographic Iridescent Overlay */}
                    <div
                        ref={shimmerRef}
                        className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(110deg,#00ffff44,transparent_20%,#ff00ff44_40%,transparent_60%,#ffff0044_80%,transparent)] bg-[length:300%_300%] opacity-0 mix-blend-color-dodge transition-opacity duration-500"
                    />
                    <div
                        ref={flareRef}
                        className="pointer-events-none absolute z-20 h-[300px] w-[300px] rounded-full bg-white/10 blur-[100px] opacity-0 mix-blend-overlay transition-opacity duration-500"
                    />

                    {/* Content (The Bento Grid) */}
                    <div className="relative z-30 flex flex-col h-full">

                        {/* Header: Digital ID Mark */}
                        <div className="mb-10 flex items-center justify-between" style={{ transform: 'translateZ(60px)' }}>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-[1px]">
                                    <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-slate-950">
                                        <Zap className="h-5 w-5 text-cyan-400 fill-cyan-400/20" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black tracking-[.3em] text-cyan-500 uppercase leading-none mb-1">Donor Identity</p>
                                    <p className="text-xs font-mono text-slate-300">{user.status}</p>
                                </div>
                            </div>
                            {/* Holographic Seal Animation */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="h-12 w-12 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center"
                            >
                                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-300 to-rose-400 opacity-40 blur-[2px]" />
                            </motion.div>
                        </div>

                        {/* Top Bento Row: Identity */}
                        <div className="mb-8 flex gap-6 items-end" style={{ transform: 'translateZ(100px)' }}>
                            <div className="relative group/avatar">
                                <div className="absolute -inset-2 rounded-[32px] bg-gradient-to-tr from-cyan-500/50 to-purple-500/50 blur-lg opacity-0 transition-opacity duration-500 group-hover/avatar:opacity-100" />
                                <div className="relative h-32 w-32 shrink-0 rounded-[30px] border-2 border-white/10 bg-slate-900 p-1">
                                    <div className="h-full w-full overflow-hidden rounded-[26px] ring-1 ring-white/20">
                                        {user.profilePicture ? (
                                            <Image
                                                src={user.profilePicture}
                                                alt={user.fullName}
                                                layout="fill"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-slate-800">
                                                <UserIcon className="h-14 w-14 text-slate-600" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Floating Blood Group (Monospace Shield) */}
                                <div className="absolute -bottom-3 -right-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0f172a] border-2 border-cyan-500/30 text-2xl font-black text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                                    {user.bloodGroup}
                                </div>
                            </div>

                            <div className="flex-1 pb-2">
                                <h2 className="text-4xl font-extrabold tracking-tighter text-white mb-2 leading-tight">
                                    {user.fullName.toUpperCase()}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                    <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">Resident ID: {residentId}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Bento Grid (Futuristic Mono) */}
                        <div className="grid grid-cols-2 gap-4 mb-8" style={{ transform: 'translateZ(50px)' }}>
                            <div className="group/stat relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:bg-white/[0.05]">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Donations</p>
                                <div className="flex items-baseline gap-3">
                                    <span className="font-mono text-4xl font-black text-white">{user.totalDonations.toString().padStart(2, '0')}</span>
                                    <span className="text-[9px] text-cyan-500 font-bold uppercase tracking-tight opacity-0 transition-opacity group-hover/stat:opacity-100">Live Data</span>
                                </div>
                                <Award className="absolute -right-4 -bottom-4 h-20 w-20 text-white/5 transition-colors group-hover/stat:text-emerald-500/10" />
                            </div>

                            <div className="group/stat relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:bg-white/[0.05]">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Credits</p>
                                <div className="flex items-baseline gap-3">
                                    <span className="font-mono text-4xl font-black text-white">{user.credits.toString().padStart(2, '0')}</span>
                                    <Zap className="h-4 w-4 text-purple-400 animate-bounce" />
                                </div>
                                <div className="absolute bottom-2 left-5 h-1 w-24 rounded-full bg-slate-900 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "65%" }}
                                        className="h-full bg-gradient-to-r from-cyan-400 to-purple-600 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bento Cells: Contact Info */}
                        <div className="space-y-3" style={{ transform: 'translateZ(40px)' }}>
                            {[
                                { icon: Mail, value: user.email, label: 'Secure Channel' },
                                { icon: Phone, value: user.mobile, label: 'Voice Link' },
                                { icon: MapPin, value: user.address, label: 'Geo Location' }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 + (i * 0.1) }}
                                    className="group/item flex items-center justify-between rounded-2xl border border-white/5 bg-[#0a0f1e]/40 p-4 transition-all hover:border-cyan-500/20 hover:bg-white/5"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-white/5 group-hover/item:text-cyan-400 transition-colors">
                                            <item.icon className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-tighter leading-none mb-1">{item.label}</p>
                                            <p className="font-mono text-xs text-slate-200 truncate">{item.value}</p>
                                        </div>
                                    </div>
                                    <span className="h-1.5 w-4 rounded-full bg-slate-800 transition-colors group-hover/item:bg-cyan-500/50" />
                                </motion.div>
                            ))}
                        </div>

                        {/* Footer: Digital Signature & Access Key */}
                        <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6 opacity-60" style={{ transform: 'translateZ(30px)' }}>
                            <div className="flex flex-col gap-1">
                                <p className="font-mono text-[8px] text-slate-500 uppercase tracking-[0.3em]">HemoHive Access Key</p>
                                <p className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest font-black italic">{accessKey}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-serif italic text-white/30 text-lg leading-none -mb-1">{user.fullName.split(' ')[0]}</p>
                                <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Digital Sign</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes aurora-1 {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    50% { transform: translate(10%, 10%) rotate(5deg); }
                    100% { transform: translate(0, 0) rotate(0deg); }
                }
                @keyframes aurora-2 {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    50% { transform: translate(-15%, 5%) rotate(-8deg); }
                    100% { transform: translate(0, 0) rotate(0deg); }
                }
                @keyframes aurora-3 {
                    0% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(5%, -10%) scale(1.1); }
                    100% { transform: translate(0, 0) scale(1); }
                }
                .animate-aurora-1 { animation: aurora-1 15s ease-in-out infinite; }
                .animate-aurora-2 { animation: aurora-2 20s ease-in-out infinite; }
                .animate-aurora-3 { animation: aurora-3 18s ease-in-out infinite; }
                .perspective-3000 { perspective: 3000px; }
            `}</style>
        </motion.div>
    );
};

export default UserProfileCard;
