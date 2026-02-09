
import React from 'react';

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full">
    <h1 className="text-3xl font-bold text-gray-400">{title}</h1>
  </div>
);

const AnalyticsPage = () => <PlaceholderPage title="Analytics & Reports" />;

export default AnalyticsPage;
