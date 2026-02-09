
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

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
    <div className="w-full flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-red-400 text-3xl font-accent font-semibold">Blood Compatibility Visualizer</h3>
            <p className="text-gray-200 text-sm">Hover a group to see who it can donate to and receive from. Toggle modes for focused views.</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="text-xs text-gray-300 mr-2">Mode</div>
            <div className="bg-zinc-900 rounded-full p-1 flex items-center gap-1">
              <button
                className={`px-3 py-1 rounded-full text-sm ${mode === "both" ? "bg-red-600 text-white" : "text-gray-300"}`}
                onClick={() => setMode("both")}
              >
                Both
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm ${mode === "donate" ? "bg-red-600 text-white" : "text-gray-300"}`}
                onClick={() => setMode("donate")}
              >
                Donate
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm ${mode === "receive" ? "bg-red-600 text-white" : "text-gray-300"}`}
                onClick={() => setMode("receive")}
              >
                Receive
              </button>
            </div>
          </div>
        </div>

        <div className="relative bg-black rounded-2xl shadow-xl p-4">
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

            {/* center decorative pulse / logo placeholder */}
            <g transform={`translate(${cx}, ${cy})`}>
              <circle r={60} fill="rgba(255,10,10,0.04)" />
              <circle r={40} fill="rgba(255,10,10,0.02)" />
              <text x={0} y={6} textAnchor="middle" style={{ fontSize: 16, fill: "#ffdddd" }}>
                HemoHive
              </text>
            </g>
          </svg>

          {/* tooltip overlay (HTML) */}
          {tooltip.visible && (
            <div
              className="absolute pointer-events-none bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 rounded-md px-3 py-2 text-xs text-white shadow-lg"
              style={{ left: tooltip.x, top: tooltip.y, transform: "translate(6px, -6px)", minWidth: 120 }}
            >
              <div className="font-medium">{tooltip.text}</div>
              <div className="text-gray-300 text-[11px] mt-1">
                Donates to: <span className="text-sm">{(COMPATIBILITY[tooltip.text as BloodType] || []).join(", ")}</span>
              </div>
              <div className="text-gray-300 text-[11px] mt-0.5">
                Receives from: <span className="text-sm">{(RECEIVERS[tooltip.text as BloodType] || []).join(", ")}</span>
              </div>
            </div>
          )}

          {/* small legend */}
          <div className="absolute right-4 bottom-4 flex flex-col items-end gap-2 text-xs text-gray-300">
            <div className="px-3 py-2 bg-zinc-900/70 rounded-md border border-zinc-700">
              <div><strong className="text-white">Tips</strong></div>
              <div className="text-[12px]">Hover a blood group to reveal connections. Use mode to focus.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
