import { getActiveSubscriptions, getSiteSettings } from "@/lib/supabase-server";
import Subscriptions from "@/components/sections/Subscriptions";
import type { Subscription } from "@/types";

export const metadata = {
  title: "Abonnements floraux",
  description: "Recevez des bouquets frais de la ferme chaque semaine ou chaque mois. Choisissez votre formule et votre point de chute.",
  alternates: { canonical: "/abonnements" },
};

export default async function AbonnementsPage() {
  const [subscriptions, settings] = await Promise.all([
    getActiveSubscriptions(),
    getSiteSettings(),
  ]);

  return (
    <main className="pt-16">
      <Subscriptions
        subscriptions={(subscriptions as unknown as Subscription[]) ?? undefined}
        sectionTitle={settings["abonnements_title"]}
        sectionSubtitle={settings["abonnements_subtitle"]}
      />
    </main>
  );
}
