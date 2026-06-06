"use client";

import { useActionState, useEffect, useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { changeAdminPassword } from "@/lib/actions/account";
import type { PasswordFormState } from "@/lib/actions/account";

export default function PasswordForm() {
  const [state, formAction, pending] = useActionState<PasswordFormState, FormData>(
    changeAdminPassword,
    {}
  );
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);

  const field = "w-full border border-[#E0D5C8] rounded-xl px-3 py-2 pr-10 text-sm focus:outline-none focus:border-[#2D5016] transition-colors";

  useEffect(() => {
    if (state.success) {
      const form = document.getElementById("password-form") as HTMLFormElement | null;
      form?.reset();
    }
  }, [state.success]);

  return (
    <form id="password-form" action={formAction} className="space-y-4">
      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          {state.error}
        </p>
      )}
      {state.success && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
          <CheckCircle size={15} />
          Mot de passe mis à jour avec succès.
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide opacity-60 mb-1">
          Mot de passe actuel
        </label>
        <div className="relative">
          <input
            name="current_password"
            type={showCurrent ? "text" : "password"}
            required
            autoComplete="current-password"
            className={field}
          />
          <button
            type="button"
            onClick={() => setShowCurrent((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70"
          >
            {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide opacity-60 mb-1">
          Nouveau mot de passe
        </label>
        <div className="relative">
          <input
            name="new_password"
            type={showNew ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            className={field}
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70"
          >
            {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <p className="text-xs opacity-40 mt-1">Minimum 8 caractères</p>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide opacity-60 mb-1">
          Confirmer le nouveau mot de passe
        </label>
        <input
          name="confirm_password"
          type="password"
          required
          autoComplete="new-password"
          className={field}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-2 font-heading font-semibold px-5 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: "#2D5016" }}
      >
        <Lock size={14} />
        {pending ? "Mise à jour…" : "Changer le mot de passe"}
      </button>
    </form>
  );
}
