'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface AnimatedChartsPanelProps {
    summary: any;
}

const AnimatedChartsPanel: React.FC<AnimatedChartsPanelProps> = ({ summary }) => {
    const chartData = {
        labels: summary ? Object.keys(summary).filter(key => key !== 'lowStockGroups') : [],
        datasets: [
            {
                label: '# of Units',
                data: summary ? Object.keys(summary).filter(key => key !== 'lowStockGroups').map(key => summary[key]) : [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

  return (
    <motion.div
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <h2 className="text-2xl font-bold mb-4">Analytics</h2>
      <div className="h-64 flex items-center justify-center">
        {summary ? <Pie data={chartData} /> : <p className="text-gray-500">No data for chart</p>}
      </div>
    </motion.div>
  );
};

export default AnimatedChartsPanel;