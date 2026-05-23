"use client";

import { motion, useScroll, useTransform } from "framer-motion";

function Leaf({ w = 240, h = 400, rotate = 0, flipX = false, opacity = 0.10 }) {
  const color = "#2D5016";
  return (
    <motion.div style={{ opacity }}>
      <svg
        viewBox="0 0 70 120"
        width={w}
        height={h}
        style={{
          display: "block",
          transform: `scaleX(${flipX ? -1 : 1}) rotate(${rotate}deg)`,
        }}
      >
        <path
          d="M35 115 C10 88 2 58 5 32 C8 10 20 2 35 2 C50 2 62 10 65 32 C68 58 60 88 35 115Z"
          fill={color}
        />
        <line
          x1="35" y1="115" x2="35" y2="2"
          stroke="white" strokeWidth="0.8" opacity="0.18" strokeLinecap="round"
        />
        <path
          d="M35 72 L18 58 M35 90 L52 76 M35 54 L20 43 M35 36 L46 28"
          stroke="white" strokeWidth="0.5" fill="none" opacity="0.10"
        />
      </svg>
    </motion.div>
  );
}

export default function BotanicalLayers() {
  const { scrollY } = useScroll();

  /* Two leaves, two slightly different speeds — creates depth */
  const y1 = useTransform(scrollY, [0, 5000], [0, 130]); /* slower = feels further */
  const y2 = useTransform(scrollY, [0, 5000], [0, 90]);  /* slightly faster = feels closer */

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1 }}
    >
      {/* Top-left — grande feuille de fond */}
      <motion.div
        className="absolute"
        style={{ top: -80, left: -60, y: y1 }}
      >
        <Leaf w={260} h={430} rotate={28} opacity={0.28} />
      </motion.div>

      {/* Bottom-right — feuille plus petite, vitesse différente */}
      <motion.div
        className="absolute"
        style={{ bottom: -100, right: -70, y: y2 }}
      >
        <Leaf w={210} h={350} rotate={-22} flipX opacity={0.22} />
      </motion.div>
    </div>
  );
}
