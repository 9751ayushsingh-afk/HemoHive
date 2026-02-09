'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface BloodGroupCardProps {
  bloodGroup: string;
  units: number;
  status: string;
  expiringSoon: number;
  onClick: () => void;
}

const BloodGroupCard: React.FC<BloodGroupCardProps> = ({ bloodGroup, units, status, expiringSoon, onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 text-center flex flex-col justify-between aspect-square cursor-pointer"
      whileHover={{ scale: 1.05, boxShadow: '0px 0px 15px rgba(255,0,0,0.5)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-left text-2xl font-bold text-red-500">{bloodGroup}</div>
      <div className="flex-grow flex items-center justify-center">
        <p className="text-6xl font-bold">{units}</p>
      </div>
      <div className="text-xs text-gray-400">
        {expiringSoon > 0 ? `${expiringSoon} units expiring soon` : ' '}
      </div>
    </motion.div>
  );
};

export default BloodGroupCard;