"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface GrowingStemProps {
  side?: "left" | "right";
  color?: string;
  height?: number;
  delay?: number;
  opacity?: number;
}

export default function GrowingStem({
  side = "left",
  color = "#2D5016",
  height = 280,
  delay = 0,
  opacity = 1,
}: GrowingStemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const flip = side === "right";
  const w = 70;
  const h = height;

  const stemD    = `M35 ${h} C33 ${h * 0.76} 24 ${h * 0.58} 28 ${h * 0.40} C33 ${h * 0.24} 42 ${h * 0.14} 35 2`;
  const branch1D = `M28 ${h * 0.62} C14 ${h * 0.54} 4 ${h * 0.46} -2 ${h * 0.36}`;
  const branch2D = `M33 ${h * 0.33} C48 ${h * 0.24} 58 ${h * 0.16} 66 ${h * 0.06}`;
  const leaf1    = `M-2 ${h * 0.36} C-12 ${h * 0.28} -14 ${h * 0.18} -4 ${h * 0.16} C4 ${h * 0.15} 8 ${h * 0.26} -2 ${h * 0.36}Z`;
  const leaf2    = `M66 ${h * 0.06} C74 -0.02 76 ${-h * 0.06} 67 ${-h * 0.07} C60 ${-h * 0.07} 58 0.02 66 ${h * 0.06}Z`;

  return (
    <div ref={ref} style={{ width: w, height: h, opacity }}>
      <svg
        viewBox={`-16 ${-h * 0.1} ${w + 32} ${h * 1.2}`}
        width={w}
        height={h}
        style={{
          display: "block",
          transform: `scaleX(${flip ? -1 : 1})`,
          transformOrigin: "50% 100%",
          overflow: "visible",
        }}
      >
        {/* Main stem */}
        <motion.path
          d={stemD}
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: inView ? 1 : 0 }}
          transition={{ duration: 1.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
        />

        {/* Branch 1 — lower */}
        <motion.path
          d={branch1D}
          stroke={color}
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: inView ? 1 : 0 }}
          transition={{ duration: 0.9, delay: delay + 0.8, ease: "easeOut" }}
        />

        {/* Leaf at branch 1 tip */}
        <motion.path
          d={leaf1}
          fill={color}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: inView ? 0.8 : 0, scale: inView ? 1 : 0 }}
          style={{ transformOrigin: `-2px ${h * 0.36}px` }}
          transition={{ duration: 0.4, delay: delay + 1.55, ease: "backOut" }}
        />

        {/* Branch 2 — upper */}
        <motion.path
          d={branch2D}
          stroke={color}
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: inView ? 1 : 0 }}
          transition={{ duration: 0.8, delay: delay + 1.1, ease: "easeOut" }}
        />

        {/* Leaf at branch 2 tip */}
        <motion.path
          d={leaf2}
          fill={color}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: inView ? 0.7 : 0, scale: inView ? 1 : 0 }}
          style={{ transformOrigin: `66px ${h * 0.06}px` }}
          transition={{ duration: 0.4, delay: delay + 1.8, ease: "backOut" }}
        />
      </svg>
    </div>
  );
}
