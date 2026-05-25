"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import ParallaxPetals from "@/components/ParallaxPetals";
import type { Subscription, SubscriptionFrequency, DropoffPoint } from "@/types";

interface SubscriptionsProps {
  subscriptions?: Subscription[];
}

const PLACEHOLDER_SUBS: Subscription[] = [
  { id: "sub-1", name: "Petit Bouquet", description: "Un bouquet délicat de fleurs de saison pour égayer votre espace.", price_monthly: 39, stems_count: 10, frequencies: ["1x_month", "2x_month"], active: true, created_at: "", updated_at: "",
    dropoff_points: [
      { id: "dp-1", subscription_id: "sub-1", name: "Pont-Rouge", address: "123 Rue Principale, Pont-Rouge", days_available: [1,3,5], hours_start: "09:00", hours_end: "17:00", created_at: "", updated_at: "" },
      { id: "dp-2", subscription_id: "sub-1", name: "Québec — Saint-Roch", address: "456 Rue Saint-Joseph, Québec", days_available: [2,4], hours_start: "10:00", hours_end: "18:00", created_at: "", updated_at: "" },
    ],
  },
  { id: "sub-2", name: "Bouquet Moyen", description: "Un généreux bouquet qui transforme chaque pièce en jardin fleuri.", price_monthly: 65, stems_count: 20, frequencies: ["1x_month", "2x_month", "4x_month"], active: true, created_at: "", updated_at: "",
    dropoff_points: [
      { id: "dp-3", subscription_id: "sub-2", name: "Pont-Rouge", address: "123 Rue Principale, Pont-Rouge", days_available: [1,3,5], hours_start: "09:00", hours_end: "17:00", created_at: "", updated_at: "" },
      { id: "dp-4", subscription_id: "sub-2", name: "Québec — Saint-Roch", address: "456 Rue Saint-Joseph, Québec", days_available: [2,4], hours_start: "10:00", hours_end: "18:00", created_at: "", updated_at: "" },
    ],
  },
  { id: "sub-3", name: "Bouquet Complet", description: "L'expérience florale ultime — un bouquet spectaculaire chaque livraison.", price_monthly: 95, stems_count: 30, frequencies: ["1x_month", "2x_month", "4x_month"], active: true, created_at: "", updated_at: "",
    dropoff_points: [
      { id: "dp-5", subscription_id: "sub-3", name: "Pont-Rouge", address: "123 Rue Principale, Pont-Rouge", days_available: [1,3,5], hours_start: "09:00", hours_end: "17:00", created_at: "", updated_at: "" },
      { id: "dp-6", subscription_id: "sub-3", name: "Québec — Saint-Roch", address: "456 Rue Saint-Joseph, Québec", days_available: [2,4], hours_start: "10:00", hours_end: "18:00", created_at: "", updated_at: "" },
    ],
  },
];

const FREQ_LABELS: Record<SubscriptionFrequency, string> = {
  "1x_month": "1× par mois",
  "2x_month": "2× par mois",
  "4x_month": "4× par mois (hebdomadaire)",
};

function BouquetGauge({ stems, isPopular, index }: { stems: number; isPopular: boolean; index: number }) {
  const R         = 44;
  const CX        = 60;
  const CY        = 60;
  const CIRC      = 2 * Math.PI * R;          // ≈ 276.46
  const GAUGE_ARC = (270 / 360) * CIRC;       // 270° arc ≈ 207.35

  const fillArc  = (stems / 30) * GAUGE_ARC;

  const fillColor  = isPopular ? "#2D5016" : "#D4A574";
  const trackColor = isPopular ? "rgba(45,80,22,0.15)" : "rgba(255,255,255,0.1)";
  const textColor  = isPopular ? "#1a2e0a" : "#ffffff";
  const subColor   = isPopular ? "rgba(45,80,22,0.50)" : "rgba(255,255,255,0.40)";

  return (
    <div className="flex justify-center mb-5">
      <div className="relative" style={{ width: 108, height: 108 }}>
        <svg viewBox="0 0 120 120" width="108" height="108">
          {/* rotate(135) positions the gap at the bottom */}
          <g transform={`rotate(135, ${CX}, ${CY})`}>
            <circle cx={CX} cy={CY} r={R} fill="none" stroke={trackColor}
              strokeWidth="7" strokeLinecap="round"
              strokeDasharray={`${GAUGE_ARC} ${CIRC - GAUGE_ARC}`}
            />
            <motion.circle cx={CX} cy={CY} r={R} fill="none" stroke={fillColor}
              strokeWidth="7" strokeLinecap="round"
              strokeDasharray={`${GAUGE_ARC} ${CIRC - GAUGE_ARC}`}
              initial={{ strokeDashoffset: GAUGE_ARC }}
              whileInView={{ strokeDashoffset: GAUGE_ARC - fillArc }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.2 + index * 0.15 }}
            />
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold leading-none" style={{ fontSize: "1.6rem", color: textColor }}>
            {stems}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: subColor }}>
            tiges
          </span>
        </div>
      </div>
    </div>
  );
}

function SubscriptionCard({ sub, index }: { sub: Subscription; index: number }) {
  const { addSubscription } = useCart();
  const [freq,    setFreq]    = useState<SubscriptionFrequency>(sub.frequencies[0]);
  const [dropoff, setDropoff] = useState<DropoffPoint | null>(sub.dropoff_points?.[0] ?? null);
  const [added,   setAdded]   = useState(false);
  const isPopular = sub.stems_count === 20;

  function handleAdd() {
    if (!dropoff) return;
    addSubscription({ id: sub.id, name: sub.name, price_monthly: sub.price_monthly, frequency: freq, dropoff_point_id: dropoff.id, dropoff_point_name: dropoff.name });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay: index * 0.15, ease: "easeOut" }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="relative flex flex-col rounded-3xl overflow-hidden"
      style={isPopular
        ? { backgroundColor: "#F4D4B0", border: "2px solid #D4A574" }
        : {
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }
      }
    >
      {isPopular && (
        <div className="absolute top-4 right-4 text-xs font-bold uppercase tracking-[0.1em] px-3 py-1 rounded-full"
          style={{ backgroundColor: "#2D5016", color: "#F4D4B0" }}>Populaire</div>
      )}

      <div className="p-8 flex flex-col">
        <BouquetGauge stems={sub.stems_count} isPopular={isPopular} index={index} />

        <h3 className={`font-heading font-bold text-xl mb-1 ${isPopular ? "text-[#1a2e0a]" : "text-white"}`}>
          {sub.name}
        </h3>
        <p className={`text-sm leading-relaxed mb-5 ${isPopular ? "text-[#2D5016]/70" : "text-white/50"}`}>
          {sub.description}
        </p>

        <div className="flex items-baseline gap-1 mb-1">
          <span
            className={`font-display font-bold ${isPopular ? "text-[#1a2e0a]" : "text-white"}`}
            style={{ fontSize: "clamp(2.8rem, 5vw, 3.5rem)", lineHeight: 1 }}
          >
            {sub.price_monthly}$
          </span>
          <span className={`text-sm ml-1 ${isPopular ? "text-[#2D5016]/60" : "text-white/40"}`}>/mois</span>
        </div>
        <p className={`text-xs mb-6 ${isPopular ? "text-[#2D5016]/50" : "text-white/40"}`}>
          {sub.stems_count} tiges de fleurs de saison
        </p>

        <ul className="space-y-2 mb-6">
          {["Fleurs fraîches de la ferme", "Sélection saisonnière", "Livraison au point de chute", "Annulation facile"].map((f) => (
            <li key={f} className={`flex items-center gap-2 text-sm ${isPopular ? "text-[#1a2e0a]" : "text-white/80"}`}>
              <Check size={14} className="flex-shrink-0" style={{ color: isPopular ? "#2D5016" : "#D4A574" }} />
              {f}
            </li>
          ))}
        </ul>

        <div className="mb-3">
          <label className={`block text-xs font-semibold uppercase tracking-[0.08em] mb-1.5 ${isPopular ? "text-[#2D5016]/60" : "text-white/40"}`}>
            Fréquence
          </label>
          <div className="relative">
            <select
              value={freq}
              onChange={(e) => setFreq(e.target.value as SubscriptionFrequency)}
              className="w-full appearance-none rounded-xl px-4 py-2.5 text-sm border pr-8 focus:outline-none"
              style={isPopular
                ? { backgroundColor: "rgba(45,80,22,0.08)", borderColor: "rgba(45,80,22,0.2)", color: "#1a2e0a" }
                : { backgroundColor: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.15)", color: "#fff" }
              }
            >
              {sub.frequencies.map((f) => (
                <option key={f} value={f} style={{ color: "#1A1A1A", backgroundColor: "#FAFAF8" }}>{FREQ_LABELS[f]}</option>
              ))}
            </select>
            <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isPopular ? "opacity-40" : "opacity-30 text-white"}`} />
          </div>
        </div>

        {sub.dropoff_points && sub.dropoff_points.length > 0 && (
          <div className="mb-6">
            <label className={`block text-xs font-semibold uppercase tracking-[0.08em] mb-1.5 ${isPopular ? "text-[#2D5016]/60" : "text-white/40"}`}>
              Point de chute
            </label>
            <div className="relative">
              <select
                value={dropoff?.id ?? ""}
                onChange={(e) => setDropoff(sub.dropoff_points?.find((d) => d.id === e.target.value) ?? null)}
                className="w-full appearance-none rounded-xl px-4 py-2.5 text-sm border pr-8 focus:outline-none"
                style={isPopular
                  ? { backgroundColor: "rgba(45,80,22,0.08)", borderColor: "rgba(45,80,22,0.2)", color: "#1a2e0a" }
                  : { backgroundColor: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.15)", color: "#fff" }
                }
              >
                {sub.dropoff_points.map((dp) => (
                  <option key={dp.id} value={dp.id} style={{ color: "#1A1A1A", backgroundColor: "#FAFAF8" }}>{dp.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isPopular ? "opacity-40" : "opacity-30 text-white"}`} />
            </div>
          </div>
        )}

        <motion.button
          onClick={handleAdd}
          disabled={!dropoff}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full font-heading font-semibold py-3.5 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={isPopular
            ? { backgroundColor: "#2D5016", color: "#F4D4B0" }
            : { backgroundColor: "#D4A574", color: "#1A1A1A" }
          }
        >
          {added ? (
            <span className="flex items-center justify-center gap-2">
              <Check size={14} /> Ajouté
            </span>
          ) : "Ajouter au panier"}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function Subscriptions({ subscriptions }: SubscriptionsProps) {
  const subs = (subscriptions && subscriptions.length > 0) ? subscriptions : PLACEHOLDER_SUBS;
  const ref  = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY  = useTransform(scrollYProgress, [0, 1], ["0%", "6%"]);

  return (
    <section ref={ref} id="abonnements" className="section-padding relative overflow-hidden"
      style={{ backgroundColor: "#0a1504", zIndex: 2 }}>

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: bgY, background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(45,80,22,0.5) 0%, transparent 70%)" }}
      />

      <ParallaxPetals count={10} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-4"
            style={{ color: "#D4A574" }}>
            Abonnements
          </p>
          <h2 className="font-display font-bold leading-tight text-white"
            style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)" }}>
            Des fleurs de saison,<br />chaque mois
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-base text-white/50">
            Choisissez votre abonnement, votre fréquence de livraison et votre point de chute préféré.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subs.map((sub, i) => <SubscriptionCard key={sub.id} sub={sub} index={i} />)}
        </div>
      </div>
    </section>
  );
}
