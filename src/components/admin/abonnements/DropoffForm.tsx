"use client";

import { useActionState, useEffect } from "react";
import type { SubFormState } from "@/lib/actions/subscriptions";
import { createDropoffPoint } from "@/lib/actions/subscriptions";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

interface Props {
  subscriptionId: string;
  onSuccess: () => void;
}

export default function DropoffForm({ subscriptionId, onSuccess }: Props) {
  const [state, formAction, pending] = useActionState(createDropoffPoint, {} as SubFormState);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  const field = "block w-full border border-[#E0D5C8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2D5016] transition-colors";
  const label = "block text-xs font-semibold text-[#1A1A1A] opacity-60 mb-1 uppercase tracking-wide";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="subscription_id" value={subscriptionId} />

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{state.error}</p>
      )}

      <div>
        <label className={label}>Nom du point de chute *</label>
        <input name="name" required className={field} placeholder="Ex: Marché Jean-Talon" />
      </div>

      <div>
        <label className={label}>Adresse *</label>
        <input name="address" required className={field} placeholder="Ex: 7075 Av Casgrain, Montréal" />
      </div>

      <div>
        <label className={label}>Jours disponibles *</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {DAYS.map((day, i) => (
            <label key={i} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="checkbox" name="days_available" value={String(i)} className="w-4 h-4 rounded accent-[#2D5016]" />
              {day}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Heure ouverture *</label>
          <input name="hours_start" type="time" required defaultValue="09:00" className={field} />
        </div>
        <div>
          <label className={label}>Heure fermeture *</label>
          <input name="hours_end" type="time" required defaultValue="17:00" className={field} />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full font-heading font-semibold py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: "#2D5016" }}
      >
        {pending ? "Enregistrement…" : "Ajouter le point de chute"}
      </button>
    </form>
  );
}
