
'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaSync } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Mock data - replace with API call
const initialInventoryData = [
  { bloodGroup: 'A+', quantity: 23 },
  { bloodGroup: 'O+', quantity: 17 },
  { bloodGroup: 'B-', quantity: 4 },
  { bloodGroup: 'AB+', quantity: 12 },
  { bloodGroup: 'O-', quantity: 8 },
  { bloodGroup: 'A-', quantity: 15 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

const HospitalInventoryDashboard = () => {
  const [inventory, setInventory] = useState(initialInventoryData);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hospital/inventory');
      const { data } = await res.json();
      if (data) {
        setInventory(data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const getStatusColor = (quantity) => {
    if (quantity > 20) return 'bg-green-500';
    if (quantity > 10) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Inventory Dashboard</h1>
        <motion.button
          onClick={fetchInventory}
          className="p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 1 }}
        >
          <FaSync size={24} />
        </motion.button>
      </div>

      {/* Inventory Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        {inventory.map((item, index) => (
          <motion.div
            key={item.bloodGroup}
            className="p-6 rounded-lg shadow-lg text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)' }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, boxShadow: '0px 0px 15px rgba(0, 188, 255, 0.5)' }}
          >
            <div className={`absolute top-0 left-0 h-2 w-full ${getStatusColor(item.quantity)}`}></div>
            <p className="text-2xl font-semibold">{item.bloodGroup}</p>
            <p className="text-5xl font-bold">{item.quantity}</p>
            <p className="text-sm text-gray-400">Units</p>
          </motion.div>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-lg shadow-lg" style={{ background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)' }}>
          <h2 className="text-2xl font-bold mb-4">Stock Levels</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inventory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="bloodGroup" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
              <Legend />
              <Bar dataKey="quantity" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="p-6 rounded-lg shadow-lg" style={{ background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)' }}>
          <h2 className="text-2xl font-bold mb-4">Blood Group Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={inventory}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="quantity"
                nameKey="bloodGroup"
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                  return (
                    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                      {`${inventory[index].bloodGroup} (${(percent * 100).toFixed(0)}%)`}
                    </text>
                  );
                }}
              >
                {inventory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default HospitalInventoryDashboard;
