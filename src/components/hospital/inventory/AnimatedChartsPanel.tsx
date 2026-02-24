'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

interface AnimatedChartsPanelProps {
  summary: any;
}

const COLORS = ['#ef4444', '#f87171', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#450a0a', '#000000'];

const AnimatedChartsPanel: React.FC<AnimatedChartsPanelProps> = ({ summary }) => {
  const chartData = summary ? Object.keys(summary)
    .filter(key => key !== 'lowStockGroups')
    .map((key, index) => ({
      name: key,
      value: summary[key],
    })) : [];

  return (
    <div className="space-y-6">
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={8}
              dataKey="value"
              animationBegin={0}
              animationDuration={1500}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
              cursor={{ fill: 'transparent' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {chartData.map((item, i) => (
          <div key={item.name} className="flex flex-col items-center">
            <div
              className="w-2 h-2 rounded-full mb-1 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-[10px] font-black text-gray-500 uppercase">{item.name}</span>
            <span className="text-[12px] font-bold text-white">{item.value}u</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedChartsPanel;