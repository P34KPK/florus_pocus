"use client";

import { useActionState, useEffect } from "react";
import type { AutocueilletteEvent } from "@/types";
import type { EventFormState } from "@/lib/actions/events";

interface Props {
  action: (prev: EventFormState, formData: FormData) => Promise<EventFormState>;
  event?: AutocueilletteEvent;
  onSuccess: () => void;
}

export default function EventForm({ action, event, onSuccess }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  const field = "block w-full border border-[#E0D5C8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2D5016] transition-colors";
  const label = "block text-xs font-semibold text-[#1A1A1A] opacity-60 mb-1 uppercase tracking-wide";

  return (
    <form action={formAction} className="space-y-4">
      {event && <input type="hidden" name="id" value={event.id} />}

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{state.error}</p>
      )}

      <div>
        <label className={label}>Date de l'événement *</label>
        <input name="event_date" type="date" defaultValue={event?.event_date} required className={field} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Capacité (places) *</label>
          <input name="capacity" type="number" min="1" defaultValue={event?.capacity} required className={field} />
        </div>
        <div>
          <label className={label}>Prix/billet ($) *</label>
          <input name="price_per_ticket" type="number" step="0.01" min="0" defaultValue={event?.price_per_ticket} required className={field} />
        </div>
      </div>

      <div>
        <label className={label}>Description</label>
        <textarea name="description" defaultValue={event?.description ?? ""} rows={3} className={`${field} resize-none`} placeholder="Détails de l'événement..." />
      </div>

      <div className="flex items-center gap-3">
        <label className={label + " mb-0"}>Statut</label>
        <select name="active" defaultValue={event?.active !== false ? "true" : "false"} className="border border-[#E0D5C8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2D5016]">
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
        {pending ? "Enregistrement…" : event ? "Mettre à jour" : "Créer la date"}
      </button>
    </form>
  );
}
