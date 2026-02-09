"use client";

import React from 'react';
import { Fade, Zoom, Slide } from "react-awesome-reveal";

const AwarenessRewards = () => {
  const slides = [
    { title: '1 donation saves 3 lives', animation: 'fade' },
    { title: 'Every drop counts 💧', animation: 'zoom' },
    { title: 'Earn badges, spread hope 🌟', animation: 'slide' },
  ];

  const rewards = [
    { badge: 'Hero Donor', points: 100 },
    { badge: 'Frequent Saver', points: 250 },
  ];

  const getAnimation = (animation, children) => {
    switch (animation) {
      case 'fade':
        return <Fade triggerOnce>{children}</Fade>;
      case 'zoom':
        return <Zoom triggerOnce>{children}</Zoom>;
      case 'slide':
        return <Slide direction="right" triggerOnce>{children}</Slide>;
      default:
        return children;
    }
  }

  return (
    <div className="awareness-rewards card">
      <div className="card-header">
        <h2 className="card-title">Awareness & Rewards</h2>
      </div>
      <div className="card-content">
        <div className="carousel">
          {slides.map((slide, index) => (
            <div key={index} className="slide">
              {getAnimation(slide.animation, <h3>{slide.title}</h3>)}
            </div>
          ))}
        </div>
        <div className="rewards-list">
          <h3>Rewards</h3>
          <ul>
            {rewards.map((reward, index) => (
              <li key={index}>
                <span className="badge">{reward.badge}</span>
                <span className="points">{reward.points} Points</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AwarenessRewards;
