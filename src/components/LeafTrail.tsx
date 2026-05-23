"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

function LeafSvg({ size, color }: { size: number; color: string }) {
  return (
    <svg viewBox="0 0 50 80" width={size} height={size * 1.6} style={{ display: "block" }}>
      <path d="M25 76 C8 58 2 40 4 22 C6 8 15 2 25 2 C35 2 44 8 46 22 C48 40 42 58 25 76Z" fill={color} />
      <line x1="25" y1="76" x2="25" y2="2" stroke="white" strokeWidth="0.6" opacity="0.2" strokeLinecap="round" />
    </svg>
  );
}

function PetalSvg({ size, color }: { size: number; color: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} style={{ display: "block" }}>
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse key={deg} cx="20" cy="20" rx="4.5" ry="10"
          fill={color} opacity="0.8"
          transform={`rotate(${deg} 20 20)`} />
      ))}
      <circle cx="20" cy="20" r="4" fill={color} />
    </svg>
  );
}

interface BladeProps {
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  startProg: number;
  endProg: number;
  topPct: string;
  size: number;
  color: string;
  rotStart: number;
  rotEnd: number;
  type: "leaf" | "petal";
}

function Blade({ scrollYProgress, startProg, endProg, topPct, size, color, rotStart, rotEnd, type }: BladeProps) {
  /* Travel well beyond viewport on both sides so clip is clean */
  const x       = useTransform(scrollYProgress, [startProg, endProg], [-240, 1920]);
  const rotate  = useTransform(scrollYProgress, [startProg, endProg], [rotStart, rotEnd]);
  const opacity = useTransform(
    scrollYProgress,
    [startProg, startProg + 0.05, endProg - 0.05, endProg],
    [0, 1, 1, 0]
  );

  return (
    <motion.div
      style={{
        position: "absolute",
        top: topPct,
        left: 0,
        x,
        rotate,
        opacity,
      }}
    >
      {type === "leaf" ? <LeafSvg size={size} color={color} /> : <PetalSvg size={size} color={color} />}
    </motion.div>
  );
}

const BLADES: Omit<BladeProps, "scrollYProgress">[] = [
  { startProg: 0.00, endProg: 0.55, topPct: "12%",  size: 32, color: "#2D5016", rotStart: -18, rotEnd: 24,  type: "leaf"  },
  { startProg: 0.04, endProg: 0.59, topPct: "30%",  size: 42, color: "#3a6420", rotStart:  12, rotEnd: -15, type: "leaf"  },
  { startProg: 0.08, endProg: 0.63, topPct: "52%",  size: 26, color: "#2D5016", rotStart: -30, rotEnd: 20,  type: "leaf"  },
  { startProg: 0.12, endProg: 0.67, topPct: "68%",  size: 38, color: "#4a7a2a", rotStart:  8,  rotEnd: -22, type: "leaf"  },
  { startProg: 0.02, endProg: 0.57, topPct: "20%",  size: 28, color: "#D4A574", rotStart: 45,  rotEnd: 180, type: "petal" },
  { startProg: 0.06, endProg: 0.61, topPct: "42%",  size: 22, color: "#c89660", rotStart: 0,   rotEnd: 135, type: "petal" },
  { startProg: 0.10, endProg: 0.65, topPct: "60%",  size: 34, color: "#2D5016", rotStart: -10, rotEnd: 30,  type: "leaf"  },
  { startProg: 0.14, endProg: 0.69, topPct: "80%",  size: 24, color: "#D4A574", rotStart: 90,  rotEnd: 225, type: "petal" },
  { startProg: 0.03, endProg: 0.58, topPct: "5%",   size: 46, color: "#1e3b0e", rotStart: 20,  rotEnd: -12, type: "leaf"  },
  { startProg: 0.16, endProg: 0.71, topPct: "88%",  size: 30, color: "#3a6420", rotStart: -25, rotEnd: 18,  type: "leaf"  },
];

export default function LeafTrail() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: "relative",
        height: 160,
        overflow: "hidden",
        background: "linear-gradient(180deg, #FAFAF8 0%, #f0f5ec 50%, #FAFAF8 100%)",
        zIndex: 1,
      }}
    >
      {BLADES.map((b, i) => (
        <Blade key={i} scrollYProgress={scrollYProgress} {...b} />
      ))}
    </div>
  );
}
