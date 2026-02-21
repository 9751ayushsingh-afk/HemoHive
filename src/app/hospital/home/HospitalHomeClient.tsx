'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import LiveBloodRequests from '../dashboard/components/LiveBloodRequests';
import RaktSindhuFeed from '../dashboard/components/RaktSindhuFeed';
import PendingReturnsBoard from '../dashboard/components/PendingReturnsBoard';
import SketchColorCard from '@/components/hospital/home/SketchColorCard';

const cardData = [
  {
    title: "Inventory Management",
    icon: "🩸",
    link: "/hospital/inventory",
    sketchImage: "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677256/hemohive_assets/inventory_sketch.png",
    colorImage: "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677261/hemohive_assets/inventory_colour_image.png",
    subtitle: "Live Registry",
    description: "Monitor real-time blood stock levels, manage group-wise availability, and track unit expirations."
  },
  {
    title: "RaktSeva (Donation Requests)",
    icon: "💉",
    link: "/hospital/raktseva",
    sketchImage: "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677400/hemohive_assets/temp_RaktSeva_sketch_image.png",
    colorImage: "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677151/hemohive_assets/RaktSeva_color.png",
    subtitle: "Emergency Hub",
    description: "Coordinate urgent donation requests and connect with active donors in your region."
  },
  {
    title: "Analytics & Reports",
    icon: "📊",
    link: "/hospital/analytics",
    sketchImage: "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677249/hemohive_assets/analtyic_reports_sketch.png",
    colorImage: "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677083/hemohive_assets/ANalytic_reports_colour.png",
    subtitle: "Data Insights",
    description: "Comprehensive visual analytics and performance reports for your hospital's blood bank operations."
  },
  {
    title: "HemoFlux Exchange",
    icon: "🔄",
    link: "/hospital/exchange",
    sketchImage: "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677146/hemohive_assets/HemoFlux_sketch_image.png",
    colorImage: "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677131/hemohive_assets/HemoFlux_color.png",
    subtitle: "Transfer Network",
    description: "Seamlessly exchange blood units with other hospitals in the Rakt Seva network."
  },
  {
    title: "Credit & Penalty System",
    icon: "💳",
    link: "/hospital/credit",
    sketchImage: "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677117/hemohive_assets/Credit_and_penalty_system_sketch.png",
    colorImage: "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677100/hemohive_assets/Credit_and_Penality_system_colour.png",
    subtitle: "Trust Ledger",
    description: "Track your hospital's credit balance and manage trust-based rewards and penalties."
  },
  {
    title: "Transaction Logs",
    icon: "🧾",
    link: "/hospital/logs",
    sketchImage: "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677445/hemohive_assets/temp_Transaction_logs_sketch.png",
    colorImage: "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677201/hemohive_assets/Transaction_logs_colour.png",
    subtitle: "Audit Trail",
    description: "Complete history of all blood transfers, donations, and inventory adjustments."
  },
  {
    title: "AI Demand Forecast",
    icon: "🧠",
    link: "/hospital/forecast",
    sketchImage: "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677066/hemohive_assets/AI_Demand_sketch.png",
    colorImage: "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677040/hemohive_assets/AI_Demand_sketch_colour.png",
    subtitle: "Predictive AI",
    description: "Machine learning models forecasting future blood demand based on historical trends."
  },
  {
    title: "Settings & Profile",
    icon: "⚙️",
    link: "/hospital/settings",
    sketchImage: "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677179/hemohive_assets/Setting_Profile_colour.png",
    colorImage: "https://res.cloudinary.com/drwfe1mhk/image/upload/v1771677190/hemohive_assets/Setting_Profile_sketch.png",
    subtitle: "Account Control",
    description: "Configure your hospital's profile, notification preferences, and security settings."
  },
];

const HospitalHomeClient = ({ user, inventory }: { user: any, inventory: any[] }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="w-full">
      <div className="mb-8 font-sans">
        <h1 className="text-5xl font-extrabold text-white mb-2 tracking-tighter font-syne">Welcome, {user?.fullName}</h1>
        <p className="text-lg text-gray-400 font-medium opacity-80">Logged in as {user?.email}</p>
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
              <h3 className="text-white font-bold mb-4 font-syne tracking-tight">Wastage Efficiency</h3>
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
          <SketchColorCard
            key={card.title}
            title={card.title}
            href={card.link}
            sketchImage={card.sketchImage}
            colorImage={card.colorImage}
            subtitle={card.subtitle}
            description={card.description}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default HospitalHomeClient;
