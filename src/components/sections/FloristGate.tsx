"use client";

import { useActionState } from "react";
import { verifyFloristCode, type FloristState } from "@/lib/actions/florist";
import { Lock } from "lucide-react";

export default function FloristGate({ email = "info@floruspocus.com" }: { email?: string }) {
  const [state, formAction, pending] = useActionState<FloristState, FormData>(verifyFloristCode, {});

  return (
    <main className="min-h-screen flex items-center justify-center pt-16 pb-24 px-4"
      style={{ backgroundColor: "#FAFAF8" }}>
      <div className="w-full max-w-md">
        {/* Icône */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: "#F0F5EC" }}>
            <Lock size={28} style={{ color: "#2D5016" }} />
          </div>
        </div>

        {/* Titre */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-3" style={{ color: "#D4A574" }}>
            Espace professionnel
          </p>
          <h1 className="font-display font-bold mb-3" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: "#2D5016" }}>
            Accès fleuristes
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "#666" }}>
            Cet espace est réservé aux fleuristes partenaires.<br />
            Entrez votre code d&apos;accès pour voir notre catalogue professionnel.
          </p>
        </div>

        {/* Formulaire */}
        <form action={formAction} className="space-y-4">
          <div>
            <input
              name="code"
              type="password"
              required
              placeholder="Code d'accès"
              className="block w-full border border-[#E0D5C8] rounded-xl px-4 py-3 text-base text-center tracking-widest focus:outline-none focus:border-[#2D5016] transition-colors"
              style={{ backgroundColor: "#fff", letterSpacing: "0.2em" }}
            />
          </div>

          {state.error && (
            <p className="text-sm text-red-600 text-center">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full font-heading font-semibold py-3 rounded-xl text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#2D5016" }}
          >
            {pending ? "Vérification…" : "Accéder au catalogue"}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: "#bbb" }}>
          Vous n&apos;avez pas de code ? Contactez-nous à{" "}
          <a href={`mailto:${email}`} style={{ color: "#2D5016" }}>{email}</a>
        </p>
      </div>
    </main>
  );
}
