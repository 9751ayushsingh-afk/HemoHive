'use client';
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './AIAssistant.css';

const AIAssistant = () => {
  const assistantRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(assistantRef.current, { x: '100%', opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 2 });
  }, []);

  return (
    <div className="ai-assistant-bubble" ref={assistantRef}>
      <div className="ai-assistant-text">
        Need help with your pending credit? Let’s resolve it together!
      </div>
    </div>
  );
};

export default AIAssistant;
