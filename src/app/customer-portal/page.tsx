"use client";

import { useState } from "react";
import CreditWallet from "../../components/molecules/CreditWallet";

const mockTransactions = [
  {
    id: "tx1",
    date: "2024-12-15",
    type: "credit" as const,
    amount: 5,
    description: "Initial credit allocation"
  },
  {
    id: "tx2",
    date: "2024-12-16",
    type: "debit" as const,
    amount: 2,
    description: "Blood request #1234"
  },
  {
    id: "tx3",
    date: "2024-12-18",
    type: "credit" as const,
    amount: 3,
    description: "Blood donation"
  }
];

export default function CustomerPortalPage() {
  const [balance] = useState(6);
  const [maxCredits] = useState(10);
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Customer Portal</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <CreditWallet 
            balance={balance}
            maxCredits={maxCredits}
            transactions={mockTransactions}
            className="w-full"
          />
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <button className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
                Request Blood
              </button>
              <button className="w-full px-4 py-3 bg-white border border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors">
                Donate Blood
              </button>
              <button className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                View History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}