import { getPublishedPage, getSiteSettings } from "@/lib/supabase-server";
import Farm             from "@/components/sections/Farm";

export const metadata = {
  title: "La Ferme",
  description: "Florus Pocus est une entreprise horticole qui cultive la reconnexion avec la nature, la culture alimentaire et la beauté des jardins. Découvrez notre histoire au Québec.",
  alternates: { canonical: "/la-ferme" },
};

export default async function LaFermePage() {
  const [page, s] = await Promise.all([
    getPublishedPage("farm"),
    getSiteSettings(),
  ]);

  const stats = [
    { value: s["farm_stat1_value"], label: s["farm_stat1_label"] },
    { value: s["farm_stat2_value"], label: s["farm_stat2_label"] },
    { value: s["farm_stat3_value"], label: s["farm_stat3_label"] },
    { value: s["farm_stat4_value"], label: s["farm_stat4_label"] },
  ].filter((st) => st.value || st.label);

  return (
    <main className="pt-16">
      <Farm page={page} stats={stats.length > 0 ? stats : undefined} />
    </main>
  );
}
