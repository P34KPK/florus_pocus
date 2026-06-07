"use client";

import { useState } from "react";
import { Download, Mail, Search, Users } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  source: string;
  created_at: string;
}

const SOURCE_LABEL: Record<string, string> = {
  contact: "Formulaire contact",
  popup:   "Popup boutique",
};

export default function InfolettrClient({ subscribers }: { subscribers: Subscriber[] }) {
  const [search, setSearch] = useState("");

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const fromContact = subscribers.filter((s) => s.source === "contact").length;
  const fromPopup   = subscribers.filter((s) => s.source === "popup").length;

  function downloadCSV() {
    const header = "Courriel,Source,Date d'inscription";
    const rows = subscribers.map((s) => {
      const date = new Date(s.created_at).toLocaleDateString("fr-CA");
      const source = SOURCE_LABEL[s.source] ?? s.source;
      return `"${s.email}","${source}","${date}"`;
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `infolettre_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-4xl">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl mb-1" style={{ color: "#2D5016" }}>
            Infolettre
          </h1>
          <p className="text-sm opacity-60">Abonnés inscrits via le site</p>
        </div>
        <button
          onClick={downloadCSV}
          disabled={subscribers.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: "#2D5016" }}
        >
          <Download size={15} />
          Télécharger .csv
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total abonnés",      value: subscribers.length, icon: Users },
          { label: "Via formulaire contact", value: fromContact,    icon: Mail  },
          { label: "Via popup boutique",     value: fromPopup,      icon: Mail  },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#E0D5C8] px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(45,80,22,0.08)" }}>
              <Icon size={18} style={{ color: "#2D5016" }} />
            </div>
            <div>
              <p className="font-heading font-bold text-2xl leading-none" style={{ color: "#2D5016" }}>{value}</p>
              <p className="text-xs opacity-50 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recherche */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-30" />
        <input
          type="search"
          placeholder="Rechercher un courriel…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E0D5C8] text-sm focus:outline-none focus:border-[#2D5016] bg-white transition-colors"
        />
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 opacity-40">
          <Users size={40} className="mx-auto mb-3" />
          <p className="text-sm">{search ? "Aucun résultat" : "Aucun abonné pour l'instant"}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E0D5C8] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E0D5C8]" style={{ backgroundColor: "#F9F7F4" }}>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide opacity-50">Courriel</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide opacity-50">Source</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide opacity-50">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D5C8]">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-5 py-3.5 font-medium">{s.email}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: s.source === "popup" ? "rgba(212,165,116,0.15)" : "rgba(45,80,22,0.08)",
                        color:           s.source === "popup" ? "#9A6A30" : "#2D5016",
                      }}>
                      {SOURCE_LABEL[s.source] ?? s.source}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 opacity-50">
                    {new Date(s.created_at).toLocaleDateString("fr-CA", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length < subscribers.length && (
            <div className="px-5 py-3 border-t border-[#E0D5C8] text-xs opacity-40 text-right">
              {filtered.length} résultat{filtered.length > 1 ? "s" : ""} sur {subscribers.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
