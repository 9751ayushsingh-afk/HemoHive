"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const ResponsibilityMeter = () => {
  const meterRef = useRef<HTMLDivElement>(null);
  const daysLeftRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const meter = meterRef.current;
    if (meter) {
      gsap.to(meter, {
        boxShadow: '0 0 20px 5px #1D3557',
        repeat: -1,
        yoyo: true,
        duration: 1,
        ease: 'power1.inOut'
      });
    }

    const daysLeft = { value: 8 };
    gsap.to(daysLeft, {
      value: 0,
      duration: 8 * 24 * 60 * 60, // 8 days in seconds
      onUpdate: () => {
        if (daysLeftRef.current) {
          daysLeftRef.current.textContent = `${Math.ceil(daysLeft.value)} Days Left`;
        }
      },
      ease: 'linear'
    });
  }, []);

  return (
    <div ref={meterRef} className="responsibility-meter">
      <h4>Return Deadline</h4>
      <p ref={daysLeftRef}>8 Days Left</p>
      <p>Donate before the deadline to release your credit and refund.</p>
    </div>
  );
};

export default ResponsibilityMeter;
