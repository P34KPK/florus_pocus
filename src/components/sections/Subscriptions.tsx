"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import ParallaxPetals from "@/components/ParallaxPetals";
import type { Subscription, SubscriptionFrequency, DropoffPoint } from "@/types";

interface SubscriptionsProps {
  subscriptions?: Subscription[];
  sectionTitle?: string;
  sectionSubtitle?: string;
}

const PLACEHOLDER_SUBS: Subscription[] = [
  { id: "sub-1", name: "Petit Bouquet", description: "Un bouquet délicat de fleurs de saison pour égayer votre espace.", price: 39, format: "Petit", frequencies: ["1x_month", "2x_month"], active: true, created_at: "", updated_at: "",
    dropoff_points: [
      { id: "dp-1", subscription_id: "sub-1", name: "Pont-Rouge", address: "123 Rue Principale, Pont-Rouge", days_available: [1,3,5], hours_start: "09:00", hours_end: "17:00", created_at: "", updated_at: "" },
      { id: "dp-2", subscription_id: "sub-1", name: "Québec — Saint-Roch", address: "456 Rue Saint-Joseph, Québec", days_available: [2,4], hours_start: "10:00", hours_end: "18:00", created_at: "", updated_at: "" },
    ],
  },
  { id: "sub-2", name: "Bouquet Moyen", description: "Un généreux bouquet qui transforme chaque pièce en jardin fleuri.", price: 65, format: "Moyen", frequencies: ["1x_month", "2x_month", "4x_month"], active: true, created_at: "", updated_at: "",
    dropoff_points: [
      { id: "dp-3", subscription_id: "sub-2", name: "Pont-Rouge", address: "123 Rue Principale, Pont-Rouge", days_available: [1,3,5], hours_start: "09:00", hours_end: "17:00", created_at: "", updated_at: "" },
      { id: "dp-4", subscription_id: "sub-2", name: "Québec — Saint-Roch", address: "456 Rue Saint-Joseph, Québec", days_available: [2,4], hours_start: "10:00", hours_end: "18:00", created_at: "", updated_at: "" },
    ],
  },
  { id: "sub-3", name: "Bouquet Complet", description: "L'expérience florale ultime — un bouquet spectaculaire chaque livraison.", price: 95, format: "Grand", frequencies: ["1x_month", "2x_month", "4x_month"], active: true, created_at: "", updated_at: "",
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

function FormatBadge({ format, isPopular }: { format: string; isPopular: boolean }) {
  return (
    <div className="flex justify-center mb-5">
      <div className="flex flex-col items-center justify-center rounded-2xl px-8 py-4"
        style={isPopular
          ? { backgroundColor: "rgba(45,80,22,0.1)", border: "1.5px solid rgba(45,80,22,0.2)" }
          : { backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }
        }
      >
        <span className="font-display font-bold leading-none" style={{ fontSize: "1.8rem", color: isPopular ? "#1a2e0a" : "#ffffff" }}>
          {format}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest mt-1" style={{ color: isPopular ? "rgba(45,80,22,0.5)" : "rgba(255,255,255,0.4)" }}>
          format
        </span>
      </div>
    </div>
  );
}

function SubscriptionCard({ sub, index }: { sub: Subscription; index: number }) {
  const { addSubscription } = useCart();
  const [freq,    setFreq]    = useState<SubscriptionFrequency>(sub.frequencies[0]);
  const [dropoff, setDropoff] = useState<DropoffPoint | null>(sub.dropoff_points?.[0] ?? null);
  const [added,   setAdded]   = useState(false);
  const isPopular = sub.format === "Moyen";

  function handleAdd() {
    if (!dropoff) return;
    addSubscription({ id: sub.id, name: sub.name, price: sub.price, frequency: freq, dropoff_point_id: dropoff.id, dropoff_point_name: dropoff.name });
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
        <FormatBadge format={sub.format} isPopular={isPopular} />

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
            {sub.price}$
          </span>
          <span className={`text-sm ml-1 ${isPopular ? "text-[#2D5016]/60" : "text-white/40"}`}>/bouquet</span>
        </div>
        <p className={`text-xs mb-6 ${isPopular ? "text-[#2D5016]/50" : "text-white/40"}`}>
          Fleurs fraîches de saison — format {sub.format.toLowerCase()}
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

export default function Subscriptions({ subscriptions, sectionTitle, sectionSubtitle }: SubscriptionsProps) {
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
            {(sectionTitle ?? "Des fleurs de saison, chaque mois").split(",").map((part, i, arr) => (
              <span key={i}>{part}{i < arr.length - 1 ? "," : ""}{i < arr.length - 1 && <br />}</span>
            ))}
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-base text-white/50">
            {sectionSubtitle ?? "Choisissez votre abonnement, votre fréquence de livraison et votre point de chute préféré."}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subs.map((sub, i) => <SubscriptionCard key={sub.id} sub={sub} index={i} />)}
        </div>
      </div>
    </section>
  );
}
