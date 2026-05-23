"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
  }, []);
  return reduced;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    setMobile(window.innerWidth < 768);
  }, []);
  return mobile;
}

interface FallingFlower {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  rotate: number;
  type: number;
  color: string;
  centerColor: string;
}

const PALETTES = [
  { petal: "#D4A574", center: "#F4D4B0" },
  { petal: "#F4D4B0", center: "#D4A574" },
  { petal: "#c5a882", center: "#F4D4B0" },
  { petal: "#E8C4A0", center: "#c5a882" },
];

function createFlower(id: number): FallingFlower {
  const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
  return {
    id,
    x:           Math.random() * 100,
    size:        14 + Math.random() * 18,
    duration:    7 + Math.random() * 9,
    delay:       Math.random() * 6,
    rotate:      Math.random() * 540 - 270,
    type:        Math.floor(Math.random() * 3), // 0=5 pétales, 1=6 pétales, 2=daisy
    color:       palette.petal,
    centerColor: palette.center,
  };
}

/* 5 pétales arrondis */
function Flower5({ color, center }: { color: string; center: string }) {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse key={deg} cx="30" cy="30" rx="8" ry="16"
          fill={color} opacity="0.85"
          transform={`rotate(${deg} 30 30) translate(0 -8)`} />
      ))}
      <circle cx="30" cy="30" r="7" fill={center} />
    </svg>
  );
}

/* 6 pétales fins */
function Flower6({ color, center }: { color: string; center: string }) {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse key={deg} cx="30" cy="30" rx="6" ry="14"
          fill={color} opacity="0.9"
          transform={`rotate(${deg} 30 30) translate(0 -9)`} />
      ))}
      <circle cx="30" cy="30" r="6" fill={center} />
    </svg>
  );
}

/* Marguerite — pétales allongés fins */
function Daisy({ color, center }: { color: string; center: string }) {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg) => (
        <ellipse key={deg} cx="30" cy="30" rx="4" ry="13"
          fill={color} opacity="0.8"
          transform={`rotate(${deg} 30 30) translate(0 -10)`} />
      ))}
      <circle cx="30" cy="30" r="8" fill={center} />
    </svg>
  );
}

const FLOWER_COMPONENTS = [Flower5, Flower6, Daisy];

export default function ParallaxPetals({ count = 12 }: { count?: number }) {
  const [flowers, setFlowers] = useState<FallingFlower[]>([]);
  const reduced = useReducedMotion();
  const mobile  = useIsMobile();

  const effectiveCount = mobile ? Math.min(count, 5) : count;

  useEffect(() => {
    if (reduced) return;
    setFlowers(Array.from({ length: effectiveCount }, (_, i) => createFlower(i)));
  }, [effectiveCount, reduced]);

  if (flowers.length === 0 || reduced) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {flowers.map((f) => {
        const FlowerSvg = FLOWER_COMPONENTS[f.type];
        return (
          <motion.div
            key={f.id}
            className="absolute"
            style={{ left: `${f.x}%`, top: "-6%", width: f.size, height: f.size }}
            animate={{
              y:       ["0vh", "108vh"],
              x:       [0, 20, -15, 10, 0],
              rotate:  [0, f.rotate],
              opacity: [0, 0.75, 0.75, 0],
            }}
            transition={{
              duration: f.duration,
              delay:    f.delay,
              repeat:   Infinity,
              ease:     "linear",
            }}
          >
            <FlowerSvg color={f.color} center={f.centerColor} />
          </motion.div>
        );
      })}
    </div>
  );
}
