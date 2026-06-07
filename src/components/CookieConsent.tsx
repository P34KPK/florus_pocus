"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const STORAGE_KEY = "fp_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-[150] p-4 sm:p-6"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}>
          <div className="max-w-4xl mx-auto rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            style={{
              backgroundColor: "#0d1a05",
              border: "1px solid rgba(212,165,116,0.2)",
              boxShadow: "0 -4px 40px rgba(0,0,0,0.3)",
            }}>
            <p className="text-xs text-white/60 leading-relaxed flex-1">
              Ce site utilise des témoins (cookies) essentiels au bon fonctionnement de la navigation,
              de la boutique et de l&apos;authentification.{" "}
              <Link href="/politique-confidentialite"
                className="underline hover:text-white/80 transition-colors"
                style={{ color: "rgba(212,165,116,0.8)" }}>
                Politique de confidentialité
              </Link>
            </p>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={decline}
                className="text-xs px-4 py-2 rounded-xl font-medium transition-colors text-white/40 hover:text-white/60"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                Refuser
              </button>
              <button onClick={accept}
                className="text-xs px-5 py-2 rounded-xl font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#D4A574", color: "#1A1A1A" }}>
                Accepter
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
