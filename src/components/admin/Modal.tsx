"use client";

import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const widths = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl" };

const CONFIRM_MSG = "Des modifications non enregistrées seront perdues. Fermer quand même ?";

export default function Modal({ title, onClose, children, size = "md" }: Props) {
  // « dirty » = l'utilisateur a saisi/modifié quelque chose dans le formulaire
  const [dirty, setDirty] = useState(false);

  // Fermeture protégée : confirme seulement si du contenu a été édité
  const requestClose = useCallback(() => {
    if (dirty && !window.confirm(CONFIRM_MSG)) return;
    onClose();
  }, [dirty, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") requestClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [requestClose]);

  // Marque le formulaire comme modifié dès la première saisie
  const markDirty = useCallback(() => setDirty(true), []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      // Clic sur le fond : NE ferme PAS (évite la perte de contenu par accident)
      onClick={(e) => { if (e.target === e.currentTarget) e.stopPropagation(); }}
    >
      <div className={`bg-white rounded-2xl shadow-xl w-full ${widths[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0D5C8]">
          <h2 className="font-heading font-bold text-lg text-[#1A1A1A]">{title}</h2>
          <button onClick={requestClose} className="p-1.5 rounded-lg hover:bg-[#F0F5EC] transition-colors" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        <div
          className="overflow-y-auto flex-1 px-6 py-5"
          onInput={markDirty}
          onChange={markDirty}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
