import { getSiteSettings } from "@/lib/supabase-server";
import CheckoutClient from "./CheckoutClient";

export const metadata = {
  title: "Caisse",
  alternates: { canonical: "/checkout" },
};

export default async function CheckoutPage() {
  const settings = await getSiteSettings();
  const causeName = settings["round_up_cause_name"] || "la cause";

  return <CheckoutClient causeName={causeName} />;
}
