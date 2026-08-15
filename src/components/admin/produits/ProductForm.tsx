"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { X, Plus } from "lucide-react";
import type { Product } from "@/types";
import type { ProductFormState } from "@/lib/actions/products";
import ImageUploader from "@/components/admin/ImageUploader";

interface Props {
  action: (prev: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  product?: Product;
  onSuccess: () => void;
}

const MAX_IMAGES = 5;

const CATEGORY_SUGGESTIONS = [
  "Fleurs Fraîches", "Bouquets", "Roses", "Vivaces", "Comestibles",
  "Serre Inter-Ligna", "La Garde-Robe", "Séchées", "Couronnes",
];

export default function ProductForm({ action, product, onSuccess }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [priceType, setPriceType]   = useState<"fixed" | "devis">(product?.price_type ?? "fixed");
  // Par défaut on ne suit pas l'inventaire : un 0 saisi par inadvertance ne doit
  // plus pouvoir retirer un produit de la vente à l'insu du gestionnaire.
  const [trackInventory, setTrackInventory] = useState<boolean>(product?.track_inventory ?? false);

  // Galerie d'images — initialisée depuis product.images ou image_url existant
  const initialImages: string[] = product?.images && product.images.length > 0
    ? product.images.map((i) => i.image_url)
    : product?.image_url ? [product.image_url] : [];
  const [images, setImages] = useState<string[]>(initialImages);
  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleUploaded(url: string) {
    setImages((prev) => [...prev, url]);
    setShowUploader(false);
  }

  const field = "block w-full border border-[#E0D5C8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2D5016] transition-colors";
  const label = "block text-xs font-semibold text-[#1A1A1A] opacity-60 mb-1 uppercase tracking-wide";

  return (
    <form action={formAction} className="space-y-4">
      {product && <input type="hidden" name="id" value={product.id} />}
      {/* Sérialisation des images */}
      <input type="hidden" name="images_json" value={JSON.stringify(images)} />

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
          <label className={label}>Catégorie (filtre boutique)</label>
          <input name="season" list="category-suggestions" defaultValue={product?.season ?? ""}
            className={field} placeholder="Ex: Fleurs Fraîches, Bouquets…" />
          <datalist id="category-suggestions">
            {CATEGORY_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
          </datalist>
        </div>

        <div>
          <label className={label}>Type de prix *</label>
          <select name="price_type" value={priceType}
            onChange={(e) => setPriceType(e.target.value as "fixed" | "devis")} className={field}>
            <option value="fixed">Prix fixe</option>
            <option value="devis">Sur devis / soumission</option>
          </select>
        </div>

        {priceType === "fixed" ? (
          <div>
            <label className={label}>Prix public ($) *</label>
            <input name="price" type="number" step="0.01" min="0" defaultValue={product?.price}
              required className={field} placeholder="0.00" />
          </div>
        ) : (
          <div className="flex items-center px-3 py-2 rounded-xl text-sm border border-[#E0D5C8] bg-[#FAFAF8] opacity-60">
            Prix affiché sur devis — pas de montant requis
          </div>
        )}

        <div>
          <label className={label}>Prix fleuriste ($)</label>
          <input name="florist_price" type="number" step="0.01" min="0"
            defaultValue={product?.florist_price ?? ""} className={field}
            placeholder="Optionnel — prix de gros" />
        </div>

        <div>
          <label className={label}>Inventaire</label>
          <div className="flex items-center gap-3 h-[42px]">
            <button
              type="button"
              onClick={() => setTrackInventory((v) => !v)}
              aria-pressed={trackInventory}
              className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
              style={{ backgroundColor: trackInventory ? "#2D5016" : "#E0D5C8" }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                style={{ left: trackInventory ? 22 : 2 }}
              />
            </button>
            <span className="text-sm" style={{ color: trackInventory ? "#2D5016" : "#888" }}>
              {trackInventory ? "Suivre les quantités" : "Toujours disponible"}
            </span>
          </div>
          <input type="hidden" name="track_inventory" value={trackInventory ? "true" : "false"} />
          <p className="text-xs mt-1.5" style={{ color: "#888" }}>
            {trackInventory
              ? "Le produit s'affichera « Épuisé » et ne pourra plus être commandé quand la quantité tombe à 0."
              : "Le produit reste commandable en tout temps — aucune quantité à tenir à jour."}
          </p>
        </div>

        {trackInventory && (
          <div>
            <label className={label}>Quantité en stock</label>
            <input name="stock" type="number" min="0" defaultValue={product?.stock ?? ""}
              className={field} placeholder="0" />
            <p className="text-xs mt-1.5" style={{ color: "#888" }}>
              0 = épuisé, retiré de la vente.
            </p>
          </div>
        )}

        <div className="col-span-2">
          <label className={label}>Description *</label>
          <textarea name="description" defaultValue={product?.description} required rows={3}
            className={`${field} resize-none`} placeholder="Description du produit..." />
        </div>

        {/* ── Galerie d'images ── */}
        <div className="col-span-2">
          <label className={label}>
            Photos ({images.length}/{MAX_IMAGES})
            {images.length > 0 && (
              <span className="ml-2 normal-case font-normal text-[#888]">— la 1re est la photo principale</span>
            )}
          </label>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-3">
              {images.map((url, idx) => (
                <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden group"
                  style={{ border: idx === 0 ? "2px solid #2D5016" : "1px solid #E0D5C8" }}>
                  <Image src={url} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                  {idx === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 text-[9px] font-bold text-center py-0.5"
                      style={{ backgroundColor: "rgba(45,80,22,0.8)", color: "#fff" }}>
                      Principale
                    </span>
                  )}
                  <button type="button" onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: "rgba(0,0,0,0.65)" }}>
                    <X size={10} color="#fff" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {images.length < MAX_IMAGES && (
            showUploader ? (
              <div className="border border-dashed border-[#E0D5C8] rounded-xl p-3">
                <ImageUploader
                  name="_temp_image"
                  folder="products"
                  label="Téléverser une photo"
                  onUploadedUrl={handleUploaded}
                />
                <button type="button" onClick={() => setShowUploader(false)}
                  className="mt-2 text-xs text-[#888] hover:text-[#555] transition-colors">
                  Annuler
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setShowUploader(true)}
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border border-dashed border-[#E0D5C8] hover:border-[#2D5016] hover:text-[#2D5016] transition-all"
                style={{ color: "#888" }}>
                <Plus size={15} />
                {images.length === 0 ? "Ajouter une photo" : "Ajouter une autre photo"}
              </button>
            )
          )}
        </div>

        <div className="col-span-2 flex items-center gap-3">
          <label className={label + " mb-0"}>Statut</label>
          <select name="active" defaultValue={product?.active !== false ? "true" : "false"}
            className="border border-[#E0D5C8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2D5016]">
            <option value="true">Actif</option>
            <option value="false">Inactif</option>
          </select>
        </div>

        <div className="col-span-2 flex items-start gap-3 p-4 rounded-xl border border-[#D4A574] bg-[#FFF8F0]">
          <input type="checkbox" name="florist_only" id="florist_only" value="true"
            defaultChecked={product?.florist_only === true}
            className="mt-0.5 w-4 h-4 accent-[#2D5016] flex-shrink-0" />
          <div>
            <label htmlFor="florist_only" className="block text-sm font-semibold" style={{ color: "#2D5016" }}>
              Réservé aux fleuristes membres
            </label>
            <p className="text-xs mt-0.5" style={{ color: "#888" }}>
              Ce produit ne sera PAS visible dans la boutique grand public — uniquement dans l&apos;espace fleuristes.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={pending}
          className="flex-1 font-heading font-semibold py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "#2D5016" }}>
          {pending ? "Enregistrement…" : product ? "Mettre à jour" : "Créer le produit"}
        </button>
      </div>
    </form>
  );
}
