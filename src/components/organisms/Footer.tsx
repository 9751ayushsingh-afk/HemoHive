"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const socialLinks = [
  {
    name: "Instagram",
    href: "#",
    color: "group-hover:text-pink-500",
    shadow: "group-hover:drop-shadow-[0_0_12px_rgba(236,72,153,0.8)]",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    name: "Facebook",
    href: "#",
    color: "group-hover:text-[#3b5998]",
    shadow: "group-hover:drop-shadow-[0_0_12px_rgba(59,89,152,0.8)]",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    name: "YouTube",
    href: "#",
    color: "group-hover:text-[#FF0000]",
    shadow: "group-hover:drop-shadow-[0_0_12px_rgba(255,0,0,0.8)]",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.077 0 12 0 12s0 3.923.498 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.923 24 12 24 12s0-3.923-.498-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    name: "LinkedIn",
    href: "#",
    color: "group-hover:text-[#0077b5]",
    shadow: "group-hover:drop-shadow-[0_0_12px_rgba(0,119,181,0.8)]",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    name: "WhatsApp",
    href: "#",
    color: "group-hover:text-[#25D366]",
    shadow: "group-hover:drop-shadow-[0_0_12px_rgba(37,211,102,0.8)]",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M12.031 0C5.385 0 0 5.386 0 12.031c0 2.123.553 4.195 1.603 6.01L.069 23.511l5.63-1.478c1.745.968 3.731 1.478 5.753 1.478h.004c6.643 0 12.03-5.386 12.03-12.03S18.093 0 12.031 0zm0 21.492h-.002c-1.782 0-3.535-.478-5.071-1.388l-.364-.216-3.77.989.988-3.676-.237-.377a10.038 10.038 0 0 1-1.536-5.311c0-5.54 4.51-10.051 10.054-10.051 2.686 0 5.21 1.046 7.108 2.945A10.007 10.007 0 0 1 22.08 11.44c-.002 5.541-4.513 10.052-10.049 10.052zm5.513-7.535c-.302-.15-1.789-.882-2.065-.983-.275-.1-.476-.15-.676.15-.202.302-.782.983-.958 1.185-.177.201-.354.226-.656.074-.301-.15-1.275-.47-2.428-1.5-.898-.802-1.503-1.792-1.68-2.094-.176-.301-.019-.464.133-.614.136-.134.301-.351.453-.527.151-.176.202-.301.302-.501.101-.202.05-.378-.025-.528-.076-.151-.676-1.63-.925-2.233-.243-.588-.49-.508-.676-.517-.176-.008-.378-.008-.579-.008-.201 0-.528.075-.805.378-.276.301-1.056 1.031-1.056 2.513s1.082 2.915 1.233 3.115c.15.201 2.124 3.243 5.143 4.545.719.31 1.28.495 1.718.634.721.229 1.378.196 1.895.118.578-.087 1.789-.731 2.041-1.434.251-.703.251-1.307.176-1.434-.076-.126-.277-.202-.579-.352z" clipRule="evenodd" />
      </svg>
    )
  }
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 }
  }
};

const Footer = () => {
  // Track which social link is currently hovered to create the ambient aura
  const [activeAura, setActiveAura] = useState<string | null>(null);

  // Developer Link Hover States for God-Level Holographic / Scramble UX
  const [isDevHovered, setIsDevHovered] = useState(false);
  const defaultText = "Meet the Developer";
  const hoveredText = "Ayush Singh";
  const [scrambledText, setScrambledText] = useState(defaultText);
  const scrambleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Progressive Tea Count State
  const [teaCount, setTeaCount] = useState(0);

  useEffect(() => {
    // Target date from the user: August 1, 2025
    const START_DATE = new Date("2025-08-01T00:00:00Z").getTime();
    const now = new Date().getTime();
    
    // Calculate total days elapsed positively.
    const millisecondsPassed = Math.max(0, now - START_DATE);
    const daysSince = Math.floor(millisecondsPassed / (1000 * 60 * 60 * 24));
    
    setTeaCount(daysSince * 3);
  }, []);

  // Terminal Text Scramble Effect
  useEffect(() => {
    let iteration = 0;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
    const targetText = isDevHovered ? hoveredText : defaultText;
    const startingText = isDevHovered ? defaultText : hoveredText;

    clearInterval(scrambleIntervalRef.current as any);

    scrambleIntervalRef.current = setInterval(() => {
      setScrambledText(
        targetText
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return targetText[index];
            }
            // Add padding if target is longer, or just scramble
            return letters[Math.floor(Math.random() * letters.length)];
          })
          .join("")
      );

      if (iteration >= Math.max(targetText.length, startingText.length)) {
        clearInterval(scrambleIntervalRef.current as any);
        setScrambledText(targetText); // lock exactly to target
      }

      iteration += 1 / 2; // Controls speed of scramble resolution
    }, 30);

    return () => clearInterval(scrambleIntervalRef.current as any);
  }, [isDevHovered]);

  // Map the text colors back to raw rgba values for the aura so Framer Motion can smoothly interpolate it
  const getAuraColor = (colorClass: string | null) => {
    if (!colorClass) return 'rgba(236, 72, 153, 0.05)'; // subtle secondary default
    if (colorClass.includes('pink-500')) return 'rgba(236, 72, 153, 0.35)'; // Instagram
    if (colorClass.includes('#3b5998')) return 'rgba(59, 89, 152, 0.45)'; // Facebook
    if (colorClass.includes('#FF0000')) return 'rgba(255, 0, 0, 0.35)'; // YouTube
    if (colorClass.includes('#0077b5')) return 'rgba(0, 119, 181, 0.45)'; // LinkedIn
    if (colorClass.includes('#25D366')) return 'rgba(37, 211, 102, 0.35)'; // WhatsApp
    return 'rgba(236, 72, 153, 0.05)';
  };

  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t border-white/5 relative overflow-hidden transition-colors duration-700">
      {/* Dynamic Background ambient aura lighting */}
      <motion.div
        animate={{
          backgroundColor: getAuraColor(activeAura),
          opacity: activeAura ? 1 : 0.6,
          scale: activeAura ? 1.2 : 1
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 sm:h-64 blur-[100px] sm:blur-[140px] rounded-[100%] pointer-events-none"
      />

      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-300 to-gray-500 drop-shadow-sm">
          Ready to make a difference?
        </h2>
        <p className="mb-10 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Join HemoHive today and be a part of the solution to India's blood crisis.
        </p>

        <Link
          href="/register"
          className="glowing-edge relative inline-flex items-center justify-center p-4 px-6 py-3 overflow-hidden font-medium text-white transition duration-300 ease-out bg-secondary rounded-full shadow-md group mb-16"
        >
          <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-accent group-hover:translate-x-0 ease">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </span>
          <span className="absolute flex items-center justify-center w-full h-full text-white transition-all duration-300 transform group-hover:translate-x-full ease tracking-wider">Join the Hive</span>
          <span className="relative invisible tracking-wider">Join the Hive</span>
        </Link>

        {/* --- Innovative Social Media Dock --- */}
        <div className="mt-8 mb-12">
          <p className="text-sm text-gray-500 uppercase tracking-[0.2em] mb-6 font-semibold">Connect With Us</p>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap"
          >
            {socialLinks.map((social) => (
              <motion.a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className={`group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/5 border border-white/10 backdrop-blur-lg overflow-hidden transition-all duration-500 hover:bg-white/10 hover:border-white/20`}
                onMouseEnter={() => setActiveAura(social.color)}
                onMouseLeave={() => setActiveAura(null)}
              >
                {/* The icon */}
                <div className={`relative z-10 text-gray-500 transition-all duration-300 mt-0.5 ${social.color} ${social.shadow}`}>
                  {social.icon}
                </div>

                {/* Hidden label for screen readers */}
                <span className="sr-only">{social.name}</span>
              </motion.a>
            ))}
          </motion.div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 gap-6 md:gap-4">
          <div>&copy; {new Date().getFullYear()} HemoHive. All rights reserved.</div>

          <div
            className="group relative inline-flex"
            onMouseEnter={() => setIsDevHovered(true)}
            onMouseLeave={() => setIsDevHovered(false)}
          >
            {/* Holographic Profile Card (Option 1) */}
            <AnimatePresence>
              {isDevHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: -80, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(10px)" }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 px-4 py-3 mb-2 w-72 rounded-xl bg-black/80 border border-sky-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(14,165,233,0.3)] flex flex-col z-50 pointer-events-none"
                >
                  {/* Hologram Scanner Line */}
                  <motion.div
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                    className="absolute left-0 right-0 h-[1px] bg-sky-400/50 shadow-[0_0_10px_rgba(56,189,248,0.8)] z-10"
                  />

                  {/* Header Row: Avatar & ID */}
                  <div className="flex items-center gap-4 w-full">
                    <div className="relative w-12 h-12 rounded-full border border-sky-400/50 bg-sky-900/40 flex items-center justify-center overflow-hidden shrink-0 shadow-[0_0_15px_inset_rgba(56,189,248,0.4)]">
                      <Image
                        src="https://res.cloudinary.com/drwfe1mhk/image/upload/v1773218306/hemohive_profile/ayush_profile.jpg"
                        alt="Ayush Singh"
                        fill
                        className="object-cover opacity-90 mix-blend-screen mix-blend-luminosity grayscale hover:grayscale-0 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-sky-500/20 mix-blend-overlay"></div>
                    </div>

                    <div className="flex flex-col text-left justify-center">
                      <div className="text-xs font-mono text-sky-400/80 mb-0.5 tracking-wider">&lt; CREATOR /&gt;</div>
                      <div className="text-sm font-bold text-white tracking-wide">Ayush Singh</div>
                      <div className="text-xs text-sky-200/80 mt-1 font-medium italic min-h-[16px]">
                        {"Building the future of blood donation...".split('').map((char, i) => (
                          <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1, delay: i * 0.05 + 0.5 }}>{char}</motion.span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-sky-500/30 to-transparent my-1"></div>

                  {/* Option 2: System Diagnostics (Livable Hover Icons) */}
                  <div className="w-full text-left space-y-2.5 mt-2">
                    {/* Lines of Code */}
                    <div className="flex justify-between items-center text-[10px] font-mono text-sky-200/70 group/stat relative overflow-hidden h-4">
                      <div className="flex items-center">
                        <span className="absolute transition-all duration-300 transform translate-y-0 group-hover/stat:-translate-y-4 group-hover/stat:opacity-0 opacity-100">
                          LINES_OF_CODE:
                        </span>
                        <div className="absolute transition-all duration-300 transform translate-y-4 group-hover/stat:translate-y-0 opacity-0 group-hover/stat:opacity-100 flex items-center gap-2">
                          <motion.svg className="w-3.5 h-3.5 text-sky-400 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" animate={{ rotate: 360 }} transition={{ duration: 4, ease: "linear", repeat: Infinity }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </motion.svg>
                          <span className="text-sky-300">Code Output</span>
                        </div>
                      </div>
                      <span className="text-sky-400">1.2M+</span>
                    </div>

                    {/* Tea Consumed Variant (Horizontal Wipe) */}
                    <div className="flex justify-between items-center text-[10px] font-mono text-sky-200/70 relative h-4 w-full">
                      <div className="relative flex-1 h-full">

                        {/* Base Layer: Amber Tea Icon (Text removed to unify concept) */}
                        <div className="absolute inset-0 flex items-center gap-2 pointer-events-none">
                          <div className="relative pt-[2px]">
                            <svg className="w-3.5 h-3.5 text-amber-500 opacity-90 drop-shadow-[0_0_5px_rgba(245,158,11,0.6)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 8h-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2H2v4h2v6a2 2 0 002 2h8a2 2 0 002-2v-6h2v-4zm-4 0v4H6V8h10z" />
                            </svg>
                            {/* Animated Steam Parent: Opacity strictly synced to wipe opening */}
                            <motion.div
                              animate={{ opacity: [0, 0, 1, 1, 0] }}
                              transition={{ duration: 8, ease: "linear", repeat: Infinity, times: [0, 0.15, 0.2, 0.85, 1] }}
                            >
                              <motion.div className="absolute -top-[4px] left-1 w-[2px] h-1.5 bg-amber-400 rounded-full drop-shadow-[0_0_3px_rgba(251,191,36,0.8)]" animate={{ y: [0, -4, 0], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} />
                              <motion.div className="absolute -top-[6px] left-[7px] w-[2px] h-1.5 bg-amber-400 rounded-full drop-shadow-[0_0_3px_rgba(251,191,36,0.8)]" animate={{ y: [0, -5, 0], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} />
                            </motion.div>
                          </div>
                        </div>

                        {/* Top Layer: Cyan Text (Wipes away to reveal Tea) */}
                        <motion.div
                          animate={{ width: ["100%", "100%", "0%", "0%", "100%"] }}
                          transition={{ duration: 6, ease: "easeOut", repeat: Infinity, times: [0, 0.1, 0.25, 0.85, 1] }}
                          className="absolute inset-y-0 left-0 flex items-center overflow-hidden whitespace-nowrap bg-black/80"
                        >
                          TEA_CONSUMED:
                        </motion.div>

                      </div>
                      <span className="text-sky-400 relative z-10 pl-2 bg-black/80 shadow-[-10px_0_10px_rgba(0,0,0,0.8)]">{teaCount.toLocaleString()} CUPS</span>
                    </div>

                    {/* System Uptime */}
                    <div className="flex justify-between items-center text-[10px] font-mono text-sky-200/70 group/stat relative overflow-hidden h-4">
                      <div className="flex items-center">
                        <span className="absolute transition-all duration-300 transform translate-y-0 group-hover/stat:-translate-y-4 group-hover/stat:opacity-0 opacity-100">
                          SYSTEM_UPTIME:
                        </span>
                        <div className="absolute transition-all duration-300 transform translate-y-4 group-hover/stat:translate-y-0 opacity-0 group-hover/stat:opacity-100 flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 text-sky-400 opacity-80 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sky-300">Uptime</span>
                        </div>
                      </div>
                      <span className="text-sky-400 animate-pulse">99.99%</span>
                    </div>

                    {/* Network Status */}
                    <div className="flex justify-between items-center text-[10px] font-mono text-sky-200/70 pt-1 group/stat relative overflow-hidden h-4">
                      <div className="flex items-center">
                        <span className="absolute transition-all duration-300 transform translate-y-0 group-hover/stat:-translate-y-4 group-hover/stat:opacity-0 opacity-100">
                          NETWORK_STATUS:
                        </span>
                        <div className="absolute transition-all duration-300 transform translate-y-4 group-hover/stat:translate-y-0 opacity-0 group-hover/stat:opacity-100 flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 text-emerald-400 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span className="text-emerald-300">Status</span>
                        </div>
                      </div>
                      <span className="text-emerald-400 animate-pulse flex items-center gap-1.5 relative">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute -left-3 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span> SECURE
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* The Main Button */}
            <Link
              href="/developer"
              className="relative inline-flex items-center justify-center px-6 py-2.5 font-medium tracking-wide text-white transition-all duration-300 rounded-full bg-slate-900 border border-slate-700/50 hover:bg-slate-800 hover:border-sky-400 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(14,165,233,0.1)] hover:shadow-[0_0_25px_rgba(14,165,233,0.4)] overflow-hidden"
            >
              {/* Blue Moon Ambient Background Glow */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-tr from-cyan-500/0 via-sky-500/10 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>

              {/* Spinning/Moving Light Edge */}
              <span className="absolute -inset-[100%] animate-[spin_4s_linear_infinite] bg-gradient-to-r from-transparent via-sky-400/20 to-transparent group-hover:via-sky-400/50 transition-colors duration-500 pointer-events-none"></span>

              {/* Content Container */}
              <span className="relative z-10 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.8)]"></span>
                </span>

                {/* Option 2: Scrambled Text Terminal Effect */}
                <span className="text-slate-300 group-hover:text-white transition-colors duration-300 drop-shadow-sm group-hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] font-mono min-w-[150px]">
                  {scrambledText}
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
