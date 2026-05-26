"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sprout, Truck, Leaf, Users, ArrowRight } from "lucide-react";
import GrowingStem from "@/components/GrowingStem";
import type { Page } from "@/types";

interface WhyLocalProps {
  page?: Page | null;
}

const REASONS = [
  { Icon: Sprout, title: "Cultivées sans pesticides",   desc: "Chaque fleur est cultivée en harmonie avec la nature, sans produits chimiques nocifs." },
  { Icon: Truck,  title: "Livraison locale",             desc: "De la ferme à votre porte, fraîches et épanouies, directement dans votre région." },
  { Icon: Leaf,   title: "Saisons respectées",           desc: "Nos fleurs suivent le rythme naturel des saisons québécoises pour une qualité maximale." },
  { Icon: Users,  title: "Soutenir l'économie locale",  desc: "En choisissant Florus Pocus, vous investissez dans votre communauté et l'agriculture locale." },
];

function PassingFlower({ scrollYProgress }: { scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  const x       = useTransform(scrollYProgress, [0, 1], ["-20%", "120%"]);
  const y       = useTransform(scrollYProgress, [0, 0.5, 1], ["60%", "30%", "10%"]);
  const rotate  = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.8, 1], [0, 0.15, 0.15, 0]);

  return (
    <motion.div className="absolute pointer-events-none z-0" style={{ x, y, rotate, opacity }}>
      <svg viewBox="0 0 120 120" width="180" height="180">
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <ellipse key={deg} cx="60" cy="60" rx="20" ry="45" fill="#D4A574"
            transform={`rotate(${deg} 60 60)`} />
        ))}
        <circle cx="60" cy="60" r="15" fill="#F4D4B0" />
      </svg>
    </motion.div>
  );
}

function FadeInView({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function WhyLocal({ page }: WhyLocalProps) {
  const ref     = useRef<HTMLElement>(null);
  const rawTitle = page?.title ?? "Pourquoi choisir local ?";
  const title    = rawTitle.replace(/ \?/g, " ?");
  const content = page?.description ?? "Parce que les fleurs qui voyagent moins sont plus fraîches, plus belles et respectent notre belle planète. Chez Florus Pocus, chaque bouquet raconte l'histoire de notre terre québécoise, cultivée avec passion à quelques kilomètres de chez vous.";

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY  = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["5%", "-10%"]);

  return (
    <section ref={ref} id="pourquoi-local" className="section-padding relative overflow-hidden"
      style={{ backgroundColor: "#FAFAF8", zIndex: 2 }}>

      {/* Tige botanique — ancrée au bas de la section, côté texte */}
      <div className="absolute bottom-0 left-4 pointer-events-none" style={{ zIndex: 0 }}>
        <GrowingStem side="left" color="#2D5016" height={200} delay={0.2} opacity={0.35} />
      </div>

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: bgY, background: "linear-gradient(180deg, #f0f5ec 0%, #fafaf8 60%)" }}
      />

      <PassingFlower scrollYProgress={scrollYProgress} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Texte */}
          <div>
            <FadeInView delay={0}>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: "#D4A574" }}>
                Notre engagement
              </p>
            </FadeInView>
            <FadeInView delay={0.1}>
              <h2 className="font-display font-bold leading-tight mb-6"
                style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", color: "#2D5016" }}>
                {title}
              </h2>
            </FadeInView>
            <FadeInView delay={0.2}>
              <p className="text-base leading-relaxed opacity-70 mb-8">{content}</p>
            </FadeInView>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-2">
              {REASONS.map((r, i) => (
                <FadeInView key={r.title} delay={0.3 + i * 0.1}>
                  <div className="flex gap-3">
                    <div
                      className="flex-shrink-0 mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: "rgba(45,80,22,0.08)" }}
                    >
                      <r.Icon size={16} style={{ color: "#2D5016" }} />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-sm mb-1" style={{ color: "#2D5016" }}>{r.title}</p>
                      <p className="text-sm leading-relaxed opacity-65">{r.desc}</p>
                    </div>
                  </div>
                </FadeInView>
              ))}
            </div>

            <FadeInView delay={0.75}>
              <Link
                href="/la-ferme"
                className="inline-flex items-center gap-2 mt-8 font-heading font-semibold text-sm transition-all hover:gap-3"
                style={{ color: "#2D5016" }}
              >
                Découvrir notre ferme <ArrowRight size={16} />
              </Link>
            </FadeInView>
          </div>

          {/* Image */}
          <FadeInView delay={0.2} className="relative">
            <motion.div style={{ y: imgY }}>
              <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden relative">
                <Image
                  src="/images/whylocal.webp"
                  alt="Ferme florale Florus Pocus"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </motion.div>
          </FadeInView>

        </div>
      </div>
    </section>
  );
}
