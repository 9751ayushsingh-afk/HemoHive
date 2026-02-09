'use client';

import React, { useEffect, useRef, useState, CSSProperties } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import gsap from 'gsap';
import { Droplet, Calendar, CheckCircle2, Award } from 'lucide-react';

const PARTICLE_COUNT = 14;

interface DonateBloodCardProps {
  bloodGroup?: string;
  lastDonationDate?: string;
  eligibilityStatus?: string;
  nextEligibleDate?: string;
  totalDonationsDone?: number;
}

export default function DonateBloodCard({
  bloodGroup = 'A+',
  lastDonationDate = 'N/A',
  eligibilityStatus = 'Eligible',
  nextEligibleDate = 'N/A',
  totalDonationsDone = 5,
}: DonateBloodCardProps) {
  const router = useRouter();

  // Animation refs
  const cardRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const neuronRef = useRef<HTMLDivElement>(null);
  const cellsRef = useRef<(HTMLDivElement | null)[]>([]);
  const particlesContainerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // GSAP looping animations (drop pulse, neuron draw, floating cells)
  useEffect(() => {
    if (shouldReduceMotion || !cardRef.current) return; // respect reduced motion

    const ctx = gsap.context(() => {
      // gentle float for card
      gsap.to(cardRef.current, { y: -6, duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' });

      // drop pulse
      if (dropRef.current) {
        gsap.to(dropRef.current, { scale: 1.03, duration: 2.6, yoyo: true, repeat: -1, transformOrigin: '50% 50%' });
      }

      // neuron path draw
      const path = neuronRef.current?.querySelector('path');
      if (path) {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, { strokeDashoffset: 0, duration: 4.2, yoyo: true, repeat: -1, ease: 'power1.inOut', delay: 0.2 });
      }

      // neuron dot pulses
      const dots = neuronRef.current?.querySelectorAll('.rse-neuron-dot');
      if (dots) {
        dots.forEach((d, i) => {
          gsap.to(d, { y: i % 2 === 0 ? -4 : -2, scale: 1.12, duration: 2.6 + i * 0.2, yoyo: true, repeat: -1, delay: i * 0.08 });
        });
      }

      // floating cells subtle motion
      cellsRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.to(el, { yPercent: -8 - i * 2, duration: 6 + i * 1.1, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: i * 0.25 });
      });
    }, cardRef);

    return () => {
      ctx.revert();
      gsap.killTweensOf('*');
    };
  }, [shouldReduceMotion]);

  // spawn a particle burst at pointer location
  function spawnParticles(clientX: number, clientY: number) {
    if (!particlesContainerRef.current || shouldReduceMotion || !cardRef.current) return;
    const container = particlesContainerRef.current;
    const rect = cardRef.current.getBoundingClientRect();
    const originX = ((clientX - rect.left) / rect.width) * 100 + '%';
    const originY = ((clientY - rect.top) / rect.height) * 100 + '%';

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const el = document.createElement('span');
      el.className = 'rse-particle';
      const size = Math.round(Math.random() * 10) + 6;
      Object.assign(el.style, {
        position: 'absolute',
        left: originX,
        top: originY,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '999px',
        background: Math.random() > 0.5 ? '#ff6b6b' : '#ff3b30',
        boxShadow: `0 10px 24px ${Math.random() > 0.5 ? '#ff6b6b' : '#ff3b30'}66`,
        pointerEvents: 'none',
        transform: 'translate(-50%,-50%)',
        zIndex: '60',
      });
      container.appendChild(el);

      const vx = (Math.random() - 0.5) * 260;
      const vy = (Math.random() - 0.5) * 200;
      const rot = (Math.random() - 0.5) * 360;
      const dur = 0.6 + Math.random() * 0.6;
      gsap.to(el, {
        x: vx,
        y: vy,
        rotation: rot,
        opacity: 0,
        scale: 0.6 + Math.random() * 1.2,
        duration: dur,
        ease: 'power2.out',
        onComplete: () => el.remove(),
      });
    }
  }

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    // compute client coords (keyboard events don't have clientX/clientY)
    const mouseEvent = event as React.MouseEvent<HTMLDivElement>;
    const clientX = mouseEvent.clientX ?? (cardRef.current.getBoundingClientRect().left + cardRef.current.clientWidth / 2);
    const clientY = mouseEvent.clientY ?? (cardRef.current.getBoundingClientRect().top + cardRef.current.clientHeight / 2);

    // tiny pop on drop
    if (!shouldReduceMotion && dropRef.current) {
      gsap.fromTo(dropRef.current, { scale: 0.96 }, { scale: 1.08, duration: 0.14, yoyo: true, repeat: 1, ease: 'power1.out' });
    }

    // spawn particles and navigate after a tiny delay for UX
    spawnParticles(clientX, clientY);
    setTimeout(() => router.push('/donor/donate-blood'), 260);
  };

  // small helper for keyboard accessibility (Enter/Space)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(e);
    }
  };

  // Framer Motion card micro-variants
  const cardVariants: Variants = {
    initial: { opacity: 0, y: 8, scale: 0.995 },
    enter: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 220, damping: 18 }
    },
    hover: {
      y: -6,
      boxShadow: '0 20px 45px rgba(255,75,85,0.12)',
      transition: { duration: 0.26 }
    },
    tap: { scale: 0.985 },
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <motion.div
        ref={cardRef}
        className="relative overflow-hidden rounded-lg"
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        variants={cardVariants}
        initial="initial"
        animate="enter"
        whileHover={!shouldReduceMotion ? 'hover' : undefined}
        whileTap={!shouldReduceMotion ? 'tap' : undefined}
        aria-label="RaktSeva — Donate Blood"
      >
        {/* particles container for GSAP-created DOM particles */}
        <div ref={particlesContainerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 40 }} />

        {/* top-left neuron svg + dots */}
        <div ref={neuronRef} className="absolute left-4 top-4 pointer-events-none z-20" aria-hidden>
          <svg width="120" height="48" viewBox="0 0 120 48" className="block">
            <path d="M8 24 C30 6, 60 42, 92 18" stroke="rgba(255,90,90,0.12)" strokeWidth="2" fill="none" />
          </svg>
          <div className="relative -mt-8">
            <span className="rse-neuron-dot" style={dotStyle(0)} />
            <span className="rse-neuron-dot" style={{ ...dotStyle(1), left: 20 }} />
            <span className="rse-neuron-dot" style={{ ...dotStyle(2), left: 36, top: -6 }} />
          </div>
        </div>

        <CardHeader>
          <CardTitle className="text-red-600">RaktSeva <span className="ml-2 text-sm inline-block bg-red-50 text-red-600 px-2 py-1 rounded-md font-medium">रक्तदान करें</span></CardTitle>
          <CardDescription>Check eligibility & schedule your donation (अपनी पात्रता जांचें और दान शेड्यूल करें)</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-4 relative z-10">
            <div ref={dropRef} className="w-20 h-20 flex items-center justify-center">
              {/* blood drop svg */}
              <svg viewBox="0 0 100 100" className="w-20 h-20">
                <defs>
                  <linearGradient id="rse_grad" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#ff6b6b" />
                    <stop offset="60%" stopColor="#ff3b30" />
                    <stop offset="100%" stopColor="#c6002b" />
                  </linearGradient>
                </defs>

                <path d="M50 6 C62 20, 86 36, 86 58 C86 76, 70 90, 50 92 C30 90, 14 76, 14 58 C14 36, 38 20, 50 6 Z" fill="url(#rse_grad)" stroke="#ffb3b3" strokeWidth="1" />
                <path d="M46 18 C48 14, 62 14, 66 22 C70 30, 62 36, 56 44 C52 34,46 24,46 18 Z" fill="#ffffff66" style={{ mixBlendMode: 'overlay' }} />
              </svg>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-semibold text-slate-900">RaktSeva</h3>
                <div className="text-sm bg-red-50 text-red-600 px-2 py-1 rounded-md font-medium">रक्तदान करें</div>
              </div>

              <p className="mt-1 text-sm text-slate-600">
                Quick eligibility check • Schedule donation • Earn credits
              </p>

              <div className="mt-4 flex items-center gap-3">
                <div className="text-sm bg-white/60 px-3 py-1 rounded-lg border border-white/20">
                  <strong>Next: </strong> {nextEligibleDate !== 'N/A' ? nextEligibleDate : 'No date yet'}
                </div>

                <Button
                  className="ml-auto bg-gradient-to-r from-red-500 to-red-600 text-white"
                  onClick={(e) => { e.stopPropagation(); /* keep card click separate */ router.push('/donor/donate-blood'); }}
                >
                  Donate Now
                </Button>
              </div>
            </div>
          </div>

          {/* stats area underneath (kept from your original) */}
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-red-500" />
              <div>
                <strong>Blood Group:</strong>
                <div>{bloodGroup ?? '—'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-500" />
              <div>
                <strong>Last Donation:</strong>
                <div>{lastDonationDate ?? '—'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <div>
                <strong>Eligibility:</strong>
                <div>{eligibilityStatus ?? '—'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              <div>
                <strong>Total Donations:</strong>
                <div>{totalDonationsDone ?? 0}</div>
              </div>
            </div>
          </div>
        </CardContent>

        {/* floating decorative cells (background) */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          {[
            { left: '12%', top: '20%', size: 8 },
            { left: '80%', top: '12%', size: 10 },
            { left: '68%', top: '56%', size: 12 },
            { left: '28%', top: '72%', size: 9 }
          ].map((c, i) => (
            <div
              key={i}
              ref={(el) => { cellsRef.current[i] = el; }}
              style={{
                position: 'absolute',
                left: c.left,
                top: c.top,
                width: `${c.size}px`,
                height: `${c.size}px`,
                borderRadius: 999,
                background: 'radial-gradient(circle at 30% 30%, #ff7b7b, #ff3b30)',
                opacity: 0.12,
                filter: 'blur(6px)',
                transform: 'translateZ(0)',
                pointerEvents: 'none'
              }}
            />
          ))}
        </div>

        {/* small CTA arrow text */}
        <div className="absolute right-4 bottom-4 text-sm text-slate-500">
          <span className="flex items-center gap-2">
            <span className="text-xs">Go to donor/donate-blood page</span>
            <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </span>
        </div>
      </motion.div>
    </Card>
  );
}

// small helper for neuron dot inline styles
function dotStyle(i: number): CSSProperties {
  return {
    display: 'inline-block',
    position: 'absolute',
    left: (i === 0 ? 0 : i === 1 ? 20 : 36) + 'px',
    top: (i === 2 ? -6 : 0) + 'px',
    width: 6,
    height: 6,
    borderRadius: '999px',
    background: 'linear-gradient(180deg,#ff8a8a,#ff3b30)',
    boxShadow: '0 6px 18px rgba(255,50,50,0.12)'
  };
}