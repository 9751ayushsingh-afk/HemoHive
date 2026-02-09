'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import LiveBloodRequests from '../dashboard/components/LiveBloodRequests';
import RaktSindhuFeed from '../dashboard/components/RaktSindhuFeed';
import PendingReturnsBoard from '../dashboard/components/PendingReturnsBoard';

const cardData = [
  { title: "Inventory Management", icon: "🩸", link: "/hospital/inventory" },
  { title: "RaktSeva (Donation Requests)", icon: "💉", link: "/hospital/raktseva" },
  { title: "Analytics & Reports", icon: "📊", link: "/hospital/analytics" },
  { title: "HemoFlux Exchange", icon: "🔄", link: "/hospital/exchange" },
  { title: "Credit & Penalty System", icon: "💳", link: "/hospital/credit" },
  { title: "Transaction Logs", icon: "🧾", link: "/hospital/logs" },
  { title: "AI Demand Forecast", icon: "🧠", link: "/hospital/forecast" },
  { title: "Settings & Profile", icon: "⚙️", link: "/hospital/settings" },
];

const HospitalHomeClient = ({ user, inventory }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Welcome, {user?.fullName}</h1>
        <p className="text-lg text-gray-400">{user?.email}</p>
      </div>

      {/* Live Feed and RaktSindhu Section */}
      <div className="mb-10 space-y-8">
        <RaktSindhuFeed />
        {/* HemoFlux Summary Widget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LiveBloodRequests inventory={inventory} />
          <div className="space-y-6">
            <PendingReturnsBoard hospitalId={user?.id || user?._id} />
            {/* Dynamic Import or component for Wastage Meter. Assuming direct import for now */}
            <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-white font-semibold mb-4">Wastage Efficiency</h3>
              {/* Visual placeholder since WastageMeter is a client component we can just use here */}
              {/* Note: We need to import WastageMeter at the top */}
              <div className="text-center text-gray-400 text-sm">
                View detailed metrics in Exchange Tab
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {cardData.map((card) => (
          <Link href={card.link} key={card.title}>
            <motion.div
              className="bg-gray-800/40 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-gray-700/50 cursor-pointer"
              variants={cardVariants}
              whileHover={{ scale: 1.05, boxShadow: '0px 10px 30px rgba(37, 99, 235, 0.5)' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex items-center justify-center text-4xl mb-4">{card.icon}</div>
              <h2 className="text-xl font-semibold text-center text-white">{card.title}</h2>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
};

export default HospitalHomeClient;
