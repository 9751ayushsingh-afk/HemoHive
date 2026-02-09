
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const letters = "H E M O H I V E".split(" ");

export default function CinematicNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-50">
      {/* subtle animated gradient + particles mimic */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#2b0b0b] to-[#1f1333] opacity-95" />
        {/* soft flow (CSS animated) */}
        <svg className="absolute -top-20 left-[-10%] w-[140%] opacity-20 animate-[float_18s_linear_infinite]" viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0%" stopColor="#ff6b6b" />
              <stop offset="50%" stopColor="#ffb86b" />
              <stop offset="100%" stopColor="#a06bff" />
            </linearGradient>
          </defs>
          <path d="M0 60 C150 0, 450 120, 600 60 L600 200 L0 200Z" fill="url(#g1)" />
        </svg>
      </div>

      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* Logo with staggered letters */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/5 shadow-md">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.08" />
              <path d="M6 12h12" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {}
            }}
            className="flex items-center select-none"
          >
            {letters.map((l, i) => (
              <motion.span
                key={i}
                initial={{ y: 12, opacity: 0, rotate: -6 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{ delay: 0.06 * i, type: "spring", stiffness: 220, damping: 18 }}
                className="text-white font-extrabold tracking-wider text-lg"
                aria-hidden
              >
                {l}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-6 text-white/85">
          {["Home", "Services", "Fleet", "Partners", "Contact"].map((item) => (
            <li key={item}>
              <a
                href={"#" + item.toLowerCase()}
                className="relative px-2 py-1 inline-block transition-all before:absolute before:left-0 before:bottom-0 before:h-[2px] before:w-0 before:bg-gradient-to-r before:from-pink-400 before:to-purple-400 hover:before:w-full"
              >
                {item}
              </a>
            </li>
          ))}
          <li>
            <motion.a
              whileHover={{ scale: 1.04, boxShadow: "0 8px 30px rgba(255,100,150,0.12)" }}
              whileTap={{ scale: 0.98 }}
              href="#book"
              className="ml-4 inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg"
            >
              Book Now
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="opacity-90">
                <path d="M5 12h14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12 5l7 7-7 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.a>
          </li>
        </ul>

        {/* Mobile toggle */}
        <div className="md:hidden">
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="p-2 rounded-md bg-white/6 backdrop-blur-sm border border-white/6"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d={open ? "M6 18L18 6M6 6l12 12" : "M4 7h16M4 12h16M4 17h16"} stroke="white" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden"
          >
            <div className="px-6 pb-8 space-y-4">
              {["Home", "Services", "Fleet", "Partners", "Contact"].map((item) => (
                <motion.a
                  key={item}
                  whileTap={{ scale: 0.98 }}
                  href={"#" + item.toLowerCase()}
                  onClick={() => setOpen(false)}
                  className="block text-white text-xl py-3 px-4 rounded-lg bg-black/30 backdrop-blur-sm"
                >
                  {item}
                </motion.a>
              ))}
              <motion.a
                whileHover={{ scale: 1.02 }}
                href="#book"
                className="block text-center text-white font-semibold py-3 px-4 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600"
              >
                Book Now
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
