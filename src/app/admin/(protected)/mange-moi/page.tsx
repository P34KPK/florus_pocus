import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-server";
import MangeMoiClient from "@/components/admin/mange-moi/MangeMoiClient";
import type { MangeMoiItem } from "@/types";

export const metadata: Metadata = { title: "Mange Moi" };

export default async function AdminMangeMoiPage() {
  const supabase = await createAdminClient();
  const { data } = await supabase
    .from("mange_moi_items")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <div className="p-8">
      <MangeMoiClient items={(data ?? []) as MangeMoiItem[]} />
    </div>
  );
}
