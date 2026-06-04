import { isFloristAuthenticated } from "@/lib/actions/florist";
import { getActiveProducts } from "@/lib/supabase-server";
import FloristGate from "@/components/sections/FloristGate";
import FloristCatalog from "@/components/sections/FloristCatalog";
import type { Product } from "@/types";

export const metadata = {
  title: "Espace fleuristes — Florus Pocus",
  description: "Espace professionnel réservé aux fleuristes partenaires de Florus Pocus.",
};

export default async function FleuristesPage() {
  const authenticated = await isFloristAuthenticated();

  if (!authenticated) {
    return <FloristGate />;
  }

  const products = (await getActiveProducts()) as Product[];
  const fleurs = products.filter((p) => p.category === "fleur");

  return <FloristCatalog products={fleurs} />;
}
