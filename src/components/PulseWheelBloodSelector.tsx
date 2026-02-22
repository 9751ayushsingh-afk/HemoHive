"use client";
import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface BloodGroup {
    type: string;
    tooltip: string;
}

const bloodGroups: BloodGroup[] = [
    { type: "A+", tooltip: "Most common. You’re a universal helper!" },
    { type: "A−", tooltip: "Rare and important. Every drop counts." },
    { type: "B+", tooltip: "Strong and caring — your blood gives hope." },
    { type: "B−", tooltip: "Precious type — life savers like you are few." },
    { type: "AB+", tooltip: "Universal receiver — a rare bond of compassion." },
    { type: "AB−", tooltip: "Rarest of all. You’re one in a million!" },
    { type: "O+", tooltip: "Powerful and generous — you’re the backbone of donations." },
    { type: "O−", tooltip: "Rare and precious — you’re a universal donor." },
];

interface PulseWheelBloodSelectorProps {
    onSelect: (bloodGroup: string) => void;
    onNext: () => void;
}

const PulseWheelBloodSelector = ({ onSelect, onNext }: PulseWheelBloodSelectorProps) => {
    const [selected, setSelected] = useState<BloodGroup | null>(null);
    const [confirmed, setConfirmed] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const wheelRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const rippleRef = useRef<HTMLDivElement>(null);
    const particleContainerRef = useRef<HTMLDivElement>(null);
    const pulseTl = useRef<gsap.core.Timeline>(gsap.timeline());

    useEffect(() => {
        // Particle Background
        const particles: HTMLDivElement[] = [];
        if (particleContainerRef.current && containerRef.current) {
            for (let i = 0; i < 30; i++) {
                const particle = document.createElement('div');
                particle.className = 'absolute w-1 h-1 bg-red-500 rounded-full';
                particleContainerRef.current.appendChild(particle);
                gsap.set(particle, {
                    x: gsap.utils.random(0, containerRef.current.offsetWidth),
                    y: gsap.utils.random(0, containerRef.current.offsetHeight),
                    opacity: 0,
                });
                particles.push(particle);
            }

            const animateParticles = () => {
                particles.forEach(p => {
                    gsap.to(p, {
                        x: `+=${gsap.utils.random(-50, 50)}`,
                        y: `+=${gsap.utils.random(-50, 50)}`,
                        opacity: gsap.utils.random(0.1, 0.5),
                        ease: 'sine.inOut',
                        onComplete: () => { gsap.to(p, { opacity: 0, duration: 1 }); },
                    });
                });
            };
            const particleInterval = setInterval(animateParticles, 2000);
            return () => clearInterval(particleInterval);
        }
    }, []);

    useEffect(() => {
        // On-load animation
        if (wheelRef.current) {
            gsap.fromTo(wheelRef.current,
                { opacity: 0, scale: 0.8, rotation: -180 },
                { opacity: 1, scale: 1, rotation: 0, duration: 3, ease: 'power3.out', delay: 0.5 }
            );
        }
    }, []);

    const handleSelect = (bg: BloodGroup, index: number) => {
        if (!wheelRef.current || !rippleRef.current) return;

        pulseTl.current.clear().time(0); // Stop any existing pulse animation

        if (selected) {
            const prevIndex = bloodGroups.findIndex(b => b.type === selected.type);
            if (prevIndex !== -1 && wheelRef.current.children[prevIndex]) {
                const previousSelectedBubble = wheelRef.current.children[prevIndex] as HTMLElement;
                const previousFillElement = previousSelectedBubble.querySelector('.liquid-fill');
                if (previousFillElement) {
                    gsap.to(previousFillElement, { height: '0%', duration: 0.5, ease: 'power2.out' });
                }
            }
        }

        setSelected(bg);
        onSelect(bg.type);
        setConfirmed(false);

        const angle = (index / bloodGroups.length) * 360;
        const rotation = -angle;

        const tl = gsap.timeline({ onComplete: () => setConfirmed(true) });

        tl.to(wheelRef.current, { rotation: `${rotation}_short`, duration: 1.5, ease: 'power4.out' });

        const selectedBubble = wheelRef.current.children[index] as HTMLElement;
        const fillElement = selectedBubble.querySelector('.liquid-fill');

        if (fillElement) {
            tl.to(fillElement, { height: '100%', duration: 1, ease: 'power2.inOut' }, "-=1");
        }

        gsap.to(rippleRef.current, {
            scale: 3,
            opacity: 0,
            duration: 1.2,
            ease: 'expo.out',
            onComplete: () => {
                if (rippleRef.current) {
                    gsap.set(rippleRef.current, { scale: 0, opacity: 0.5 });
                }
            }
        });
    };

    useEffect(() => {
        if (confirmed && wheelRef.current && selected) {
            const index = bloodGroups.findIndex(bg => bg.type === selected.type);
            if (index !== -1 && wheelRef.current.children[index]) {
                const selectedBubble = wheelRef.current.children[index];
                pulseTl.current = gsap.timeline({ repeat: -1, yoyo: true });
                pulseTl.current.to(selectedBubble, { scale: 1.1, duration: 0.6, ease: 'sine.inOut' });
            }

            if (buttonRef.current) {
                gsap.fromTo(buttonRef.current,
                    { y: 50, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.5 }
                );
            }
        }
    }, [confirmed, selected]);


    return (
        <div ref={containerRef} className="flex flex-col items-center justify-center w-full text-white p-4 rounded-lg overflow-hidden relative" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <div ref={particleContainerRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
            <h2 className="text-2xl font-semibold mb-2 z-10 text-white">Select Your Blood Group</h2>
            <p className="text-red-300 mb-6 z-10 text-sm">Your blood type is a vital part of your identity.</p>

            <div ref={wheelRef} className="relative w-80 h-80 md:w-96 md:h-96 z-10 overflow-visible">
                {bloodGroups.map((bg, index) => {
                    const angle = (index / bloodGroups.length) * 360;
                    return (
                        <div
                            key={bg.type}
                            className="absolute top-1/2 left-1/2 w-24 h-24 -m-12 group"
                            style={{ transform: `rotate(${angle}deg) translate(10rem) rotate(-${angle}deg)` }}
                            onClick={() => handleSelect(bg, index)}
                        >
                            <div className="w-full h-full rounded-full flex items-center justify-center text-2xl font-bold cursor-pointer transition-all duration-300 border-2 border-red-500/30 bg-red-900/20 hover:bg-red-500/40 hover:scale-110 hover:shadow-[0_0_20px_rgba(255,0,0,0.6)] relative overflow-visible">
                                <div className="absolute inset-0 rounded-full overflow-hidden">
                                    <div className="absolute bottom-0 left-0 w-full h-0 bg-gradient-to-t from-red-600 to-red-500 liquid-fill" />
                                </div>

                                <span className="relative z-10">{bg.type}</span>
                                <div className="absolute hidden group-hover:flex justify-center items-center bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[8rem] px-3 py-1 bg-gray-800 text-white text-xs rounded-md shadow-lg whitespace-normal text-center z-50">
                                    {bg.tooltip}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={rippleRef} className="absolute top-1/2 left-1/2 w-24 h-24 -m-12 rounded-full bg-red-500" style={{ scale: 0, opacity: 0.5 }} />
            </div>

            {confirmed && (
                <button ref={buttonRef} onClick={onNext} className="mt-12 px-8 py-3 bg-red-600 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-[0_0_15px_rgba(255,0,0,0.5)] z-10">
                    Confirm & Next
                </button>
            )}
        </div>
    );
};

export default PulseWheelBloodSelector;
