import { getActiveProducts }    from "@/lib/supabase-server";
import BranchDivider        from "@/components/BranchDivider";
import Fleuristes           from "@/components/sections/Fleuristes";
import TransformedProducts  from "@/components/sections/TransformedProducts";
import type { Product }     from "@/types";

export const metadata = {
  title: "Boutique",
  description: "Fleurs fraîches de saison et produits transformés artisanaux de la ferme Florus Pocus.",
  alternates: { canonical: "/boutique" },
};

export default async function BoutiquePage() {
  const products = (await getActiveProducts()) as Product[];

  const public_products = products.filter((p) => !p.florist_only);
  const fleurs          = public_products.filter((p) => p.category === "fleur");
  const transformes     = public_products.filter((p) => p.category === "transforme");

  return (
    <main className="pt-16">
      {fleurs.length > 0 && (
        <>
          <Fleuristes products={fleurs} />
          <BranchDivider />
        </>
      )}
      <TransformedProducts products={transformes.length > 0 ? transformes : undefined} />
    </main>
  );
}
