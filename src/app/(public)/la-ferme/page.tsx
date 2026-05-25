import { createClient }  from "@/lib/supabase-server";
import Farm             from "@/components/sections/Farm";

export const metadata = {
  title: "La Ferme",
  description: "Découvrez l'histoire de Florus Pocus, notre ferme florale artisanale au cœur du Québec.",
};

export default async function LaFermePage() {
  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", "farm")
    .eq("published", true)
    .single();

  return (
    <main className="pt-16">
      <Farm page={page ?? null} />
    </main>
  );
}
