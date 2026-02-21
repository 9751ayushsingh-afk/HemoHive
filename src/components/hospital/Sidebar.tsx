"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import {
    Home,
    Droplet,
    BarChart2,
    CreditCard,
    FileText,
    Settings,
    LogOut,
    User,
} from "lucide-react";

const navItems = [
    { name: "Home", route: "/hospital/home", icon: Home },
    { name: "Inventory", route: "/hospital/inventory", icon: Droplet },
    { name: "Analytics", route: "/hospital/analytics", icon: BarChart2 },
    { name: "Credit", route: "/hospital/credit", icon: CreditCard },
    { name: "Logs", route: "/hospital/logs", icon: FileText },
    { name: "Settings", route: "/hospital/settings", icon: Settings },
];

const MagneticIcon = ({ children }: { children: React.ReactNode }) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const xSpring = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
    const ySpring = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        x.set((e.clientX - centerX) * 0.3); // Magnetic strength
        y.set((e.clientY - centerY) * 0.3);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: xSpring, y: ySpring }}
        >
            {children}
        </motion.div>
    );
};

const Sidebar = () => {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isHovered, setIsHovered] = useState(false);

    const user = session?.user;

    return (
        <motion.aside
            className={`fixed left-0 top-0 h-full z-50 flex flex-col justify-between border-r border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${isHovered ? "w-72" : "w-24"
                }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            {/* ------------------ LOGO SECTION ------------------ */}
            <div className="flex items-center justify-center h-28 border-b border-white/5 relative overflow-hidden group">
                <MagneticIcon>
                    <motion.div
                        animate={{ rotate: isHovered ? 360 : 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="relative z-10 bg-gradient-to-br from-red-600 to-red-900 text-white rounded-2xl p-3 shadow-lg shadow-red-900/50 cursor-pointer"
                    >
                        <span className="text-2xl font-bold font-syne">H</span>
                    </motion.div>
                </MagneticIcon>

                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, x: -20, filter: "blur(5px)" }}
                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, x: -20, filter: "blur(5px)" }}
                            transition={{ delay: 0.1, duration: 0.4 }}
                            className="ml-4 flex flex-col"
                        >
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 font-syne tracking-wide">
                                HemoHive
                            </span>
                            <span className="text-xs text-red-400/80 font-mono tracking-widest uppercase">
                                Hospital
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Subtle background glow effect */}
                <div className="absolute inset-0 bg-red-600/5 blur-3xl rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>

            {/* ------------------ NAVIGATION LINKS ------------------ */}
            <nav className="flex-1 px-4 py-8 space-y-3 overflow-y-auto overflow-x-hidden no-scrollbar">
                {navItems.map((item) => {
                    const isActive = pathname === item.route;
                    const Icon = item.icon;

                    return (
                        <Link key={item.route} href={item.route} passHref>
                            <div className="relative group flex items-center px-4 py-4 rounded-xl cursor-pointer overflow-hidden transition-colors duration-300">

                                {/* Liquid Active Background */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeBackground"
                                        className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-900/20 border border-red-500/30 rounded-xl"
                                        initial={false}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 30,
                                        }}
                                    />
                                )}

                                {/* Hover Splash Effect (Non-Active) */}
                                {!isActive && (
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300" />
                                )}

                                {/* Icon Wrapper with Magnetic Effect */}
                                <div className="relative z-10 flex-shrink-0 w-8 h-8 flex items-center justify-center">
                                    <MagneticIcon>
                                        <div className={`transition-colors duration-300 ${isActive ? "text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" : "text-gray-400 group-hover:text-gray-100"}`}>
                                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                        </div>
                                    </MagneticIcon>
                                </div>

                                {/* Label */}
                                <AnimatePresence>
                                    {isHovered && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className={`ml-4 text-base font-medium tracking-wide whitespace-nowrap z-10 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-200"
                                                }`}
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}
                                </AnimatePresence>

                                {/* Active Indicator Dot */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeDot"
                                        className="absolute right-3 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* ------------------ USER PROFILE SECTION ------------------ */}
            <div className="p-4 border-t border-white/5">
                <div className={`group flex items-center p-3 rounded-2xl cursor-pointer transition-all duration-300 ${isHovered ? "bg-white/5 hover:bg-white/10 border border-white/5" : "justify-center"
                    }`}>

                    <MagneticIcon>
                        <div className="relative w-12 h-12 flex-shrink-0">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 animate-spin-slow opacity-70 blur-[2px]" />
                            <div className="absolute inset-[2px] rounded-full bg-black flex items-center justify-center overflow-hidden border border-white/10 z-10">
                                {user?.image ? (
                                    <Image
                                        src={user.image}
                                        alt={user.name || "User"}
                                        width={48}
                                        height={48}
                                        className="object-cover"
                                    />
                                ) : (
                                    <User size={20} className="text-gray-200" />
                                )}
                            </div>
                            {/* Online Status Dot */}
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-black rounded-full z-20 shadow-[0_0_8px_#22c55e]" />
                        </div>
                    </MagneticIcon>

                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="ml-4 overflow-hidden flex-1"
                            >
                                <p className="text-sm font-semibold text-white truncate font-syne capitalize">
                                    {user?.name || "Hospital Admin"}
                                </p>
                                <p className="text-xs text-gray-400 truncate font-mono">
                                    {user?.email || "admin@hemohive.com"}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="ml-2"
                        >
                            <MagneticIcon>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/login' })}
                                    className="p-2 hover:bg-red-500/20 rounded-full transition-colors group/logout border-none bg-transparent cursor-pointer"
                                    title="Sign Out"
                                >
                                    <LogOut size={18} className="text-gray-500 group-hover/logout:text-red-400 transition-colors" />
                                </button>
                            </MagneticIcon>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
