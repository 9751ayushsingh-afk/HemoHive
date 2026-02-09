"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import ProgressRing from "../atoms/ProgressRing";
import AnimatedCounter from "../atoms/AnimatedCounter";
import BloodDropIcon from "../atoms/icons/BloodDropIcon";

interface Transaction {
  id: string;
  date: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
}

interface CreditWalletProps {
  balance: number;
  maxCredits: number;
  transactions: Transaction[];
  className?: string;
}

const CreditWallet = ({
  balance,
  maxCredits,
  transactions,
  className = "",
}: CreditWalletProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Calculate progress percentage
  const progressPercentage = Math.min(100, (balance / maxCredits) * 100);
  
  return (
    <motion.div 
      className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Credit Balance Section */}
      <div className="p-6 bg-gradient-to-r from-red-50 to-red-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Credit Balance</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <ProgressRing 
              progress={progressPercentage} 
              size={120}
              color="#E53E3E"
              backgroundColor="#F0F0F0"
            >
              <div className="flex flex-col items-center justify-center">
                <BloodDropIcon className="w-6 h-6 text-red-600 mb-1" />
                <div className="text-2xl font-bold text-gray-800">
                  <AnimatedCounter value={balance} />
                </div>
                <div className="text-xs text-gray-500">of {maxCredits}</div>
              </div>
            </ProgressRing>
          </div>
          
          <div className="flex-1 pl-4">
            <div className="mb-4">
              <p className="text-sm text-gray-500">Available Credits</p>
              <p className="text-xl font-bold text-gray-800">{balance}</p>
            </div>
            
            <motion.button
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Hide History" : "View History"}
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Transaction History Section */}
      <motion.div 
        className="bg-white"
        initial={{ height: 0 }}
        animate={{ height: isExpanded ? "auto" : 0 }}
        transition={{ duration: 0.3 }}
        style={{ overflow: "hidden" }}
      >
        <div className="p-6">
          <h4 className="text-md font-semibold text-gray-800 mb-4">Transaction History</h4>
          
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {transactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between p-3 border-b border-gray-100"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{transaction.description}</p>
                  <p className="text-xs text-gray-500">{transaction.date}</p>
                </div>
                <div className={`text-sm font-semibold ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                  {transaction.type === "credit" ? "+" : "-"}{transaction.amount}
                </div>
              </div>
            ))}
            
            {transactions.length === 0 && (
              <p className="text-center text-gray-500 py-4">No transactions yet</p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreditWallet;