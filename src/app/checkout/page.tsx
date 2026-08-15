import { getSiteSettings } from "@/lib/supabase-server";
import { pricingFromSettings } from "@/lib/pricing";
import CheckoutClient from "./CheckoutClient";

export const metadata = {
  title: "Caisse",
  alternates: { canonical: "/checkout" },
};

export default async function CheckoutPage() {
  const settings = await getSiteSettings();
  const causeName = settings["round_up_cause_name"] || "la cause";
  const pickupAddress = settings["contact_address"] || "à la ferme";

  // La configuration de prix descend du serveur pour que l'affichage de la
  // caisse et le montant encaissé viennent exactement des mêmes réglages.
  return (
    <CheckoutClient
      causeName={causeName}
      pickupAddress={pickupAddress}
      pricing={pricingFromSettings(settings)}
    />
  );
}
