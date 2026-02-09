"use client";

import React from 'react';

const BloodDetails = () => {
  const bloodGroups = [
    { group: 'A+', tooltip: 'Most common. You’re a universal helper!', animation: 'heartbeat' },
    { group: 'A−', tooltip: 'You’re rare and reliable!', animation: 'pulse' },
    { group: 'B+', tooltip: 'Strong and steady donor type.', animation: 'spark' },
    { group: 'O+', tooltip: 'You can help 80% of the population.', animation: 'heartbeat' },
    { group: 'O−', tooltip: 'Rare and precious — you’re a universal donor.', animation: 'shine' },
    { group: 'AB+', tooltip: 'Universal recipient!', animation: 'flow' }
  ];

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    e.currentTarget.appendChild(ripple);
    ripple.onanimationend = () => {
      ripple.remove();
    };
  };

  return (
    <div className="blood-details card">
      <div className="card-header">
        <h2 className="card-title">Blood Details</h2>
      </div>
      <div className="card-content">
        <div className="blood-group-grid">
          {bloodGroups.map((blood, index) => (
            <div 
              key={index} 
              className={`blood-group-item ${blood.animation}`}
              title={blood.tooltip}
              onClick={handleClick}
            >
              <span className="blood-group-text">{blood.group}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BloodDetails;
