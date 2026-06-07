"use client";

import { useState } from "react";
import { Pencil, Eye } from "lucide-react";
import type { Page } from "@/types";
import Modal from "@/components/admin/Modal";
import PageForm from "./PageForm";

const SLUG_LABELS: Record<string, string> = {
  "hero":      "Page d'accueil (Hero)",
  "why-local": "Pourquoi local",
  "farm":      "La Ferme",
  "contact":   "Contact",
  "mange-moi": "Mange Moi",
};

const SLUG_PREVIEW_URLS: Record<string, string> = {
  "hero":      "/#hero",
  "why-local": "/#why-local",
  "farm":      "/la-ferme",
  "contact":   "/contact",
  "mange-moi": "/mange-moi",
};

interface Props { pages: Page[] }

export default function PagesClient({ pages }: Props) {
  const [editing, setEditing] = useState<Page | null>(null);

  return (
    <>
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-[#1A1A1A]">Pages</h1>
        <p className="text-sm opacity-50 mt-1">Modifiez le contenu des sections de la homepage</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E0D5C8] shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: "#F5F5F5" }}>
            <tr>
              {["Titre", "Slug", "Publié", "Actions"].map((h) => (
                <th key={h} className="text-left px-6 py-4 font-semibold opacity-50 uppercase tracking-wider text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0D5C8]">
            {pages.map((p) => (
              <tr key={p.slug} className="hover:bg-[#FAFAF8] transition-colors">
                <td className="px-6 py-4 font-medium">{SLUG_LABELS[p.slug] ?? p.title}</td>
                <td className="px-6 py-4">
                  <code className="text-xs px-2 py-0.5 rounded-md" style={{ backgroundColor: "#F0F5EC", color: "#2D5016" }}>{p.slug}</code>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${p.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {p.published ? "Publié" : "Brouillon"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditing(p)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-80 transition-all text-white"
                      style={{ backgroundColor: "#2D5016" }}
                    >
                      <Pencil size={12} /> Modifier
                    </button>
                    <a
                      href={SLUG_PREVIEW_URLS[p.slug] ?? `/#${p.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E0D5C8] hover:bg-[#F0F5EC] transition-all"
                    >
                      <Eye size={12} /> Aperçu
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={`Modifier — ${SLUG_LABELS[editing.slug] ?? editing.title}`} onClose={() => setEditing(null)} size="lg">
          <PageForm page={editing} onSuccess={() => setEditing(null)} />
        </Modal>
      )}
    </>
  );
}
