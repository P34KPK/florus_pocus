import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-server";
import { Download } from "lucide-react";

export const metadata: Metadata = { title: "Statistiques" };

const TIMEFRAMES = ["Semaine", "Mois", "Année", "Personnalisé"];

const REPORTS = [
  { label: "Rapport mensuel",      format: "PDF", icon: "📄" },
  { label: "Liste clients/emails", format: "CSV", icon: "👥" },
  { label: "Inventaire (stock)",   format: "CSV", icon: "📦" },
  { label: "Abonnements actifs",   format: "CSV", icon: "🔄" },
  { label: "Autocueillette",       format: "CSV", icon: "🌻" },
];

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function formatPath(path: string) {
  if (path === "/") return "Accueil";
  return path.replace(/^\//, "").replace(/-/g, " ").replace(/\//g, " › ") || path;
}

export default async function AdminStatsPage() {
  const supabase = createAdminClient();

  const [
    resToday,
    resWeek,
    resMonth,
    { data: viewsChart },
    { data: viewsTop },
  ] = await Promise.all([
    supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", todayStart()),
    supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", daysAgo(7)),
    supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", daysAgo(30)),
    supabase.from("page_views").select("created_at").gte("created_at", daysAgo(13)).order("created_at", { ascending: true }),
    supabase.from("page_views").select("path").gte("created_at", daysAgo(30)),
  ]);

  // Agréger les visites par jour (14 derniers jours)
  const dailyMap: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const row of viewsChart ?? []) {
    const day = (row as { created_at: string }).created_at.slice(0, 10);
    if (day in dailyMap) dailyMap[day]++;
  }
  const chartDays = Object.entries(dailyMap);
  const chartMax  = Math.max(...chartDays.map(([, v]) => v), 1);

  // Top pages (30 jours)
  const pathCount: Record<string, number> = {};
  for (const row of viewsTop ?? []) {
    const p = (row as { path: string }).path;
    pathCount[p] = (pathCount[p] ?? 0) + 1;
  }
  const topPages = Object.entries(pathCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const topMax = topPages[0]?.[1] ?? 1;

  const countToday = resToday.count  ?? 0;
  const countWeek  = resWeek.count   ?? 0;
  const countMonth = resMonth.count  ?? 0;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl">Statistiques</h1>
          <p className="text-sm opacity-50 mt-1">Analyse et rapports de performance</p>
        </div>
        <div className="flex bg-white border border-[#E0D5C8] rounded-xl overflow-hidden shadow-sm">
          {TIMEFRAMES.map((t) => (
            <button key={t} className={`px-4 py-2 text-xs font-semibold transition-all ${t === "Mois" ? "text-white" : "hover:bg-[#F0F5EC]"}`}
              style={t === "Mois" ? { backgroundColor: "#2D5016" } : {}}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Ventes — Phase 3 */}
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

      {/* Séparateur visites */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px bg-[#E0D5C8]" />
        <span className="text-xs font-semibold uppercase tracking-widest opacity-40">Visites du site</span>
        <div className="flex-1 h-px bg-[#E0D5C8]" />
      </div>

      {/* KPI visites */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {[
          { label: "Aujourd'hui",       value: countToday, sub: "pages vues" },
          { label: "7 derniers jours",  value: countWeek,  sub: "pages vues" },
          { label: "30 derniers jours", value: countMonth, sub: "pages vues" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#E0D5C8] shadow-sm p-6">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-50 mb-1">{label}</p>
            <p className="font-heading font-bold text-4xl" style={{ color: "#2D5016" }}>{value.toLocaleString("fr-CA")}</p>
            <p className="text-xs opacity-40 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Graphique 14 jours */}
      <div className="bg-white rounded-2xl border border-[#E0D5C8] shadow-sm p-6 mb-8">
        <h2 className="font-heading font-semibold mb-6">Visites — 14 derniers jours</h2>
        <div className="flex items-end gap-1.5 h-40">
          {chartDays.map(([day, count]) => {
            const height = chartMax > 0 ? Math.max((count / chartMax) * 100, count > 0 ? 4 : 0) : 0;
            const isToday = day === new Date().toISOString().slice(0, 10);
            const label = new Date(day + "T12:00:00").toLocaleDateString("fr-CA", { day: "numeric", month: "short" });
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[10px] opacity-0 group-hover:opacity-60 transition-opacity font-medium">
                  {count}
                </span>
                <div className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${height}%`,
                    minHeight: count > 0 ? "4px" : "0px",
                    backgroundColor: isToday ? "#2D5016" : "#A8C68F",
                  }} />
                <span className="text-[9px] opacity-30 text-center leading-tight hidden sm:block">{label}</span>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] opacity-30 mt-3">La barre verte foncée = aujourd'hui. Survolez pour voir le nombre.</p>
      </div>

      {/* Top pages */}
      <div className="bg-white rounded-2xl border border-[#E0D5C8] shadow-sm p-6 mb-8">
        <h2 className="font-heading font-semibold mb-5">Pages les plus visitées — 30 jours</h2>
        {topPages.length === 0 ? (
          <p className="text-sm opacity-40 text-center py-8">Aucune visite enregistrée pour le moment</p>
        ) : (
          <div className="space-y-3">
            {topPages.map(([path, count]) => (
              <div key={path} className="flex items-center gap-3">
                <span className="text-sm font-medium w-40 truncate capitalize flex-shrink-0" title={path}>
                  {formatPath(path)}
                </span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#F0EDE8" }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${(count / topMax) * 100}%`, backgroundColor: "#2D5016" }} />
                </div>
                <span className="text-sm font-semibold w-10 text-right flex-shrink-0" style={{ color: "#2D5016" }}>
                  {count.toLocaleString("fr-CA")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rapports téléchargeables */}
      <div className="bg-white rounded-2xl border border-[#E0D5C8] shadow-sm p-6">
        <h2 className="font-heading font-semibold mb-4">Rapports téléchargeables</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {REPORTS.map((r) => (
            <button key={r.label}
              className="flex items-center gap-3 p-4 rounded-xl border border-[#E0D5C8] hover:bg-[#F0F5EC] transition-all text-left group opacity-40 cursor-not-allowed"
              disabled>
              <span className="text-2xl">{r.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{r.label}</p>
                <p className="text-xs opacity-60">{r.format}</p>
              </div>
              <Download size={14} className="opacity-30 flex-shrink-0" />
            </button>
          ))}
        </div>
        <p className="text-xs opacity-30 mt-4">Les exports seront disponibles en Phase 3</p>
      </div>
    </div>
  );
}
