"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { motion, AnimatePresence } from "framer-motion";

gsap.registerPlugin(MotionPathPlugin);

interface SplashScreenProps {
  onAnimationComplete?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  const beeRef = useRef<HTMLImageElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    // Safety check
    if (!beeRef.current || !logoRef.current || !taglineRef.current || !gradientRef.current) return;

    const flySound = new Audio("/assets/sounds/bee_fly.mp3");
    const landSound = new Audio("/assets/sounds/bee_land.mp3");

    // 🐝 Set initial bee position at center
    gsap.set(beeRef.current, {
      left: "50%",
      top: "50%",
      xPercent: -50,
      yPercent: -50,
      transformOrigin: "center center",
      scaleX: 1,
      scaleY: 1,
      rotateY: 0,
    });

    // 🌈 Background gradient transition
    gsap.to(gradientRef.current, {
      background: "linear-gradient(135deg, #000000, #0B0B0B, #1A0000)",
      duration: 3,
      ease: "power1.inOut",
    });

    // ✨ Timeline
    const tl = gsap.timeline({
      onStart: () => {
        flySound.volume = 0.3;
        flySound.play().catch(() => { }); // catch play error if user hasn't interacted
      },
      onComplete: () => {
        // Stop flying sound, play landing sound
        gsap.to(flySound, { volume: 0, duration: 0.6 });
        landSound.volume = 0.4;
        landSound.play().catch(() => { });

        // Reveal logo
        if (logoRef.current) {
          gsap.to(logoRef.current, {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "elastic.out(1, 0.75)",
          });
        }

        // Reveal tagline
        if (taglineRef.current) {
          gsap.to(taglineRef.current, {
            opacity: 1,
            delay: 0.8,
            duration: 1.5,
            y: 0,
            ease: "power2.out",
          });
        }

        // Complete splash after a short delay
        setTimeout(() => onAnimationComplete?.(), 3000);
      },
    });

    // 🌀 Bee infinity flight path
    tl.to(beeRef.current, {
      duration: 5.5,
      ease: "power2.inOut",
      motionPath: {
        path: "M0,0 C -200,-150 -200,150 0,0 C 200,-150 200,150 0,20",
        align: "self",
        autoRotate: false,
      },
      onUpdate: function () {
        const progress = this.progress();
        // Flip the bee for 3D realism
        if (beeRef.current) {
          if (progress < 0.5) {
            gsap.to(beeRef.current, { scaleX: 1, duration: 0.2 });
          } else {
            gsap.to(beeRef.current, { scaleX: -1, duration: 0.2 });
          }
        }
      },
    })
      // 🪶 Add a small landing bounce for realism
      .to(beeRef.current, {
        scale: 0.9,
        duration: 0.25,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut",
      });

    // Cleanup sounds on unmount
    return () => {
      flySound.pause();
      landSound.pause();
    };
  }, [onAnimationComplete]);

  return (
    <AnimatePresence>
      <motion.div
        ref={gradientRef}
        className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #000000, #1A0000)",
          color: "#fff",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        {/* 🐝 Bee logo image */}
        <motion.img
          ref={beeRef}
          src="https://res.cloudinary.com/drwfe1mhk/image/upload/f_auto,q_auto/hemohive_assets/Splash_BEE"
          alt="bee"
          className="absolute w-28 h-28"
          style={{
            zIndex: 10,
            filter: "drop-shadow(0 4px 8px rgba(255,0,0,0.3))",
            transformStyle: "preserve-3d",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* 🩸 HemoHive text logo */}
        <motion.img
          ref={logoRef}
          src="https://res.cloudinary.com/drwfe1mhk/image/upload/f_auto,q_auto/hemohive_assets/HemoHive_Text_Logo"
          alt="HemoHive Logo"
          className="opacity-0 scale-75 mt-32"
          style={{ width: "500px" }}
        />

        {/* 💬 Tagline */}
        <motion.p
          ref={taglineRef}
          className="text-lg mt-4 opacity-0 translate-y-6 font-headline"
        >
          When Every Second Matters, We Deliver.
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
};

export default SplashScreen;
