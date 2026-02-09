"use client";
import Link from "next/link";
import { motion } from "framer-motion";

interface DashboardCardProps {
  title: string;
  icon: string;
  link: string;
}

const DashboardCard = ({ title, icon, link }: DashboardCardProps) => {
  return (
    <Link href={link} passHref>
      <motion.div
        className="glassmorphic-card bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6 shadow-xl cursor-pointer"
        whileHover={{ scale: 1.05 }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </motion.div>
    </Link>
  );
};

export default DashboardCard;
