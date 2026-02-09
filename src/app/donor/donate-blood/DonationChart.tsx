import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { DonationHistoryItem } from '../types';

interface DonationChartProps {
  history: DonationHistoryItem[];
}

const DonationChart: React.FC<DonationChartProps> = ({ history }) => {
  const data = useMemo(() => {
    const yearCounts: Record<string, number> = {};
    history.forEach(item => {
      const year = new Date(item.date).getFullYear().toString();
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });

    return Object.keys(yearCounts).sort().map(year => ({
      year,
      donations: yearCounts[year]
    }));
  }, [history]);

  if (data.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
           <h3 className="text-lg font-bold text-slate-900">Donation Trends</h3>
           <p className="text-sm text-slate-500">Your impact over time</p>
        </div>
        <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
           Yearly Activity
        </div>
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="year" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              allowDecimals={false}
              tickCount={5}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="donations" radius={[6, 6, 0, 0]} barSize={40} animationDuration={1000}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#dc2626" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DonationChart;