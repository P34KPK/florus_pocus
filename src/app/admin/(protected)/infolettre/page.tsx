import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-server";
import InfolettrClient from "@/components/admin/infolettre/InfolettrClient";

export const metadata: Metadata = { title: "Infolettre" };

export default async function AdminInfolettrePage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, source, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <InfolettrClient subscribers={data ?? []} />
    </div>
  );
}
