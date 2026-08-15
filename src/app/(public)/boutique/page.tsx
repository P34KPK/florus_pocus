import { getActiveProducts, getSiteSettings } from "@/lib/supabase-server";
import { pricingFromSettings } from "@/lib/pricing";
import BoutiqueShop    from "@/components/sections/BoutiqueShop";
import NewsletterPopup from "@/components/NewsletterPopup";
import type { Product } from "@/types";

export const metadata = {
  title: "Boutique",
  description: "Fleurs coupées distinctives et produits transformés artisanaux. Production horticole locale de Florus Pocus, directement de la ferme au Québec.",
  alternates: { canonical: "/boutique" },
};

export default async function BoutiquePage() {
  const [products, settings] = await Promise.all([
    getActiveProducts(),
    getSiteSettings(),
  ]);
  const public_products = (products as Product[]).filter((p) => !p.florist_only);

  return (
    <main className="pt-16">
      <NewsletterPopup />
      <BoutiqueShop
        products={public_products}
        title={settings["produits_titre"]}
        surtitle={settings["produits_surtitle"]}
        subtitle={settings["boutique_subtitle"]}
        pricing={pricingFromSettings(settings)}
      />
    </main>
  );
}
