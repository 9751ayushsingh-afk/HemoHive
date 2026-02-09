"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PenaltyAlert = () => {
  const alertRef = useRef(null);

  useEffect(() => {
    gsap.from(alertRef.current, {
      scrollTrigger: {
        trigger: alertRef.current,
        start: 'top 80%',
      },
      opacity: 0,
      y: 50,
      duration: 1,
      ease: 'power3.out'
    });

    gsap.to(alertRef.current, {
      boxShadow: '0 0 20px 5px #EF233C',
      repeat: -1,
      yoyo: true,
      duration: 1.5,
      ease: 'power1.inOut'
    });
  }, []);

  return (
    <div ref={alertRef} className="penalty-alert">
      <p>You’ve reached 2 overdue credits. Settle penalties to avoid account suspension.</p>
      <button className="cta-button error">Resolve Now</button>
    </div>
  );
};

export default PenaltyAlert;
