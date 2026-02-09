"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const CreditBalanceCard = () => {
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.from(cardRef.current, { opacity: 0, scale: 0.8, duration: 1, ease: 'power3.out' });

    gsap.to(cardRef.current, {
      scale: 1.05,
      repeat: -1,
      yoyo: true,
      duration: 2,
      ease: 'power1.inOut'
    });
  }, []);

  return (
    <div ref={cardRef} className="credit-balance-card tilt-effect">
      <h4>Total Credits</h4>
      <p>2</p>
      <p>Active Credit Units</p>
    </div>
  );
};

export default CreditBalanceCard;
