
import React from 'react';

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full">
    <h1 className="text-3xl font-bold text-gray-400">{title}</h1>
  </div>
);

const ForecastPage = () => <PlaceholderPage title="AI Demand Forecast" />;

export default ForecastPage;
