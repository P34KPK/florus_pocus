"use client";

import { useActionState, useEffect } from "react";
import type { MangeMoiItem } from "@/types";
import type { MangeMoiState } from "@/lib/actions/mangeMoi";
import ImageUploader from "@/components/admin/ImageUploader";

interface Props {
  action: (prev: MangeMoiState, formData: FormData) => Promise<MangeMoiState>;
  item?: MangeMoiItem;
  onSuccess: () => void;
}

export default function MangeMoiForm({ action, item, onSuccess }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  const field = "block w-full border border-[#E0D5C8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2D5016] transition-colors";
  const label = "block text-xs font-semibold text-[#1A1A1A] opacity-60 mb-1 uppercase tracking-wide";

  return (
    <form action={formAction} className="space-y-4">
      {item && <input type="hidden" name="id" value={item.id} />}

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{state.error}</p>
      )}

      <div>
        <label className={label}>Nom du produit *</label>
        <input name="name" defaultValue={item?.name} required className={field} placeholder="Ex: Confiture de roses" />
      </div>

      <div>
        <label className={label}>Description</label>
        <textarea
          name="description"
          defaultValue={item?.description}
          rows={4}
          className={`${field} resize-none`}
          placeholder="Ingrédients, utilisation, histoire du produit..."
        />
      </div>

      <div>
        <ImageUploader
          name="image_url"
          folder="misc"
          currentUrl={item?.image_url}
          label="Photo du produit"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Ordre d&apos;affichage</label>
          <input
            name="sort_order"
            type="number"
            min="0"
            defaultValue={item?.sort_order ?? 0}
            className={field}
          />
        </div>
        <div className="flex items-end pb-1">
          <div className="flex items-center gap-3">
            <label className={label + " mb-0"}>Statut</label>
            <select name="active" defaultValue={item?.active !== false ? "true" : "false"}
              className="border border-[#E0D5C8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2D5016]">
              <option value="true">Visible</option>
              <option value="false">Masqué</option>
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full font-heading font-semibold py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: "#2D5016" }}
      >
        {pending ? "Enregistrement…" : item ? "Mettre à jour" : "Ajouter au catalogue"}
      </button>
    </form>
  );
}
