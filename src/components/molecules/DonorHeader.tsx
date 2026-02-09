"use client";

import React from 'react';
import { Fade } from "react-awesome-reveal";

const DonorHeader = () => {
  return (
    <header className="donor-header">
      <h1 className="header-title">
        <Fade duration={1400} cascade damping={0.08} triggerOnce>
          Hey Ayush, you're saving lives today ❤️
        </Fade>
      </h1>
      <p className="header-subtext">Track your blood credits, donations, and impact in real time.</p>
    </header>
  );
};

export default DonorHeader;
