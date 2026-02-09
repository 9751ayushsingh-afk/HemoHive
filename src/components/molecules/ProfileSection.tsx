"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const ProfileSection = () => {
  const creditWalletRef = useRef(null);

  useEffect(() => {
    gsap.to(creditWalletRef.current, {
      boxShadow: '0 0 20px 5px #E53935',
      repeat: -1,
      yoyo: true,
      duration: 1.2,
      ease: 'power1.inOut'
    });
  }, []);

  return (
    <div className="profile-section">
      <div ref={creditWalletRef} className="credit-wallet">
        <span className="credit-label">Blood Credits</span>
        <span className="credit-value">540 Points</span>
      </div>
      <div className="profile-photo-container hover-scale">
        <img src="/path/to/avatar.png" alt="Profile" className="profile-photo" />
      </div>
    </div>
  );
};

export default ProfileSection;
