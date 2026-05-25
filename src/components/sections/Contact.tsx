"use client";

import { useActionState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, CheckCircle } from "lucide-react";
import { sendContactMessage } from "@/lib/actions/contact";
import type { Page } from "@/types";

interface ContactProps {
  page?: Page | null;
}

const INFOS = [
  { icon: MapPin, label: "Adresse",   value: "123 Chemin de la Ferme, Pont-Rouge, QC G3H 1A1" },
  { icon: Phone,  label: "Téléphone", value: "+1 (418) 555-1234" },
  { icon: Mail,   label: "Courriel",  value: "info@floruspocus.ca" },
  { icon: Clock,  label: "Heures",    value: "Lun-Ven 9h-17h · Sam 9h-14h" },
];

const inputClass = "w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-white/25 text-white";
const inputStyle = { backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", "--tw-ring-color": "#D4A574" } as React.CSSProperties;

export default function Contact({ page }: ContactProps) {
  const [state, formAction, pending] = useActionState(sendContactMessage, {});

  return (
    <section id="contact" className="section-padding relative overflow-hidden"
      style={{ backgroundColor: "#1a3009", zIndex: 2 }}>

      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 80% 100%, rgba(212,165,116,0.12) 0%, transparent 60%)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <motion.div className="mb-14"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-4" style={{ color: "#D4A574" }}>
            Parlez-nous
          </p>
          <h2 className="font-display font-bold leading-tight text-white"
            style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)" }}>
            On serait ravis<br />de vous entendre
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Formulaire */}
          <motion.div className="rounded-3xl p-8"
            style={{ backgroundColor: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)" }}
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}>

            {state.success ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <motion.div className="mb-4 flex items-center justify-center"
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(212,165,116,0.18)" }}>
                    <CheckCircle size={32} style={{ color: "#D4A574" }} />
                  </div>
                </motion.div>
                <h3 className="font-display font-bold text-2xl mb-2 text-white">Message envoyé !</h3>
                <p className="text-sm text-white/50">Nous vous répondrons dans les plus brefs délais.</p>
              </div>
            ) : (
              <form action={formAction} className="space-y-5">
                {state.error && (
                  <p className="text-sm text-red-300 bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-2">
                    {state.error}
                  </p>
                )}
                <div>
                  <label htmlFor="nom" className="block text-xs font-semibold uppercase tracking-[0.08em] mb-1.5 text-white/40">
                    Nom complet *
                  </label>
                  <input id="nom" name="nom" type="text" required
                    placeholder="Marie Tremblay" className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-[0.08em] mb-1.5 text-white/40">
                    Adresse courriel *
                  </label>
                  <input id="email" name="email" type="email" required
                    placeholder="marie@exemple.com" className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-[0.08em] mb-1.5 text-white/40">
                    Message *
                  </label>
                  <textarea id="message" name="message" required rows={5}
                    placeholder="Bonjour, j'aimerais…"
                    className={`${inputClass} resize-none`} style={inputStyle} />
                </div>
                <motion.button type="submit" disabled={pending}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full font-heading font-semibold py-3.5 rounded-xl text-sm transition-all disabled:opacity-50"
                  style={{ backgroundColor: "#D4A574", color: "#1A1A1A" }}>
                  {pending ? "Envoi en cours…" : "Envoyer le message"}
                </motion.button>
              </form>
            )}
          </motion.div>

          {/* Infos */}
          <motion.div className="flex flex-col gap-4"
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}>
            {INFOS.map(({ icon: Icon, label, value }, i) => (
              <motion.div key={label} className="flex items-start gap-4 rounded-2xl p-5"
                style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(212,165,116,0.15)" }}>
                  <Icon size={18} style={{ color: "#D4A574" }} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/30 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-white/80">{value}</p>
                </div>
              </motion.div>
            ))}

            <div className="flex-1 rounded-3xl min-h-[160px] flex flex-col items-center justify-center gap-3"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(212,165,116,0.15)" }}>
                <MapPin size={20} style={{ color: "#D4A574" }} />
              </div>
              <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.25)" }}>Carte interactive à venir</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
