import { createClient }  from "@/lib/supabase-server";
import Subscriptions    from "@/components/sections/Subscriptions";
import type { Subscription } from "@/types";

export const metadata = {
  title: "Abonnements floraux",
  description: "Recevez des bouquets frais de la ferme chaque semaine ou chaque mois. Choisissez votre formule et votre point de chute.",
};

export default async function AbonnementsPage() {
  const supabase = await createClient();

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*, dropoff_points:subscription_dropoff_points(*)")
    .eq("active", true)
    .order("price_monthly", { ascending: true });

  return (
    <main className="pt-16">
      <Subscriptions
        subscriptions={(subscriptions as unknown as Subscription[]) ?? undefined}
      />
    </main>
  );
}
