import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-server";
import type { Order } from "@/types";
import CommandesClient from "@/components/admin/commandes/CommandesClient";

export const metadata: Metadata = { title: "Commandes" };

export default async function AdminCommandesPage() {
  const supabase = createAdminClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <CommandesClient orders={(orders ?? []) as Order[]} />
    </div>
  );
}
