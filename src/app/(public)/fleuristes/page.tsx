import { isFloristAuthenticated } from "@/lib/actions/florist";
import { getActiveProducts, getSiteSettings } from "@/lib/supabase-server";
import FloristGate from "@/components/sections/FloristGate";
import FloristCatalog from "@/components/sections/FloristCatalog";
import type { Product } from "@/types";

export const metadata = {
  title: "Espace fleuristes — Florus Pocus",
  description: "Espace professionnel Florus Pocus — fleurs coupées distinctives pour fleuristes et événements. Production locale, approvisionnement et réseau de producteurs au Québec.",
};

export default async function FleuristesPage() {
  const authenticated = await isFloristAuthenticated();

  if (!authenticated) {
    const settings = await getSiteSettings();
    return <FloristGate email={settings["contact_email"] || "info@floruspocus.com"} />;
  }

  const products = (await getActiveProducts()) as Product[];
  // Affiche les produits réservés aux fleuristes OU ceux ayant un prix de gros défini.
  const floristProducts = products.filter((p) => p.florist_only || p.florist_price !== null);

  return <FloristCatalog products={floristProducts} />;
}
