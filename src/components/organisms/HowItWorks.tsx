"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import styles from "./HowItWorks.module.css";
import TypingText from "../atoms/TypingText";
import dynamic from "next/dynamic";
import Image from "next/image";

const steps = [
  {
    title: "Request Blood",
    description: "Customers request blood via the portal, verified by Aadhaar.",
    image: "https://res.cloudinary.com/drwfe1mhk/image/upload/f_auto,q_auto/hemohive_assets/customer_request_blood"
  },
  {
    title: "Credit System",
    description: "Blood is issued on credit, creating accountability to return it.",
    image: "https://res.cloudinary.com/drwfe1mhk/image/upload/f_auto,q_auto/hemohive_assets/credit_blood"
  },
  {
    title: "AI-Powered Delivery",
    description: "Our AI dispatches the nearest delivery partner for real-time transport.",
    image: "https://res.cloudinary.com/drwfe1mhk/image/upload/f_auto,q_auto/hemohive_assets/delievery"
  },
  {
    title: "Live Tracking",
    description: "Track the delivery in real-time from the blood bank to the hospital.",
    image: "https://res.cloudinary.com/drwfe1mhk/image/upload/f_auto,q_auto/hemohive_assets/live_tracking"
  },
  {
    title: "Return & Restore",
    description: "Return the equivalent blood unit later to restore your credit.",
    image: "https://res.cloudinary.com/drwfe1mhk/image/upload/f_auto,q_auto/hemohive_assets/return_restore"
  },
];

const Antigravity = dynamic(() => import("../Antigravity"), { ssr: false });

const StepCard = ({
  step,
  isActive,
  onToggle
}: {
  step: any;
  isActive: boolean;
  onToggle: () => void;
}) => {
  return (
    <div
      className="group relative h-[450px] w-[450px] overflow-hidden bg-black rounded-xl shadow-2xl flex-shrink-0 cursor-pointer"
      onClick={onToggle}
      data-state={isActive ? "active" : "inactive"}
    >
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full grayscale group-hover:grayscale-0 group-data-[state=active]:grayscale-0 transition-all duration-700 ease-in-out">
        <Image
          src={step.image}
          alt={step.title}
          layout="fill"
          objectFit="cover"
          className="transform group-hover:scale-110 group-data-[state=active]:scale-110 transition-transform duration-700"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-60 group-data-[state=active]:opacity-60 transition-opacity duration-500" />

      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-8 pointer-events-none">
        <h3 className="text-4xl font-black uppercase text-white mb-4 drop-shadow-lg transform group-hover:-translate-y-2 group-data-[state=active]:-translate-y-2 transition-transform duration-300">
          {step.title}
        </h3>
        <p className="text-lg font-normal text-gray-200 drop-shadow-md opacity-0 group-hover:opacity-100 group-data-[state=active]:opacity-100 transform translate-y-4 group-hover:translate-y-0 group-data-[state=active]:translate-y-0 transition-all duration-500 delay-100">
          {step.description}
        </p>
      </div>
    </div>
  );
};

const HowItWorks = () => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });

  const x = useTransform(scrollYProgress, [0, 1], ["1%", "-95%"]);

  const handleCardClick = (index: number) => {
    setActiveIndex(prev => prev === index ? null : index);
  };

  return (
    <section className="bg-white relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Antigravity count={200} />
      </div>
      <div className="text-center pt-20 pb-16 relative z-10">
        <h1 className={`font-headline font-black text-gray-900 tracking-tighter ${styles.glitch}`} data-text="How It Works">How It Works</h1>
        <TypingText text="A simple and efficient process" className="font-body text-xl text-gray-600 max-w-3xl mx-auto mb-4 mt-2" />
      </div>
      <div ref={targetRef} className="relative h-[300vh]">
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <motion.div style={{ x }} className="flex gap-4">
            {steps.map((step, index) => (
              <StepCard
                key={index}
                step={step}
                isActive={activeIndex === index}
                onToggle={() => handleCardClick(index)}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
