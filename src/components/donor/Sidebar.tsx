'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, Droplets, History, User, HelpCircle } from 'lucide-react';
import { AnimatedLogo } from '../atoms/AnimatedLogo'; // Import AnimatedLogo
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', icon: Home, path: '/donor' },
  { name: 'Credit Wallet', icon: Wallet, path: '/donor/wallet' },
  { name: 'Request Blood', icon: Droplets, path: '/donor/request' },
  { name: 'History', icon: History, path: '/donor/history' },
  { name: 'Profile', icon: User, path: '/donor/profile' },
];

const Sidebar = () => {
  const pathname = usePathname();
  const isLightMode = pathname?.startsWith('/donor/donate-blood');

  return (
    <aside
      className={`w-64 h-screen backdrop-blur-xl p-6 flex flex-col fixed top-0 left-0 shadow-2xl transition-colors duration-300 z-[1001]
        ${isLightMode
          ? 'bg-[#FAFAF9]/90 text-stone-900 border-r border-stone-200 shadow-stone-200/50'
          : 'bg-black/30 text-white shadow-black/30'
        }`}
    >
      <div className="flex justify-center mb-10">
        <Link href="/donor">
          <AnimatedLogo className="h-12" />
        </Link>
      </div>
      <nav className="flex-grow">
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-4">
              <Link href={item.path} passHref>
                <motion.div
                  className={`flex items-center p-3 rounded-lg transition-colors duration-300 cursor-pointer relative`}
                  whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                >
                  {pathname === item.path && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-red-500/80 rounded-lg"
                      style={{
                        boxShadow: '0 0 15px rgba(239, 68, 68, 0.7)',
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className="w-6 h-6 mr-4 z-10" />
                  <span className="z-10 font-medium">{item.name}</span>
                </motion.div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div>
        <Link href="/donor/help" passHref>
          <motion.div
            className={`flex items-center p-3 rounded-lg transition-colors duration-300 cursor-pointer relative`}
            whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            {pathname === '/donor/help' && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-red-500/80 rounded-lg"
                style={{
                  boxShadow: '0 0 15px rgba(239, 68, 68, 0.7)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <HelpCircle className="w-6 h-6 mr-4 z-10" />
            <span className="z-10 font-medium">Help</span>
          </motion.div>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
