"use client";

import React from "react";
import { motion } from "framer-motion";

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-hemohive-red/5 via-white to-hemohive-red/10 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-hemohive-red mb-4">Test Page</h1>
        <p className="text-gray-600">This is a test page to verify syntax is working.</p>
      </motion.div>
    </div>
  );
};

export default TestPage;


