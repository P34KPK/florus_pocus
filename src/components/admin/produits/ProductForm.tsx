"use client";

import { useActionState, useEffect } from "react";
import type { Product } from "@/types";
import type { ProductFormState } from "@/lib/actions/products";
import ImageUploader from "@/components/admin/ImageUploader";

interface Props {
  action: (prev: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  product?: Product;
  onSuccess: () => void;
}

const SEASONS = [
  { value: "fleurs-fraiches",    label: "Fleurs Fraîches" },
  { value: "comestibles",        label: "Produits Floraux Comestibles" },
  { value: "serre-inter-ligna",  label: "Serre Inter-Ligna" },
  { value: "garde-robe",         label: "La Garde-Robe du Jardinier" },
];

export default function ProductForm({ action, product, onSuccess }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  const field = "block w-full border border-[#E0D5C8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2D5016] transition-colors";
  const label = "block text-xs font-semibold text-[#1A1A1A] opacity-60 mb-1 uppercase tracking-wide";

  return (
    <form action={formAction} className="space-y-4">
      {product && <input type="hidden" name="id" value={product.id} />}

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{state.error}</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={label}>Nom du produit *</label>
          <input name="name" defaultValue={product?.name} required className={field} placeholder="Ex: Rose Rouge" />
        </div>

        <div>
          <label className={label}>Catégorie *</label>
          <select name="category" defaultValue={product?.category ?? "fleur"} className={field}>
            <option value="fleur">Fleur coupée</option>
            <option value="transforme">Produit transformé</option>
          </select>
        </div>

        <div>
          <label className={label}>Saison</label>
          <select name="season" defaultValue={product?.season ?? ""} className={field}>
            <option value="">Toutes saisons</option>
            {SEASONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div>
          <label className={label}>Prix ($) *</label>
          <input name="price" type="number" step="0.01" min="0" defaultValue={product?.price} required className={field} placeholder="0.00" />
        </div>

        <div>
          <label className={label}>Stock</label>
          <input name="stock" type="number" min="0" defaultValue={product?.stock ?? ""} className={field} placeholder="Laissez vide si illimité" />
        </div>

        <div className="col-span-2">
          <label className={label}>Description *</label>
          <textarea name="description" defaultValue={product?.description} required rows={3} className={`${field} resize-none`} placeholder="Description du produit..." />
        </div>

        <div className="col-span-2">
          <ImageUploader
            name="image_url"
            folder="products"
            currentUrl={product?.image_url}
            label="Image du produit"
          />
        </div>

        <div className="col-span-2 flex items-center gap-3">
          <label className={label + " mb-0"}>Statut</label>
          <select name="active" defaultValue={product?.active !== false ? "true" : "false"} className="border border-[#E0D5C8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2D5016]">
            <option value="true">Actif</option>
            <option value="false">Inactif</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 font-heading font-semibold py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "#2D5016" }}
        >
          {pending ? "Enregistrement…" : product ? "Mettre à jour" : "Créer le produit"}
        </button>
      </div>
    </form>
  );
}
