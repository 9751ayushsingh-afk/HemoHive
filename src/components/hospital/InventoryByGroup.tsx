
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ChartBarIcon } from '@heroicons/react/24/outline';

const RadialChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500">No data available</div>;
  }

  const totalUnits = data.reduce((sum, item) => sum + item.quantity, 0);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
      <circle
        cx="100"
        cy="100"
        r={radius}
        stroke="#E5E7EB"
        strokeWidth="20"
        fill="transparent"
      />
      {data.map((item, index) => {
        const percentage = (item.quantity / totalUnits) * 100;
        const strokeDasharray = (percentage / 100) * circumference;
        const segment = (
          <motion.circle
            key={item.bloodGroup}
            cx="100"
            cy="100"
            r={radius}
            stroke={`hsl(${index * 60}, 70%, 50%)`}
            strokeWidth="20"
            fill="transparent"
            strokeDasharray={`${strokeDasharray} ${circumference}`}
            strokeDashoffset={-offset}
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${strokeDasharray} ${circumference}` }}
            transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
          />
        );
        offset += strokeDasharray;
        return segment;
      })}
      <text
        x="100"
        y="100"
        textAnchor="middle"
        dy=".3em"
        className="transform rotate-90 text-3xl font-bold fill-current text-gray-800 dark:text-white"
      >
        {totalUnits}
      </text>
       <text
        x="100"
        y="125"
        textAnchor="middle"
        className="transform rotate-90 text-sm font-medium fill-current text-gray-500 dark:text-gray-400"
      >
        Total Units
      </text>
    </svg>
  );
};


const InventoryByGroup = ({ inventoryData = [] }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center mb-4">
        <ChartBarIcon className="h-6 w-6 text-blue-500 mr-3" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Inventory by Group</h3>
      </div>
      <div className="flex-grow flex items-center justify-center">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 items-center">
          <div className="flex justify-center">
            <RadialChart data={inventoryData} />
          </div>
          <div className="space-y-2">
            {inventoryData.map((item, index) => (
              <div key={item.bloodGroup} className="flex items-center">
                <motion.div
                  className="h-3 w-3 rounded-full mr-3"
                  style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {item.bloodGroup}: {item.quantity} units
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryByGroup;
