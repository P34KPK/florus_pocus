"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { MangeMoiItem } from "@/types";
import { createMangeMoiItem, updateMangeMoiItem, deleteMangeMoiItem } from "@/lib/actions/mangeMoi";
import MangeMoiForm from "./MangeMoiForm";
import Modal from "@/components/admin/Modal";

interface Props { items: MangeMoiItem[] }

export default function MangeMoiClient({ items }: Props) {
  const [open, setOpen] = useState<"create" | MangeMoiItem | null>(null);

  const close = useCallback(() => setOpen(null), []);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cet article ?")) return;
    await deleteMangeMoiItem(id);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl" style={{ color: "#2D5016" }}>Mange Moi</h1>
          <p className="text-sm opacity-60 mt-1">
            Gérez vos créations (photos et descriptions). Pour modifier le titre et le texte d&apos;intro de la page publique, allez dans <span className="font-semibold">Pages → Mange Moi</span>.
          </p>
        </div>
        <button
          onClick={() => setOpen("create")}
          className="flex items-center gap-2 font-heading font-semibold px-4 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90"
          style={{ backgroundColor: "#2D5016" }}
        >
          <Plus size={16} /> Ajouter un article
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border-2 border-dashed border-[#E0D5C8]">
          <p className="font-heading text-lg opacity-50">Aucun article pour l&apos;instant.</p>
          <button
            onClick={() => setOpen("create")}
            className="mt-4 text-sm font-semibold underline"
            style={{ color: "#2D5016" }}
          >
            Ajouter le premier article
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-[#E0D5C8] overflow-hidden shadow-sm">
              <div className="aspect-[4/3] relative" style={{ backgroundColor: "#F0F5EC" }}>
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="33vw" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-20">
                    <svg viewBox="0 0 60 60" width="60" height="60">
                      {[0,60,120,180,240,300].map((d) => (
                        <ellipse key={d} cx="30" cy="30" rx="7" ry="16" fill="#D4A574" transform={`rotate(${d} 30 30)`} />
                      ))}
                      <circle cx="30" cy="30" r="7" fill="#F4D4B0" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => setOpen(item)}
                    className="p-1.5 rounded-lg bg-white shadow border border-[#E0D5C8] hover:bg-[#F0F5EC] transition-colors"
                  >
                    <Pencil size={13} style={{ color: "#2D5016" }} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg bg-white shadow border border-[#E0D5C8] hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} className="text-red-500" />
                  </button>
                </div>
                {!item.active && (
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-800/70 text-white">
                    Masqué
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-heading font-bold text-base mb-1">{item.name}</h3>
                {item.description && (
                  <p className="text-sm line-clamp-2 opacity-60">{item.description}</p>
                )}
                <p className="text-xs mt-2 opacity-40">Ordre : {item.sort_order}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {open === "create" && (
        <Modal title="Nouvel article" onClose={close}>
          <MangeMoiForm action={createMangeMoiItem} onSuccess={close} />
        </Modal>
      )}
      {open && open !== "create" && (
        <Modal title="Modifier l'article" onClose={close}>
          <MangeMoiForm action={updateMangeMoiItem} item={open} onSuccess={close} />
        </Modal>
      )}
    </div>
  );
}
