import { Download } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Statistiques" };

const TIMEFRAMES = ["Semaine", "Mois", "Année", "Personnalisé"];

const REPORTS = [
  { label: "Rapport mensuel",        format: "PDF", icon: "📄" },
  { label: "Liste clients/emails",   format: "CSV", icon: "👥" },
  { label: "Inventaire (stock)",     format: "CSV", icon: "📦" },
  { label: "Abonnements actifs",     format: "CSV", icon: "🔄" },
  { label: "Autocueillette",         format: "CSV", icon: "🌻" },
];

export default function AdminStatsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl">Statistiques</h1>
          <p className="text-sm opacity-50 mt-1">Analyse et rapports de performance</p>
        </div>
        {/* Timeframe selector */}
        <div className="flex bg-white border border-[#E0D5C8] rounded-xl overflow-hidden shadow-sm">
          {TIMEFRAMES.map((t) => (
            <button key={t} className={`px-4 py-2 text-xs font-semibold transition-all ${t === "Mois" ? "text-white" : "hover:bg-[#F0F5EC]"}`}
              style={t === "Mois" ? { backgroundColor: "#2D5016" } : {}}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Charts placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E0D5C8] shadow-sm p-6">
          <h2 className="font-heading font-semibold mb-4">Revenus</h2>
          <div className="h-56 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#F0F5EC" }}>
            <p className="text-sm opacity-40">Graphique ligne — disponible Phase 3</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E0D5C8] shadow-sm p-6">
          <h2 className="font-heading font-semibold mb-4">Par catégorie</h2>
          <div className="h-56 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FDF5EC" }}>
            <p className="text-sm opacity-40">Camembert — Phase 3</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-[#E0D5C8] shadow-sm p-6">
          <h2 className="font-heading font-semibold mb-4">Top produits vendus</h2>
          <div className="h-48 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#F0F5EC" }}>
            <p className="text-sm opacity-40">Barres — Phase 3</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E0D5C8] shadow-sm p-6">
          <h2 className="font-heading font-semibold mb-4">Présence autocueillette</h2>
          <div className="h-48 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FDF5EC" }}>
            <p className="text-sm opacity-40">Barres — Phase 3</p>
          </div>
        </div>
      </div>

      {/* Reports download */}
      <div className="bg-white rounded-2xl border border-[#E0D5C8] shadow-sm p-6">
        <h2 className="font-heading font-semibold mb-4">Rapports téléchargeables</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {REPORTS.map((r) => (
            <button key={r.label}
              className="flex items-center gap-3 p-4 rounded-xl border border-[#E0D5C8] hover:bg-[#F0F5EC] transition-all text-left group">
              <span className="text-2xl">{r.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{r.label}</p>
                <p className="text-xs opacity-40">{r.format}</p>
              </div>
              <Download size={14} className="opacity-30 group-hover:opacity-70 transition-opacity flex-shrink-0" />
            </button>
          ))}
        </div>
        <p className="text-xs opacity-30 mt-4">Les exports seront disponibles en Phase 3</p>
      </div>
    </div>
  );
}
