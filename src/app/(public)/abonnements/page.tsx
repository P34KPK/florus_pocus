import { getActiveSubscriptions, getSiteSettings } from "@/lib/supabase-server";
import Subscriptions from "@/components/sections/Subscriptions";
import type { Subscription } from "@/types";

export const metadata = {
  title: "Abonnements floraux",
  description: "Abonnez-vous à des fleurs coupées de saison, directement de la production Florus Pocus. Choisissez votre formule, votre fréquence et votre point de chute au Québec.",
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
