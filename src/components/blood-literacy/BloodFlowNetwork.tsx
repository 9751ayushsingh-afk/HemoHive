import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { motion } from "framer-motion";

/*
BloodFlowNetwork.jsx
- React component (single-file) implementing an interactive blood compatibility visualizer
- Uses SVG for nodes + curved connection paths and GSAP for animations.
- Tailwind-friendly classes included; assumes Tailwind CSS is available in the project.

How it works (quick):
- Nodes are arranged in a circle.
- Each blood group entry defines who it can donate to and receive from (derived automatically here).
- Hovering a node highlights outgoing (donate) paths and incoming (receive) paths with animated pulses.
- Toggle button switches the persistent view between "Donate" or "Receive" modes (hover still works).
- Tooltip shows group details.

Dependencies: gsap
Install: npm install gsap

Drop this component into any Next.js/React page and import: 
import BloodFlowNetwork from "./BloodFlowNetwork";

Customize: colors, node positions, theme or convert to Three.js for 3D effects.
*/

type BloodType = "O-" | "O+" | "A-" | "A+" | "B-" | "B+" | "AB-" | "AB+";

const BLOOD_TYPES: BloodType[] = [
  "O-",
  "O+",
  "A-",
  "A+",
  "B-",
  "B+",
  "AB-",
  "AB+",
];

// Compatibility map (donation targets)
// Source -> array of recipients
const COMPATIBILITY: Record<BloodType, BloodType[]> = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], // universal donor
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"], // universal recipient
};

// We also compute reverse mapping for receiving
const RECEIVERS: Record<BloodType, BloodType[]> = (() => {
  const map: Record<string, BloodType[]> = {};
  BLOOD_TYPES.forEach((t) => (map[t] = []));
  for (const src of Object.keys(COMPATIBILITY) as BloodType[]) {
    for (const tgt of COMPATIBILITY[src]) {
      map[tgt].push(src);
    }
  }
  return map as Record<BloodType, BloodType[]>;
})();

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function buildCurvePath(x1: number, y1: number, x2: number, y2: number, curvature = 0.5) {
  // Quadratic Bezier control point placed perpendicular to midpoint
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  // perpendicular vector
  const nx = -dy;
  const ny = dx;
  const cpX = mx + nx * curvature * 0.15;
  const cpY = my + ny * curvature * 0.15;
  return `M ${x1} ${y1} Q ${cpX} ${cpY} ${x2} ${y2}`;
}

interface Edge {
  from: BloodType;
  to: BloodType;
  id: string;
  curve: string;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  text: string;
}

export default function BloodFlowNetwork({ size = 720 }: { size?: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRefs = useRef<Record<string, SVGGElement | null>>({});
  const pathRefs = useRef<Record<string, SVGPathElement | null>>({});
  const pulseRefs = useRef<Record<string, SVGCircleElement | null>>({});
  const [hovered, setHovered] = useState<BloodType | null>(null);
  const [mode, setMode] = useState<"donate" | "receive" | "both">("both"); // donate | receive | both
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, text: "" });

  // layout: circle
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;

  // compute node positions
  const nodes = BLOOD_TYPES.map((type, i) => {
    const angle = (360 / BLOOD_TYPES.length) * i;
    const pos = polarToCartesian(cx, cy, radius, angle);
    return { id: type, angle, x: pos.x, y: pos.y };
  });

  // build list of edges
  const edges: Edge[] = [];
  nodes.forEach((n) => {
    const targets = COMPATIBILITY[n.id] || [];
    targets.forEach((t) => {
      const tgtNode = nodes.find((x) => x.id === t);
      if (tgtNode) {
        edges.push({ from: n.id, to: t, id: `${n.id}->${t}`, curve: buildCurvePath(n.x, n.y, tgtNode.x, tgtNode.y, 0.7) });
      }
    });
  });

  useEffect(() => {
    // initial gentle glowing animation for nodes
    const tl = gsap.timeline();
    nodes.forEach((n, idx) => {
      const nodeEl = groupRefs.current[n.id];
      if (!nodeEl) return;
      tl.fromTo(
        nodeEl.querySelector("circle"),
        { attr: { r: 20 }, opacity: 0.9 },
        { attr: { r: 22 }, repeat: -1, yoyo: true, duration: 1.6, ease: "sine.inOut", delay: idx * 0.06 },
        0
      );
    });

    // prepare path stroke-dash animations (hidden initially)
    edges.forEach((e) => {
      const p = pathRefs.current[e.id];
      const pulse = pulseRefs.current[e.id];
      if (!p || !pulse) return;
      const total = p.getTotalLength();
      p.style.strokeDasharray = `${total}`;
      p.style.strokeDashoffset = `${total}`;

      // small, infinite pulse for visibility
      gsap.to(p, { strokeDashoffset: 0, duration: 6 + Math.random() * 3, repeat: -1, ease: "none" });
      // pulse element scale animation
      gsap.to(pulse, { attr: { r: 6 }, repeat: -1, yoyo: true, duration: 1.1 + Math.random() * 0.8, ease: "sine.inOut" });
    });

    return () => {
      tl.kill();
      gsap.globalTimeline.clear();
    };
  }, []);

  useEffect(() => {
    // highlight logic when hovered or mode toggled
    edges.forEach((e) => {
      const p = pathRefs.current[e.id];
      const pulse = pulseRefs.current[e.id];
      if (!p || !pulse) return;
      const fromMatches = hovered ? e.from === hovered : false;
      const toMatches = hovered ? e.to === hovered : false;

      // default state
      gsap.to(p, { opacity: 0.18, strokeWidth: 2, duration: 0.25 });
      gsap.to(pulse, { opacity: 0.0, duration: 0.25 });

      // show depending on mode
      if (mode === "donate") {
        if (fromMatches) {
          gsap.to(p, { opacity: 1, strokeWidth: 4, duration: 0.25 });
          gsap.to(pulse, { opacity: 1, duration: 0.25 });
        }
      } else if (mode === "receive") {
        if (toMatches) {
          gsap.to(p, { opacity: 1, strokeWidth: 4, duration: 0.25 });
          gsap.to(pulse, { opacity: 1, duration: 0.25 });
        }
      } else {
        // both
        if (fromMatches || toMatches) {
          gsap.to(p, { opacity: 1, strokeWidth: 4, duration: 0.25 });
          gsap.to(pulse, { opacity: 1, duration: 0.25 });
        }
      }
    });

    // highlight nodes
    nodes.forEach((n) => {
      const el = groupRefs.current[n.id];
      if (!el) return;
      const circle = el.querySelector("circle");
      const label = el.querySelector("text");

      if (!hovered) {
        gsap.to(circle, { filter: "drop-shadow(0 0 10px rgba(255,0,0,0.12))", duration: 0.2 });
        gsap.to(label, { opacity: 0.95, duration: 0.2 });
        return;
      }

      if (mode === "donate") {
        // highlight donors (from hovered) -> recipients
        if (n.id === hovered) {
          gsap.to(circle, { attr: { r: 26 }, duration: 0.2 });
          gsap.to(label, { fontSize: 14, opacity: 1, duration: 0.2 });
        } else if (COMPATIBILITY[hovered].includes(n.id)) {
          gsap.to(circle, { attr: { r: 22 }, duration: 0.2 });
          gsap.to(label, { opacity: 1, duration: 0.2 });
        } else {
          gsap.to(circle, { attr: { r: 18 }, opacity: 0.6, duration: 0.2 });
          gsap.to(label, { opacity: 0.5, duration: 0.2 });
        }
      } else if (mode === "receive") {
        if (n.id === hovered) {
          gsap.to(circle, { attr: { r: 26 }, duration: 0.2 });
          gsap.to(label, { fontSize: 14, opacity: 1, duration: 0.2 });
        } else if (RECEIVERS[hovered].includes(n.id)) {
          gsap.to(circle, { attr: { r: 22 }, duration: 0.2 });
          gsap.to(label, { opacity: 1, duration: 0.2 });
        } else {
          gsap.to(circle, { attr: { r: 18 }, opacity: 0.6, duration: 0.2 });
          gsap.to(label, { opacity: 0.5, duration: 0.2 });
        }
      } else {
        // both mode
        if (n.id === hovered) {
          gsap.to(circle, { attr: { r: 28 }, duration: 0.2 });
          gsap.to(label, { fontSize: 15, opacity: 1, duration: 0.2 });
        } else if (COMPATIBILITY[hovered].includes(n.id) || RECEIVERS[hovered].includes(n.id)) {
          gsap.to(circle, { attr: { r: 22 }, duration: 0.2 });
          gsap.to(label, { opacity: 1, duration: 0.2 });
        } else {
          gsap.to(circle, { attr: { r: 18 }, opacity: 0.55, duration: 0.2 });
          gsap.to(label, { opacity: 0.45, duration: 0.2 });
        }
      }
    });
  }, [hovered, mode]);

  const onNodeEnter = (evt: React.MouseEvent, id: BloodType) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setHovered(id);
    setTooltip({ visible: true, x: evt.clientX - rect.left + 12, y: evt.clientY - rect.top + 12, text: id });
  };
  const onNodeMove = (evt: React.MouseEvent) => {
    if (!tooltip.visible || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setTooltip((t) => ({ ...t, x: evt.clientX - rect.left + 12, y: evt.clientY - rect.top + 12 }));
  };
  const onNodeLeave = () => {
    setHovered(null);
    setTooltip({ visible: false, x: 0, y: 0, text: "" });
  };

  return (
    <div className="w-full flex flex-col items-center p-6 md:p-12 relative min-h-[85vh]">
      {/* Header Section */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 z-20">
        <div className="max-w-xl">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold font-['Outfit'] bg-clip-text text-transparent bg-gradient-to-r from-[#FF1E1E] via-[#FF4D4D] to-[#FF8C00] tracking-tight mb-2 shadow-sm drop-shadow-[0_0_15px_rgba(255,30,30,0.5)]"
          >
            Blood Compatibility Visualizer
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-sm md:text-base font-medium"
          >
            Hover a group to see who it can donate to and receive from. Toggle modes for focused views.
          </motion.p>
        </div>

        {/* Enhanced Toggle Buttons */}
        <div className="pointer-events-auto bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-full p-1.5 flex items-center gap-1 shadow-[0_0_40px_rgba(255,0,0,0.15)] relative">
          {(["both", "donate", "receive"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`relative px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-colors duration-300 z-10 ${mode === m ? "text-white" : "text-gray-400 hover:text-white"
                }`}
            >
              {mode === m && (
                <motion.div
                  layoutId="activeModeBubble"
                  className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-900 rounded-full -z-10"
                  style={{
                    boxShadow: "0 0 20px rgba(220, 38, 38, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2)"
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 30,
                    mass: 0.8
                  }}
                />
              )}
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-4xl relative">
        <div className="relative bg-transparent rounded-2xl w-full flex justify-center items-center">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${size} ${size}`}
            className="w-full h-auto block"
            onMouseMove={onNodeMove}
            style={{ background: "radial-gradient(circle at 20% 20%, rgba(255,0,0,0.02), transparent 10%), radial-gradient(circle at 80% 80%, rgba(255,0,0,0.02), transparent 10%)" }}
          >
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="redGradient" x1="0%" x2="100%">
                <stop offset="0%" stopColor="#ff5a5a" />
                <stop offset="100%" stopColor="#ff1a1a" />
              </linearGradient>
            </defs>

            {/* connection paths */}
            <g>
              {edges.map((e) => (
                <g key={e.id}>
                  <path
                    d={e.curve}
                    ref={(el) => { pathRefs.current[e.id] = el; }}
                    stroke="url(#redGradient)"
                    strokeWidth={2}
                    fill="none"
                    strokeLinecap="round"
                    opacity={0.18}
                    style={{ filter: "drop-shadow(0 0 6px rgba(255,20,20,0.08))" }}
                  />

                  {/* moving pulse marker use small circle placed on path using <path> + getPointAtLength in animation if needed. We add a static circle that is animated by GSAP by changing its 'cx' and 'cy' attributes in timeline. */}
                  <circle ref={(el) => { pulseRefs.current[e.id] = el; }} r={0} cx={0} cy={0} opacity={0} />
                </g>
              ))}
            </g>

            {/* nodes */}
            <g>
              {nodes.map((n) => (
                <g
                  key={n.id}
                  ref={(el) => { groupRefs.current[n.id] = el; }}
                  transform={`translate(${n.x}, ${n.y})`}
                  className="cursor-pointer"
                  onMouseEnter={(e) => onNodeEnter(e, n.id)}
                  onMouseLeave={onNodeLeave}
                >
                  <circle r={20} fill="#2b0202" stroke="#ff2b2b" strokeWidth={2} />
                  <circle r={8} fill="#ff5a5a" transform="translate(0, -2)" style={{ filter: "drop-shadow(0 0 6px rgba(255,0,red,0.25))" }} />
                  <text
                    x={0}
                    y={48}
                    textAnchor="middle"
                    className="select-none"
                    style={{ fontSize: 13, fill: "#fff", opacity: 0.95 }}
                  >
                    {n.id}
                  </text>
                </g>
              ))}
            </g>

            {/* Center animated HemoHive text */}
            <g transform={`translate(${cx}, ${cy})`}>
              {/* Outer soft glowing rings */}
              <circle r={75} fill="rgba(255,30,30,0.02)" className="animate-pulse" style={{ animationDuration: '4s' }} pointerEvents="none" />
              <circle r={55} fill="rgba(255,30,30,0.03)" className="animate-pulse" style={{ animationDuration: '3s' }} pointerEvents="none" />
              
              <text 
                x={0} 
                y={6} 
                textAnchor="middle" 
                className="font-['Outfit'] font-bold tracking-[0.25em] select-none"
                style={{ 
                  fontSize: 16, 
                  fill: "#ffffff", 
                  opacity: 0.9, 
                  filter: "drop-shadow(0 0 12px rgba(255,30,30,0.6)) drop-shadow(0 0 4px rgba(255,255,255,0.4))" 
                }}
              >
                HEMOHIVE
              </text>
            </g>
          </svg>

          {/* tooltip overlay (HTML) with deep glassmorphism */}
          {tooltip.visible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute pointer-events-none z-50 rounded-xl border border-white/10 text-white shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden"
              style={{
                left: tooltip.x,
                top: tooltip.y,
                transform: "translate(12px, -12px)",
                minWidth: 200,
                background: 'linear-gradient(135deg, rgba(20,20,24,0.95) 0%, rgba(10,10,12,0.98) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)'
              }}
            >
              <div className="border-b border-white/5 bg-white/5 px-4 py-3 flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse"></div>
                <span className="font-bold text-lg font-['Outfit'] tracking-wide">{tooltip.text}</span>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1.5 font-semibold">Provides Life To</div>
                  <div className="text-sm font-medium text-gray-200 flex items-center flex-wrap gap-1">
                    <span className="text-red-500 mr-1.5">→</span>
                    {(COMPATIBILITY[tooltip.text as BloodType] || []).map(bt => (
                      <span key={bt} className="bg-red-500/10 text-red-200 px-1.5 py-0.5 rounded text-xs border border-red-500/20">{bt}</span>
                    ))}
                  </div>
                </div>
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1.5 font-semibold">Receives Life From</div>
                  <div className="text-sm font-medium text-gray-200 flex items-center flex-wrap gap-1">
                    <span className="text-blue-400 mr-1.5">←</span>
                    {(RECEIVERS[tooltip.text as BloodType] || []).map(bt => (
                      <span key={bt} className="bg-blue-500/10 text-blue-200 px-1.5 py-0.5 rounded text-xs border border-blue-500/20">{bt}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}


        </div>
      </div>
    </div>
  );
}
