import { getActiveSubscriptions } from "@/lib/supabase-server";
import Subscriptions    from "@/components/sections/Subscriptions";
import type { Subscription } from "@/types";

export const metadata = {
  title: "Abonnements floraux",
  description: "Recevez des bouquets frais de la ferme chaque semaine ou chaque mois. Choisissez votre formule et votre point de chute.",
};

export default async function AbonnementsPage() {
  const subscriptions = await getActiveSubscriptions();

  return (
    <main className="pt-16">
      <Subscriptions
        subscriptions={(subscriptions as unknown as Subscription[]) ?? undefined}
      />
    </main>
  );
}
