"use client";

import React from 'react';
import { Zoom } from "react-awesome-reveal";

const BloodCreditWallet = () => {
  const stats = [
    { label: 'Credits', value: '540' },
    { label: 'Blood Donated', value: '4 times' },
    { label: 'Lives Impacted', value: '12+' }
  ];

  return (
    <Zoom duration={1000} triggerOnce>
      <div className="blood-credit-wallet card">
        <div className="card-header">
          <h2 className="card-title">Blood Credit Wallet</h2>
        </div>
        <div className="card-content">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
          <button className="cta-button">Request Blood</button>
        </div>
      </div>
    </Zoom>
  );
};

export default BloodCreditWallet;
