"use client";

import { useActionState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, CheckCircle } from "lucide-react";
import { sendContactMessage } from "@/lib/actions/contact";
import type { Page } from "@/types";

interface ContactProps {
  page?: Page | null;
  address?: string;
  phone?: string;
  email?: string;
  hours?: string;
}

const inputClass = "w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-white/25 text-white";
const inputStyle = { backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", "--tw-ring-color": "#D4A574" } as React.CSSProperties;

export default function Contact({ page, address, phone, email, hours }: ContactProps) {
  const [state, formAction, pending] = useActionState(sendContactMessage, {});

  const resolvedAddress = address || "123 Chemin de la Ferme, Pont-Rouge, QC G3H 1A1";

  const INFOS = [
    { icon: MapPin, label: "Adresse",   value: resolvedAddress },
    { icon: Phone,  label: "Téléphone", value: phone   || "+1 (418) 555-1234" },
    { icon: Mail,   label: "Courriel",  value: email   || "info@floruspocus.com" },
    { icon: Clock,  label: "Heures",    value: hours   || "Lun-Ven 9h-17h · Sam 9h-14h" },
  ];

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(resolvedAddress)}&output=embed`;

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
            {page?.title ?? "On serait ravis de vous entendre"}
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
                  <label htmlFor="telephone" className="block text-xs font-semibold uppercase tracking-[0.08em] mb-1.5 text-white/40">
                    Téléphone <span className="normal-case font-normal">(optionnel)</span>
                  </label>
                  <input id="telephone" name="telephone" type="tel"
                    placeholder="+1 (418) 555-1234" className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-[0.08em] mb-1.5 text-white/40">
                    Message *
                  </label>
                  <textarea id="message" name="message" required rows={4}
                    placeholder="Bonjour, j'aimerais…"
                    className={`${inputClass} resize-none`} style={inputStyle} />
                </div>

                {/* Case infolettre */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" name="newsletter" value="on"
                    className="mt-0.5 w-4 h-4 rounded accent-[#D4A574] flex-shrink-0 cursor-pointer" />
                  <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors leading-relaxed">
                    Je souhaite m&apos;inscrire à l&apos;infolettre et recevoir les nouvelles de la ferme,
                    les arrivages de fleurs et les offres exclusives.
                  </span>
                </label>

                <motion.button type="submit" disabled={pending}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full font-heading font-semibold py-3.5 rounded-xl text-sm transition-all disabled:opacity-50"
                  style={{ backgroundColor: "#D4A574", color: "#1A1A1A" }}>
                  {pending ? "Envoi en cours…" : "Envoyer le message"}
                </motion.button>
              </form>
            )}
          </motion.div>

          {/* Infos + carte */}
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

            {/* Carte Google Maps */}
            <div className="flex-1 rounded-3xl overflow-hidden min-h-[220px]"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              <iframe
                title="Localisation Florus Pocus"
                src={mapSrc}
                width="100%"
                height="100%"
                style={{ minHeight: "220px", border: 0, filter: "grayscale(20%) invert(5%)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
