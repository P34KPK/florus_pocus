"use client";

import { useActionState, useEffect } from "react";
import type { Page } from "@/types";
import type { PageFormState } from "@/lib/actions/pages";
import { updatePage } from "@/lib/actions/pages";
import ImageUploader from "@/components/admin/ImageUploader";

interface Props {
  page: Page;
  onSuccess: () => void;
}

export default function PageForm({ page, onSuccess }: Props) {
  const [state, formAction, pending] = useActionState(updatePage, {});

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  const field = "block w-full border border-[#E0D5C8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2D5016] transition-colors";
  const label = "block text-xs font-semibold text-[#1A1A1A] opacity-60 mb-1 uppercase tracking-wide";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={page.id} />

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{state.error}</p>
      )}

      <div>
        <label className={label}>Titre *</label>
        <input name="title" defaultValue={page.title} required className={field} />
      </div>

      <div>
        <label className={label}>Description *</label>
        <textarea name="description" defaultValue={page.description} required rows={5} className={`${field} resize-none`} />
      </div>

      <div>
        <ImageUploader
          name="featured_image_url"
          folder="pages"
          currentUrl={page.featured_image_url}
          label="Image principale"
        />
      </div>

      <div>
        <label className={label}>Meta description (SEO — max 160 car.)</label>
        <textarea name="meta_description" defaultValue={page.meta_description ?? ""} rows={2} maxLength={160} className={`${field} resize-none`} />
      </div>

      <div className="flex items-center gap-3">
        <label className={label + " mb-0"}>Statut</label>
        <select name="published" defaultValue={page.published ? "true" : "false"} className="border border-[#E0D5C8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2D5016]">
          <option value="true">Publié</option>
          <option value="false">Brouillon</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full font-heading font-semibold py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: "#2D5016" }}
      >
        {pending ? "Enregistrement…" : "Mettre à jour"}
      </button>
    </form>
  );
}
