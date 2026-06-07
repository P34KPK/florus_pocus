"use client";

import { useEffect, useState, useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift } from "lucide-react";
import { subscribeNewsletter } from "@/lib/actions/newsletter";

const STORAGE_KEY = "fp_newsletter_shown";
const PROMO_CODE  = "BIENVENUE10";

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [state, formAction, pending] = useActionState(subscribeNewsletter, {});

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  // Marquer comme vu dès que succès
  useEffect(() => {
    if (state.success) localStorage.setItem(STORAGE_KEY, "1");
  }, [state.success]);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-[200]"
            style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[201] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="relative w-full max-w-md rounded-3xl overflow-hidden"
              style={{ backgroundColor: "#0d1a05", border: "1px solid rgba(212,165,116,0.25)" }}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 280, damping: 22 }}
              onClick={(e) => e.stopPropagation()}>

              {/* Accent bar */}
              <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #2D5016, #D4A574)" }} />

              <div className="p-8">
                {/* Close */}
                <button onClick={dismiss}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                  style={{ color: "rgba(255,255,255,0.4)" }}>
                  <X size={16} />
                </button>

                {state.success ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                      style={{ backgroundColor: "rgba(212,165,116,0.15)" }}>
                      <Gift size={28} style={{ color: "#D4A574" }} />
                    </div>
                    <h3 className="font-display font-bold text-2xl text-white mb-2">
                      Merci de vous inscrire !
                    </h3>
                    <p className="text-sm text-white/50 mb-6">
                      Voici votre code pour 10 % de rabais sur votre première commande :
                    </p>
                    <div className="rounded-2xl px-6 py-4 mb-6 select-all"
                      style={{ backgroundColor: "rgba(212,165,116,0.12)", border: "2px dashed rgba(212,165,116,0.4)" }}>
                      <span className="font-heading font-bold text-2xl tracking-widest"
                        style={{ color: "#D4A574" }}>
                        {PROMO_CODE}
                      </span>
                    </div>
                    <p className="text-xs text-white/30">
                      Copiez ce code et appliquez-le à la caisse.
                    </p>
                    <button onClick={dismiss}
                      className="mt-6 w-full font-heading font-semibold py-3 rounded-xl text-sm transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#D4A574", color: "#1A1A1A" }}>
                      Continuer mes achats
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                      style={{ backgroundColor: "rgba(212,165,116,0.15)" }}>
                      <Gift size={22} style={{ color: "#D4A574" }} />
                    </div>
                    <h3 className="font-display font-bold text-white leading-tight mb-2"
                      style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)" }}>
                      10 % sur votre<br />première commande
                    </h3>
                    <p className="text-sm text-white/50 mb-6">
                      Inscrivez-vous à notre infolettre et recevez un code de rabais exclusif,
                      ainsi que les nouvelles de la ferme et les arrivages de fleurs.
                    </p>

                    {state.error && (
                      <p className="text-xs text-red-300 bg-red-900/20 border border-red-500/20 rounded-xl px-3 py-2 mb-4">
                        {state.error}
                      </p>
                    )}

                    <form action={formAction} className="flex flex-col gap-3">
                      <input type="hidden" name="source" value="popup" />
                      <input
                        name="email" type="email" required
                        placeholder="votre@courriel.com"
                        className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 text-white placeholder:text-white/25 transition-all"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.07)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          "--tw-ring-color": "#D4A574",
                        } as React.CSSProperties}
                      />
                      <motion.button type="submit" disabled={pending}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="w-full font-heading font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-50"
                        style={{ backgroundColor: "#D4A574", color: "#1A1A1A" }}>
                        {pending ? "Inscription…" : "Obtenir mon 10 %"}
                      </motion.button>
                    </form>

                    <button onClick={dismiss}
                      className="mt-4 w-full text-xs text-white/25 hover:text-white/40 transition-colors py-1">
                      Non merci, je préfère payer le plein prix
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
