import { createClient }      from "@/lib/supabase-server";
import BranchDivider        from "@/components/BranchDivider";
import Fleuristes           from "@/components/sections/Fleuristes";
import TransformedProducts  from "@/components/sections/TransformedProducts";
import type { Product }     from "@/types";

export const metadata = {
  title: "Boutique",
  description: "Fleurs fraîches de saison et produits transformés artisanaux de la ferme Florus Pocus.",
};

export default async function BoutiquePage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("name");

  const fleurs      = (products ?? []).filter((p: Product) => p.category === "fleur");
  const transformes = (products ?? []).filter((p: Product) => p.category === "transforme");

  return (
    <main className="pt-16">
      <Fleuristes          products={fleurs.length      > 0 ? fleurs      : undefined} />
      <BranchDivider />
      <TransformedProducts products={transformes.length > 0 ? transformes : undefined} />
    </main>
  );
}
