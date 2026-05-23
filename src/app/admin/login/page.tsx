"use client";

import { useActionState, useEffect, useState } from "react";
import { loginAdmin } from "@/lib/actions/auth";
import { Flower2, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAdmin, {});
  const [showPw, setShowPw] = useState(false);

  // Quand le Server Action retourne success:true, les cookies sont déjà dans le navigateur.
  // On fait un rechargement complet pour que le layout serveur les lise correctement.
  useEffect(() => {
    if (state.success) {
      window.location.href = "/admin";
    }
  }, [state.success]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#1F1F1F" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ backgroundColor: "#2D5016" }}>
            <Flower2 size={28} style={{ color: "#D4A574" }} />
          </div>
          <h1 className="font-heading font-bold text-2xl text-white">Florus Pocus</h1>
          <p className="text-sm mt-1" style={{ color: "#F5F5F5", opacity: 0.4 }}>Panneau d'administration</p>
        </div>

        <div className="rounded-2xl p-8 shadow-2xl" style={{ backgroundColor: "#2A2A2A" }}>
          <h2 className="font-heading font-bold text-lg text-white mb-6">Connexion</h2>

          {state.error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400 border border-red-500/20"
              style={{ backgroundColor: "rgba(239,68,68,0.1)" }}>
              {state.error}
            </div>
          )}

          {(pending || state.success) && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm border"
              style={{ backgroundColor: "rgba(45,80,22,0.2)", borderColor: "rgba(45,80,22,0.4)", color: "#a8d07a" }}>
              {state.success ? "Connexion réussie, redirection…" : "Vérification en cours…"}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: "#F5F5F5", opacity: 0.4 }}>Adresse courriel</label>
              <input
                id="email" name="email" type="email" required
                placeholder="info@floruspocus.com"
                className="w-full rounded-xl px-4 py-3 text-sm text-white border focus:outline-none transition-all"
                style={{ backgroundColor: "#1F1F1F", borderColor: "rgba(255,255,255,0.1)" }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: "#F5F5F5", opacity: 0.4 }}>Mot de passe</label>
              <div className="relative">
                <input
                  id="password" name="password" type={showPw ? "text" : "password"} required
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white border focus:outline-none transition-all pr-11"
                  style={{ backgroundColor: "#1F1F1F", borderColor: "rgba(255,255,255,0.1)" }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70 transition-opacity">
                  {showPw ? <EyeOff size={16} color="#F5F5F5" /> : <Eye size={16} color="#F5F5F5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={pending || state.success}
              className="w-full mt-2 font-heading font-semibold py-3.5 rounded-xl text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#2D5016" }}>
              {pending ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: "#F5F5F5", opacity: 0.2 }}>
          Réservé aux administrateurs autorisés
        </p>
      </div>
    </div>
  );
}
