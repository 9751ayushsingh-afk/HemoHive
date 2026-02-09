"use client";

import React, { ReactNode } from 'react';
import { Fade, Zoom } from "react-awesome-reveal";

const HealthInsights = () => {
  const insights = [
    { title: 'Hemoglobin Level', value: '13.8 g/dL', animation: 'wave' },
    { title: 'Next Eligible Donation', value: '15 Days Left', animation: 'fade' },
    { title: 'BMI Tracker', value: '21.4 Normal', animation: 'zoom' },
  ];

  const getAnimation = (animation: string, children: ReactNode) => {
    switch (animation) {
      case 'fade':
        return <Fade triggerOnce>{children}</Fade>;
      case 'zoom':
        return <Zoom triggerOnce>{children}</Zoom>;
      default:
        return children;
    }
  }

  return (
    <div className="health-insights card">
      <div className="card-header">
        <h2 className="card-title">Health Insights</h2>
      </div>
      <div className="card-content">
        <div className="insights-grid">
          {insights.map((insight, index) => (
            <div key={index} className={`insight-card ${insight.animation}`}>
              {getAnimation(insight.animation,
                <>
                  <h3 className="insight-title">{insight.title}</h3>
                  <p className="insight-value">{insight.value}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthInsights;
