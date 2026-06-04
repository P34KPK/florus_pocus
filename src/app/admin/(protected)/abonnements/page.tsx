import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";
import type { Subscription } from "@/types";
import AbonnementsClient from "@/components/admin/abonnements/AbonnementsClient";

export const metadata: Metadata = { title: "Abonnements" };

export default async function AdminAbonnementsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("*, dropoff_points:subscription_dropoff_points(*)")
    .order("price", { ascending: true });

  const subscriptions: Subscription[] = (data ?? []).map((s) => ({
    ...s,
    dropoff_points: s.dropoff_points ?? [],
  }));

  return (
    <div className="p-8">
      <AbonnementsClient subscriptions={subscriptions} />
    </div>
  );
}
