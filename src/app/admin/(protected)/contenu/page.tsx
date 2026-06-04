import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-server";
import ContenuClient from "@/components/admin/contenu/ContenuClient";

export const metadata: Metadata = { title: "Contenu du site" };

const GROUP_LABELS: Record<string, string> = {
  contact:        "Coordonnées",
  reseaux_sociaux: "Réseaux sociaux",
  footer:         "Pied de page",
  pourquoi_local: "Section « Pourquoi local »",
  abonnements:    "Section abonnements",
  fleuristes:     "Accès fleuristes",
};

export default async function AdminContenuPage() {
  const supabase = await createAdminClient();
  const { data } = await supabase
    .from("site_settings")
    .select("key, value, label, grp")
    .order("grp")
    .order("key");

  const rows = data ?? [];

  // Grouper par grp
  const grouped: Record<string, typeof rows> = {};
  for (const row of rows) {
    if (!grouped[row.grp]) grouped[row.grp] = [];
    grouped[row.grp].push(row);
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="font-heading font-bold text-2xl mb-2" style={{ color: "#2D5016" }}>
        Contenu du site
      </h1>
      <p className="text-sm opacity-60 mb-8">
        Modifiez ici les textes, adresses et liens qui apparaissent sur le site.
      </p>

      <ContenuClient grouped={grouped} groupLabels={GROUP_LABELS} />
    </div>
  );
}
