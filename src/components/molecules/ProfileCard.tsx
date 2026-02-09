"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const ProfileCard = () => {
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.from(cardRef.current, { opacity: 0, y: 50, duration: 1, ease: 'power3.out' });

    gsap.to(cardRef.current, {
      boxShadow: '0 0 20px 5px #E63946',
      repeat: -1,
      yoyo: true,
      duration: 3,
      ease: 'power1.inOut'
    });
  }, []);

  return (
    <div ref={cardRef} className="profile-card hover-rotate">
      <h3>Ayush</h3>
      <p>Registered Blood Donor</p>
      <p>Credits: 2</p>
      <p>Credit Health Score: 88</p>
      <p>Status: Good</p>
    </div>
  );
};

export default ProfileCard;
