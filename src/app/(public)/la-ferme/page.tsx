import { getPublishedPage } from "@/lib/supabase-server";
import Farm             from "@/components/sections/Farm";

export const metadata = {
  title: "La Ferme",
  description: "Découvrez l'histoire de Florus Pocus, notre floriculture écoresponsable au cœur du Québec.",
  alternates: { canonical: "/la-ferme" },
};

export default async function LaFermePage() {
  const page = await getPublishedPage("farm");

  return (
    <main className="pt-16">
      <Farm page={page} />
    </main>
  );
}
