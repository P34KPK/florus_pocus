"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import type { Product } from "@/types";
import { isSoldOut } from "@/lib/inventory";
import Modal from "@/components/admin/Modal";
import ProductForm from "./ProductForm";
import { createProduct, updateProduct, deleteProduct, toggleProductActive } from "@/lib/actions/products";

interface Props { products: Product[] }

export default function ProductsClient({ products }: Props) {
  const [open, setOpen] = useState<"create" | Product | null>(null);
  const [, startTransition] = useTransition();

  function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer "${name}" ? Cette action est irréversible.`)) return;
    startTransition(async () => { await deleteProduct(id); });
  }

  function handleToggle(id: string, active: boolean) {
    startTransition(async () => { await toggleProductActive(id, active); });
  }

  const seasonLabel: Record<string, string> = {
    "fleurs-fraiches":   "Fleurs Fraîches",
    "comestibles":       "Produits Floraux Comestibles",
    "serre-inter-ligna": "Serre Inter-Ligna",
    "garde-robe":        "La Garde-Robe du Jardinier",
  };

  const catLabel = (c: string) => c === "fleur" ? "Fleur" : "Transformé";
  const catColors = (c: string) => c === "fleur"
    ? { backgroundColor: "#E8F0E0", color: "#2D5016" }
    : { backgroundColor: "#FDF5EC", color: "#D4A574" };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#1A1A1A]">Produits</h1>
          <p className="text-sm text-[#1A1A1A] opacity-50 mt-1">Gérez votre catalogue ({products.length} produit{products.length !== 1 ? "s" : ""})</p>
        </div>
        <button
          onClick={() => setOpen("create")}
          className="flex items-center gap-2 font-heading font-semibold px-5 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90"
          style={{ backgroundColor: "#2D5016" }}
        >
          <Plus size={16} /> Nouveau produit
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E0D5C8] shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <div className="text-center py-16 opacity-40">
            <p className="font-heading font-semibold text-lg">Aucun produit</p>
            <p className="text-sm mt-1">Créez votre premier produit pour commencer.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: "#F5F5F5" }}>
                <tr>
                  {["Produit", "Catégorie", "Prix", "Stock", "Statut", "Actions"].map((h) => (
                    <th key={h} className="text-left px-6 py-4 font-semibold text-[#1A1A1A] opacity-50 uppercase tracking-wider text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D5C8]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <Image src={p.image_url} alt={p.name} width={40} height={40} className="rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#F0F5EC" }}>
                            <svg viewBox="0 0 60 60" width="24" height="24" aria-hidden>
                              {[0,72,144,216,288].map((deg) => (
                                <ellipse key={deg} cx="30" cy="30" rx="7" ry="16" fill="#D4A574" opacity="0.5" transform={`rotate(${deg} 30 30)`} />
                              ))}
                              <circle cx="30" cy="30" r="7" fill="#F4D4B0" opacity="0.8" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <span className="font-medium">{p.name}</span>
                          {p.season && <span className="ml-2 text-xs opacity-40">{seasonLabel[p.season] ?? p.season}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={catColors(p.category)}>{catLabel(p.category)}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold">{p.price.toFixed(2)} $</td>
                    <td className="px-6 py-4">
                      {!p.track_inventory ? (
                        <span className="text-xs opacity-40" title="Inventaire non suivi — toujours disponible">∞</span>
                      ) : isSoldOut(p) ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-red-600 bg-red-100"
                          title="Affiché « Épuisé » — ce produit ne peut pas être commandé">
                          0 · Épuisé
                        </span>
                      ) : (
                        <span className="font-medium">{p.stock}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${p.active ? "text-green-700 bg-green-100" : "text-red-600 bg-red-100"}`}>
                        {p.active ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setOpen(p)} className="p-1.5 rounded-lg hover:bg-[#F0F5EC] transition-colors" title="Modifier">
                          <Pencil size={15} style={{ color: "#2D5016" }} />
                        </button>
                        <button onClick={() => handleToggle(p.id, p.active)} className="p-1.5 rounded-lg hover:bg-[#F0F5EC] transition-colors" title={p.active ? "Désactiver" : "Activer"}>
                          {p.active ? <ToggleRight size={15} style={{ color: "#2D5016" }} /> : <ToggleLeft size={15} className="opacity-40" />}
                        </button>
                        <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Supprimer">
                          <Trash2 size={15} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open === "create" && (
        <Modal title="Nouveau produit" onClose={() => setOpen(null)}>
          <ProductForm action={createProduct} onSuccess={() => setOpen(null)} />
        </Modal>
      )}

      {open && open !== "create" && (
        <Modal title={`Modifier — ${open.name}`} onClose={() => setOpen(null)}>
          <ProductForm action={updateProduct} product={open} onSuccess={() => setOpen(null)} />
        </Modal>
      )}
    </>
  );
}
