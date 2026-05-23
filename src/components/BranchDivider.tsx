"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

/* Main branch path — spans viewBox 0 0 1200 160, flows as an organic horizontal arc */
const BRANCH = "M0 120 C120 95 240 140 420 105 C600 70 720 130 900 90 C1020 65 1120 82 1200 72";

/* Leaf stems + blades at 5 natural junctions along the branch */
const LEAVES = [
  {
    stem:  "M175 112 L162 84",
    blade: "M162 84 C155 66 163 50 170 58 C177 66 170 80 162 84Z",
    delay: 0.55,
  },
  {
    stem:  "M390 108 L402 80",
    blade: "M402 80 C409 62 420 65 416 78 C412 90 402 92 402 80Z",
    delay: 0.80,
  },
  {
    stem:  "M610 95 L600 66",
    blade: "M600 66 C593 48 601 33 608 41 C615 49 607 62 600 66Z",
    delay: 1.00,
  },
  {
    stem:  "M820 88 L832 60",
    blade: "M832 60 C839 42 851 46 846 58 C841 70 832 72 832 60Z",
    delay: 1.20,
  },
  {
    stem:  "M1040 84 L1030 55",
    blade: "M1030 55 C1023 37 1031 22 1038 30 C1045 38 1037 51 1030 55Z",
    delay: 1.40,
  },
] as const;

export default function BranchDivider() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  /* Subtle vertical parallax on the whole band */
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bandY = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

  const color = "#2D5016";
  const op    = 0.20;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{ position: "relative", height: 180, overflow: "hidden", zIndex: 2, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", backgroundColor: "rgba(250,250,248,0.80)" }}
    >
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          y: bandY,
          display: "flex",
          alignItems: "center",
        }}
      >
        <svg
          viewBox="0 0 1200 160"
          preserveAspectRatio="xMidYMid meet"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          {/* Main branch */}
          <motion.path
            d={BRANCH}
            stroke={color}
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
            opacity={op}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: inView ? 1 : 0 }}
            transition={{ duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }}
          />

          {/* Leaves */}
          {LEAVES.map((l, i) => (
            <g key={i}>
              {/* Stem */}
              <motion.path
                d={l.stem}
                stroke={color}
                strokeWidth="1"
                fill="none"
                strokeLinecap="round"
                opacity={op}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: inView ? 1 : 0 }}
                transition={{ duration: 0.35, delay: l.delay, ease: "easeOut" }}
              />
              {/* Blade */}
              <motion.path
                d={l.blade}
                fill={color}
                opacity={0}
                animate={{ opacity: inView ? op * 1.4 : 0 }}
                transition={{ duration: 0.4, delay: l.delay + 0.3, ease: "easeOut" }}
              />
            </g>
          ))}
        </svg>
      </motion.div>
    </div>
  );
}
