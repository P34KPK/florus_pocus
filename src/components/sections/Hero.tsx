"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import type { Page } from "@/types";

interface HeroProps {
  page?: Page | null;
}

const OPEN_T  = { type: "spring", stiffness: 38, damping: 18, mass: 1.4 } as const;
const CLOSE_T = { duration: 1.6, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] };

/*
 * Poudre magique — part des bords des rideaux (gauche et droite)
 * sx/sy = position de départ (bord du rideau), tx/ty = destination finale
 * s = taille, c = couleur, d = délai, t = durée
 */
const PARTICLES = [
  /* ── GAUCHE — part du bord droit du rideau gauche, dérive vers la gauche/haut ── */
  { id:  0, sx: -185, sy: -120, tx: -320, ty: -210, s: 2, c: "#ffffff", d: 0.00, t: 3.2 },
  { id:  1, sx: -210, sy:  -60, tx: -420, ty: -170, s: 1, c: "#F4D4B0", d: 0.06, t: 3.6 },
  { id:  2, sx: -195, sy:   20, tx: -390, ty: -130, s: 2, c: "#ffffff", d: 0.12, t: 3.4 },
  { id:  3, sx: -225, sy:   90, tx: -460, ty:  -80, s: 1, c: "#D4A574", d: 0.20, t: 3.8 },
  { id:  4, sx: -180, sy:  160, tx: -350, ty:  -40, s: 2, c: "#F4D4B0", d: 0.30, t: 3.3 },
  { id:  5, sx: -240, sy: -180, tx: -500, ty: -260, s: 1, c: "#ffffff", d: 0.04, t: 4.0 },
  { id:  6, sx: -200, sy:  -30, tx: -440, ty: -150, s: 2, c: "#F4D4B0", d: 0.16, t: 3.5 },
  { id:  7, sx: -215, sy:  120, tx: -410, ty:  -60, s: 1, c: "#ffffff", d: 0.26, t: 3.7 },
  { id:  8, sx: -190, sy:  200, tx: -370, ty:   20, s: 2, c: "#D4A574", d: 0.38, t: 3.2 },
  { id:  9, sx: -230, sy: -100, tx: -480, ty: -220, s: 1, c: "#F4D4B0", d: 0.08, t: 4.1 },
  { id: 10, sx: -205, sy:   50, tx: -360, ty: -100, s: 2, c: "#ffffff", d: 0.22, t: 3.3 },
  { id: 11, sx: -220, sy:  170, tx: -450, ty:  -30, s: 1, c: "#F4D4B0", d: 0.34, t: 3.9 },
  { id: 12, sx: -250, sy: -150, tx: -520, ty: -280, s: 2, c: "#ffffff", d: 0.02, t: 4.2 },
  { id: 13, sx: -185, sy:  -80, tx: -395, ty: -160, s: 1, c: "#D4A574", d: 0.14, t: 3.5 },
  { id: 14, sx: -235, sy:   70, tx: -470, ty:  -90, s: 2, c: "#ffffff", d: 0.24, t: 3.8 },
  { id: 15, sx: -200, sy:  240, tx: -340, ty:   50, s: 1, c: "#F4D4B0", d: 0.44, t: 3.1 },
  { id: 16, sx: -255, sy: -200, tx: -540, ty: -300, s: 1, c: "#ffffff", d: 0.01, t: 4.3 },
  { id: 17, sx: -190, sy:  -10, tx: -380, ty: -120, s: 2, c: "#F4D4B0", d: 0.18, t: 3.4 },
  { id: 18, sx: -225, sy:  140, tx: -430, ty:  -50, s: 1, c: "#ffffff", d: 0.32, t: 3.7 },
  { id: 19, sx: -215, sy:  -40, tx: -455, ty: -185, s: 2, c: "#D4A574", d: 0.10, t: 3.6 },
  { id: 20, sx: -240, sy:  100, tx: -500, ty:  -70, s: 1, c: "#F4D4B0", d: 0.28, t: 4.0 },
  { id: 21, sx: -195, sy:  280, tx: -330, ty:   80, s: 2, c: "#ffffff", d: 0.50, t: 3.0 },
  { id: 22, sx: -260, sy: -240, tx: -560, ty: -330, s: 1, c: "#F4D4B0", d: 0.05, t: 4.4 },
  { id: 23, sx: -210, sy:   30, tx: -410, ty: -110, s: 2, c: "#ffffff", d: 0.20, t: 3.5 },
  { id: 24, sx: -230, sy:  210, tx: -470, ty:   10, s: 1, c: "#D4A574", d: 0.40, t: 3.8 },
  { id: 25, sx: -175, sy: -160, tx: -295, ty: -240, s: 2, c: "#ffffff", d: 0.07, t: 3.3 },
  { id: 26, sx: -245, sy:  -70, tx: -490, ty: -200, s: 1, c: "#F4D4B0", d: 0.15, t: 4.1 },
  { id: 27, sx: -200, sy:  175, tx: -360, ty:  -15, s: 2, c: "#ffffff", d: 0.36, t: 3.4 },
  { id: 28, sx: -220, sy: -130, tx: -440, ty: -250, s: 1, c: "#D4A574", d: 0.09, t: 3.9 },
  { id: 29, sx: -185, sy:  310, tx: -310, ty:  110, s: 2, c: "#F4D4B0", d: 0.55, t: 3.1 },

  /* ── DROITE — miroir exact ── */
  { id: 30, sx:  185, sy: -120, tx:  320, ty: -210, s: 2, c: "#ffffff", d: 0.00, t: 3.2 },
  { id: 31, sx:  210, sy:  -60, tx:  420, ty: -170, s: 1, c: "#F4D4B0", d: 0.06, t: 3.6 },
  { id: 32, sx:  195, sy:   20, tx:  390, ty: -130, s: 2, c: "#ffffff", d: 0.12, t: 3.4 },
  { id: 33, sx:  225, sy:   90, tx:  460, ty:  -80, s: 1, c: "#D4A574", d: 0.20, t: 3.8 },
  { id: 34, sx:  180, sy:  160, tx:  350, ty:  -40, s: 2, c: "#F4D4B0", d: 0.30, t: 3.3 },
  { id: 35, sx:  240, sy: -180, tx:  500, ty: -260, s: 1, c: "#ffffff", d: 0.04, t: 4.0 },
  { id: 36, sx:  200, sy:  -30, tx:  440, ty: -150, s: 2, c: "#F4D4B0", d: 0.16, t: 3.5 },
  { id: 37, sx:  215, sy:  120, tx:  410, ty:  -60, s: 1, c: "#ffffff", d: 0.26, t: 3.7 },
  { id: 38, sx:  190, sy:  200, tx:  370, ty:   20, s: 2, c: "#D4A574", d: 0.38, t: 3.2 },
  { id: 39, sx:  230, sy: -100, tx:  480, ty: -220, s: 1, c: "#F4D4B0", d: 0.08, t: 4.1 },
  { id: 40, sx:  205, sy:   50, tx:  360, ty: -100, s: 2, c: "#ffffff", d: 0.22, t: 3.3 },
  { id: 41, sx:  220, sy:  170, tx:  450, ty:  -30, s: 1, c: "#F4D4B0", d: 0.34, t: 3.9 },
  { id: 42, sx:  250, sy: -150, tx:  520, ty: -280, s: 2, c: "#ffffff", d: 0.02, t: 4.2 },
  { id: 43, sx:  185, sy:  -80, tx:  395, ty: -160, s: 1, c: "#D4A574", d: 0.14, t: 3.5 },
  { id: 44, sx:  235, sy:   70, tx:  470, ty:  -90, s: 2, c: "#ffffff", d: 0.24, t: 3.8 },
  { id: 45, sx:  200, sy:  240, tx:  340, ty:   50, s: 1, c: "#F4D4B0", d: 0.44, t: 3.1 },
  { id: 46, sx:  255, sy: -200, tx:  540, ty: -300, s: 1, c: "#ffffff", d: 0.01, t: 4.3 },
  { id: 47, sx:  190, sy:  -10, tx:  380, ty: -120, s: 2, c: "#F4D4B0", d: 0.18, t: 3.4 },
  { id: 48, sx:  225, sy:  140, tx:  430, ty:  -50, s: 1, c: "#ffffff", d: 0.32, t: 3.7 },
  { id: 49, sx:  215, sy:  -40, tx:  455, ty: -185, s: 2, c: "#D4A574", d: 0.10, t: 3.6 },
  { id: 50, sx:  240, sy:  100, tx:  500, ty:  -70, s: 1, c: "#F4D4B0", d: 0.28, t: 4.0 },
  { id: 51, sx:  195, sy:  280, tx:  330, ty:   80, s: 2, c: "#ffffff", d: 0.50, t: 3.0 },
  { id: 52, sx:  260, sy: -240, tx:  560, ty: -330, s: 1, c: "#F4D4B0", d: 0.05, t: 4.4 },
  { id: 53, sx:  210, sy:   30, tx:  410, ty: -110, s: 2, c: "#ffffff", d: 0.20, t: 3.5 },
  { id: 54, sx:  230, sy:  210, tx:  470, ty:   10, s: 1, c: "#D4A574", d: 0.40, t: 3.8 },
  { id: 55, sx:  175, sy: -160, tx:  295, ty: -240, s: 2, c: "#ffffff", d: 0.07, t: 3.3 },
  { id: 56, sx:  245, sy:  -70, tx:  490, ty: -200, s: 1, c: "#F4D4B0", d: 0.15, t: 4.1 },
  { id: 57, sx:  200, sy:  175, tx:  360, ty:  -15, s: 2, c: "#ffffff", d: 0.36, t: 3.4 },
  { id: 58, sx:  220, sy: -130, tx:  440, ty: -250, s: 1, c: "#D4A574", d: 0.09, t: 3.9 },
  { id: 59, sx:  185, sy:  310, tx:  310, ty:  110, s: 2, c: "#F4D4B0", d: 0.55, t: 3.1 },
] as const;

export default function Hero({ page }: HeroProps) {
  const ref   = useRef<HTMLElement>(null);
  const title = page?.title       ?? "Cultiver la Vie";
  const desc  = page?.description ?? "Des fleurs fraîches de la ferme à votre porte. Abonnements, autocueillette et bouquets artisanaux cultivés avec amour au cœur du Québec.";

  const [curtainOpen, setCurtainOpen] = useState(false);
  const [curtainDone, setCurtainDone] = useState(false);
  const [particleKey, setParticleKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setCurtainOpen(true), 2800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY < 40) {
        setCurtainOpen(false);
        setCurtainDone(false);
      } else if (window.scrollY > 80) {
        setCurtainOpen(true);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Déclenche les particules en même temps que les rideaux */
  useEffect(() => {
    if (curtainOpen) setParticleKey((k) => k + 1);
  }, [curtainOpen]);

  /* Notifie la Navbar de l'état du rideau */
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("hero-curtain", { detail: curtainOpen }));
  }, [curtainOpen]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const flowerY      = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);
  const flowerRotate = useTransform(scrollYProgress, [0, 1], [0,    10]);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative overflow-hidden"
      style={{ backgroundColor: "#0d1a05" }}
    >
      {/* Fond */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(160deg, #0d1a05 0%, #1a3009 50%, #0d1a05 100%)" }} />

      {/* Fleur SVG — filigrane centré derrière Zone 2 */}
      <motion.div
        className="absolute pointer-events-none z-0"
        style={{ top: "100svh", left: "50%", translateX: "-50%", translateY: "-30%", y: flowerY, rotate: flowerRotate }}
        animate={{ opacity: curtainDone ? 0.065 : 0 }}
        transition={{ duration: 2 }}
      >
        <svg viewBox="0 0 200 200" style={{ width: "clamp(340px, 58vw, 580px)" }}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <ellipse key={deg} cx="100" cy="100" rx="35" ry="70" fill="#F4D4B0"
              transform={`rotate(${deg} 100 100)`} />
          ))}
          <circle cx="100" cy="100" r="20" fill="#D4A574" />
        </svg>
      </motion.div>

      {/* ── Poudre magique — s'échappe des bords des rideaux ── */}
      {particleKey > 0 && (
        <div className="absolute pointer-events-none" style={{ inset: 0, zIndex: 25 }}>
          {PARTICLES.map((p) => (
            <motion.span
              key={`${p.id}-${particleKey}`}
              className="absolute rounded-full"
              style={{
                width:           p.s,
                height:          p.s,
                backgroundColor: p.c,
                top:             "50svh",
                left:            "50%",
                marginLeft:      -(p.s / 2),
                marginTop:       -(p.s / 2),
              }}
              initial={{ x: p.sx, y: p.sy, opacity: 0, scale: 0 }}
              animate={{
                x:       p.tx,
                y:       p.ty,
                opacity: [0, 0.9, 0.6, 0],
                scale:   [0, 1.2, 0.8, 0],
              }}
              transition={{
                x:       { duration: p.t * 0.65, delay: p.d, ease: "easeOut" },
                y:       { duration: p.t,         delay: p.d, ease: [0.1, 0, 0.4, 1] },
                opacity: { duration: p.t,         delay: p.d, times: [0, 0.08, 0.5, 1] },
                scale:   { duration: p.t,         delay: p.d, times: [0, 0.08, 0.4, 1] },
              }}
            />
          ))}
        </div>
      )}

      {/* ── Rideaux ── */}
      <motion.div
        className="absolute left-0 z-20 w-[75%] sm:w-[52%]"
        style={{ top: 0, height: "100svh", transformOrigin: "left center" }}
        animate={{ x: curtainOpen ? "-105%" : "0%", rotate: curtainOpen ? -35 : 0 }}
        transition={curtainOpen ? OPEN_T : CLOSE_T}
        onAnimationComplete={() => { if (curtainOpen) setCurtainDone(true); }}
      >
        <Image src="/images/hero/FLEUR-L.webp" alt="" fill priority
          sizes="(max-width: 640px) 75vw, 52vw"
          className="object-cover object-right select-none" draggable={false} />
      </motion.div>

      <motion.div
        className="absolute right-0 z-20 w-[75%] sm:w-[52%]"
        style={{ top: 0, height: "100svh", transformOrigin: "right center" }}
        animate={{ x: curtainOpen ? "105%" : "0%", rotate: curtainOpen ? 35 : 0 }}
        transition={curtainOpen ? OPEN_T : CLOSE_T}
      >
        <Image src="/images/hero/FLEUR-R.webp" alt="" fill priority
          sizes="(max-width: 640px) 75vw, 52vw"
          className="object-cover object-left select-none" draggable={false} />
      </motion.div>

      {/* ── ZONE 1 : logo ── */}
      <div className="relative z-30 flex items-center justify-center" style={{ height: "100svh" }}>
        <Image
          src="/images/fp_logo.png"
          alt="Florus Pocus"
          width={220}
          height={220}
          className="select-none drop-shadow-2xl"
          style={{ objectFit: "contain", width: "min(220px, 40vw)", height: "auto" }}
          draggable={false}
          priority
        />

        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
          <AnimatePresence>
            {!curtainOpen && (
              <motion.div
                key="entrer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeOut" } }}
              >
                <motion.button
                  className="flex flex-col items-center gap-2"
                  style={{ color: "#F4D4B0" }}
                  onClick={() => setCurtainOpen(true)}
                  animate={{ y: [0, 7, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="text-xs uppercase tracking-[0.3em] opacity-50">Entrer</span>
                  <div className="w-px h-7 rounded-full opacity-35" style={{ backgroundColor: "#F4D4B0" }} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── ZONE 2 : titre + contenu ── */}
      <div className="relative z-30 text-center px-6 pb-24 sm:pb-28 max-w-4xl mx-auto w-full">
        <div className="w-16 h-px mx-auto mb-10 opacity-20" style={{ backgroundColor: "#F4D4B0" }} />

        <p className="text-xs font-semibold uppercase tracking-[0.3em] mb-4"
          style={{ color: "#F4D4B0", opacity: 0.55 }}>
          Ferme florale artisanale
        </p>

        <h1 className="font-display font-bold leading-tight mb-5 text-white"
          style={{ fontSize: "clamp(2.8rem, 8vw, 6.5rem)", letterSpacing: "-0.01em" }}>
          {title}
        </h1>

        <p className="text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-10"
          style={{ color: "#F4D4B0", opacity: 0.72 }}>
          {desc}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.a href="#abonnements"
            className="font-heading font-semibold px-7 py-3.5 rounded-full text-sm uppercase tracking-wider"
            style={{ backgroundColor: "#D4A574", color: "#1A1A1A" }}
            whileHover={{ scale: 1.05, boxShadow: "0 8px 30px rgba(212,165,116,0.35)" }}
            whileTap={{ scale: 0.97 }}>
            Voir les abonnements
          </motion.a>
          <motion.a href="#autocueillette"
            className="font-heading font-semibold px-7 py-3.5 rounded-full text-sm uppercase tracking-wider border-2"
            style={{ borderColor: "#F4D4B0", color: "#F4D4B0" }}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(244,212,176,0.08)" }}
            whileTap={{ scale: 0.97 }}>
            Autocueillette
          </motion.a>
        </div>
      </div>
    </section>
  );
}
