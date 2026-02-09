"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const TransactionTimeline = ({ entries }) => {
  const timelineRef = useRef(null);

  useEffect(() => {
    gsap.from(timelineRef.current.children, {
      opacity: 0,
      y: 50,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out'
    });
  }, []);

  return (
    <div ref={timelineRef} className="transaction-timeline">
      {entries.map((entry, index) => (
        <div key={index} className="timeline-entry">
          <div className="timeline-date">{entry.date}</div>
          <div className="timeline-event">{entry.event}</div>
          <div className="timeline-details">{entry.details}</div>
        </div>
      ))}
    </div>
  );
};

export default TransactionTimeline;
