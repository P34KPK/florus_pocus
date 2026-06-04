"use client";

import { useActionState, useEffect } from "react";
import type { Subscription } from "@/types";
import type { SubFormState } from "@/lib/actions/subscriptions";

interface Props {
  action: (prev: SubFormState, formData: FormData) => Promise<SubFormState>;
  subscription?: Subscription;
  onSuccess: () => void;
}

const FREQS = [
  { value: "1x_month", label: "1×/mois" },
  { value: "2x_month", label: "2×/mois" },
  { value: "4x_month", label: "4×/mois" },
];

export default function SubscriptionForm({ action, subscription, onSuccess }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  const field = "block w-full border border-[#E0D5C8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2D5016] transition-colors";
  const label = "block text-xs font-semibold text-[#1A1A1A] opacity-60 mb-1 uppercase tracking-wide";

  return (
    <form action={formAction} className="space-y-4">
      {subscription && <input type="hidden" name="id" value={subscription.id} />}

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{state.error}</p>
      )}

      <div>
        <label className={label}>Nom de la formule *</label>
        <input name="name" defaultValue={subscription?.name} required className={field} placeholder="Ex: Petit Bouquet" />
      </div>

      <div>
        <label className={label}>Description *</label>
        <textarea name="description" defaultValue={subscription?.description} required rows={3} className={`${field} resize-none`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Prix par bouquet ($) *</label>
          <input name="price" type="number" step="0.01" min="0" defaultValue={subscription?.price} required className={field} placeholder="Ex: 45.00" />
        </div>
        <div>
          <label className={label}>Format *</label>
          <select name="format" defaultValue={subscription?.format ?? "Moyen"} required className={field}>
            <option value="Petit">Petit</option>
            <option value="Moyen">Moyen</option>
            <option value="Grand">Grand</option>
            <option value="XL">XL</option>
          </select>
        </div>
      </div>

      <div>
        <label className={label}>Fréquences disponibles *</label>
        <div className="flex gap-3 mt-1 flex-wrap">
          {FREQS.map((f) => (
            <label key={f.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                name="frequencies"
                value={f.value}
                defaultChecked={subscription?.frequencies?.includes(f.value as never) ?? false}
                className="w-4 h-4 rounded accent-[#2D5016]"
              />
              {f.label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className={label + " mb-0"}>Statut</label>
        <select name="active" defaultValue={subscription?.active !== false ? "true" : "false"} className="border border-[#E0D5C8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2D5016]">
          <option value="true">Actif</option>
          <option value="false">Inactif</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full font-heading font-semibold py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: "#2D5016" }}
      >
        {pending ? "Enregistrement…" : subscription ? "Mettre à jour" : "Créer la formule"}
      </button>
    </form>
  );
}
