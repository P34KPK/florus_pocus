"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import GrowingStem from "@/components/GrowingStem";
import type { Page } from "@/types";

interface FarmStat { value?: string; label?: string }

interface FarmProps {
  page?: Page | null;
  stats?: FarmStat[];
}

const DEFAULT_FARM_STATS: FarmStat[] = [
  { value: "5+",  label: "Années de passion" },
  { value: "80+", label: "Variétés cultivées" },
  { value: "200", label: "Familles abonnées" },
  { value: "0",   label: "Pesticide utilisé" },
];

export default function Farm({ page, stats }: FarmProps) {
  const FARM_STATS = (stats && stats.length > 0) ? stats : DEFAULT_FARM_STATS;
  const ref        = useRef<HTMLElement>(null);
  const title      = page?.title       ?? "La Ferme";
  const content    = page?.description ?? "Nichée au cœur du Québec, Florus Pocus est née d'une passion pour les fleurs et d'un désir de reconnecter les gens avec la nature. Nous cultivons plus de 80 variétés de fleurs sans pesticides, en harmonie avec les saisons et l'environnement.\n\nChaque bouquet que vous recevez a été semé, cultivé et cueilli à la main par notre équipe. Nous croyons que les fleurs ne sont pas qu'un produit — elles sont une invitation à ralentir, à apprécier la beauté du moment présent.";
  const paragraphs = content.split("\n\n").filter(Boolean);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);
  const bgY  = useTransform(scrollYProgress, [0, 1], ["0%", "6%"]);

  return (
    <section ref={ref} id="la-ferme" className="section-padding relative overflow-hidden"
      style={{ backgroundColor: "#FAFAF8", zIndex: 2 }}>

      {/* Tige botanique — côté droit, bas de section */}
      <div className="absolute bottom-0 right-4 pointer-events-none" style={{ zIndex: 0 }}>
        <GrowingStem side="right" color="#2D5016" height={200} delay={0.3} opacity={0.32} />
      </div>

      <motion.div className="absolute inset-0 pointer-events-none"
        style={{ y: bgY, background: "linear-gradient(180deg, #f0f5ec 0%, #fafaf8 60%)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Stats bar */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 rounded-3xl p-8 mb-20"
          style={{ backgroundColor: "#2D5016" }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {FARM_STATS.map((s, i) => (
            <motion.div key={i} className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}>
              <p className="font-heading font-bold text-4xl mb-1" style={{ color: "#D4A574" }}>{s.value}</p>
              <p className="text-sm opacity-60 text-white">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Image */}
          <motion.div className="relative order-2 lg:order-1"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}>
            <motion.div style={{ y: imgY }}>
              <div className="w-full aspect-square rounded-3xl overflow-hidden relative">
                <Image
                  src="/images/farm.webp"
                  alt="La ferme Florus Pocus"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Texte */}
          <div className="order-1 lg:order-2">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: "#D4A574" }}>Notre histoire</p>
              <h2 className="font-display font-bold leading-tight mb-6"
                style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", color: "#2D5016" }}>{title}</h2>
            </motion.div>
            <div className="space-y-4">
              {paragraphs.map((p, i) => (
                <motion.p key={i} className="text-base leading-relaxed opacity-70"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 0.7, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.15 }}>
                  {p}
                </motion.p>
              ))}
            </div>
            <motion.div
              className="inline-block mt-8"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link href="/contact"
                className="inline-flex items-center gap-2 font-heading font-semibold px-7 py-3.5 rounded-full text-sm text-white transition-all"
                style={{ backgroundColor: "#2D5016" }}>
                Nous visiter →
              </Link>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
