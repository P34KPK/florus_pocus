import { getSiteSettings } from "@/lib/supabase-server";
import CheckoutClient from "./CheckoutClient";

export const metadata = {
  title: "Caisse",
  alternates: { canonical: "/checkout" },
};

export default async function CheckoutPage() {
  const settings = await getSiteSettings();
  const causeName = settings["round_up_cause_name"] || "la cause";
  const pickupAddress = settings["contact_address"] || "à la ferme";

  return <CheckoutClient causeName={causeName} pickupAddress={pickupAddress} />;
}
