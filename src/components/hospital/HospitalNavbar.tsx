"use client";

import React from "react";
import { Search, Bell, Menu, User } from "lucide-react";
import { motion } from "framer-motion";

const HospitalNavbar = () => {
    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
        >
            <div className="flex items-center gap-4">
                {/* Search Bar - Aesthetic version */}
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-400 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        className="bg-black/20 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500/50 focus:bg-black/40 transition-all w-64"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Notifications */}
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="relative p-2 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all"
                >
                    <Bell size={20} className="text-gray-300" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]" />
                </motion.div>

                {/* Global Stats/Status (Premium feel) */}
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs text-gray-400 font-mono uppercase tracking-tighter">System Status</span>
                    <span className="text-sm font-semibold text-green-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Operational
                    </span>
                </div>
            </div>
        </motion.header>
    );
};

export default HospitalNavbar;
