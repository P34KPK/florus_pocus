import Navbar            from "@/components/Navbar";
import Footer            from "@/components/Footer";
import BotanicalLayers   from "@/components/BotanicalLayers";
import ClientCartDrawer  from "@/components/ClientCartDrawer";
import CookieConsent     from "@/components/CookieConsent";
import { getSiteSettings } from "@/lib/supabase-server";
import { pricingFromSettings } from "@/lib/pricing";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  // Le panier annonce les frais de livraison : ils doivent venir des mêmes
  // réglages que ceux appliqués à la caisse, jamais d'une valeur en dur.
  const pricing = pricingFromSettings(await getSiteSettings());

  return (
    <>
      <BotanicalLayers />
      <Navbar />
      {children}
      <Footer />
      <ClientCartDrawer pricing={pricing} />
      <CookieConsent />
    </>
  );
}
