'use client';
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './CreditHealthMeter.css';

const CreditHealthMeter = ({ value }) => {
  const liquidRef = useRef(null);
  const textRef = useRef(null);
  const bubblesRef = useRef([]);
  const circleRef = useRef(null);

  const getColors = (value) => {
    if (value > 60) {
      return { main: '#28a745', gradient: '#218838' }; // Green
    } else if (value < 35) {
      return { main: '#dc3545', gradient: '#c82333' }; // Red
    } else {
      return { main: '#ffc107', gradient: '#e0a800' }; // Orange
    }
  };

  useEffect(() => {
    const liquid = liquidRef.current;
    const text = textRef.current;
    const circle = circleRef.current;
    const height = 100 - value;
    const colors = getColors(value);

    gsap.to(liquid, { y: `${height}%`, duration: 2, ease: 'power3.out' });
    
    const animatedValue = { val: 0 };
    gsap.to(animatedValue, {
      val: value,
      duration: 2,
      ease: 'power3.out',
      onUpdate: () => {
        text.textContent = `${Math.round(animatedValue.val)}%`;
      }
    });

    gsap.to(liquid.querySelector('path'), { fill: `url(#liquid-gradient-${value})`, duration: 1 });

    // Wave animation
    const wave = liquid.querySelector('path');
    gsap.to(wave, {
      attr: { d: 'M0,15 C150,30 350,-30 500,15 L500,100 L0,100 Z' },
      repeat: -1,
      yoyo: true,
      duration: 5,
      ease: 'sine.inOut'
    });

    // Bubble animation
    bubblesRef.current.forEach((bubble) => {
        gsap.fromTo(bubble, { 
        y: 100, 
        opacity: 0 
      }, {
        y: -200,
        opacity: 1,
        duration: 2 + Math.random() * 4,
        repeat: -1,
        delay: Math.random() * 5,
        ease: 'power1.inOut',
        yoyo: true
      });
    });

    // Breathing effect
    gsap.to(circle, {
        scale: 1.05,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
    })

  }, [value]);

  const colors = getColors(value);

  return (
    <div className="credit-health-meter-container">
      <svg className="credit-health-meter-svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id={`liquid-gradient-${value}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{stopColor: colors.gradient, stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: colors.main, stopOpacity: 1}} />
          </linearGradient>
          <clipPath id="clip">
            <circle cx="50" cy="50" r="45" />
          </clipPath>
        </defs>
        <g clipPath="url(#clip)">
          <rect width="100" height="100" fill="#f1faee" />
          <g ref={liquidRef} transform="translate(0, 100)">
            <path d="M0,15 C150,-15 350,30 500,15 L500,100 L0,100 Z" transform="scale(0.2)" fill={`url(#liquid-gradient-${value})`}/>
            <g className="bubbles">
              {[...Array(15)].map((_, i) => (
                <circle 
                  key={i} 
                  ref={el => bubblesRef.current[i] = el}
                  cx={Math.random() * 100}
                  cy={Math.random() * 100 + 100}
                  r={Math.random() * 3 + 2}
                  fill="rgba(255, 255, 255, 0.3)"
                  stroke={colors.main}
                  strokeWidth="0.5"
                />
              ))}
            </g>
          </g>
        </g>
        <circle ref={circleRef} cx="50" cy="50" r="45" stroke="#1D3557" strokeWidth="3" fill="none" />
        <text ref={textRef} x="50" y="50" textAnchor="middle" dy=".3em" className="credit-health-meter-text">
          {value}%
        </text>
      </svg>
    </div>
  );
};

export default CreditHealthMeter;