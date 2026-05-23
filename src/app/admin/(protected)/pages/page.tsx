import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";
import type { Page } from "@/types";
import PagesClient from "@/components/admin/pages/PagesClient";

export const metadata: Metadata = { title: "Pages" };

export default async function AdminPagesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pages")
    .select("*")
    .order("slug");

  const pages: Page[] = data ?? [];

  return (
    <div className="p-8">
      <PagesClient pages={pages} />
    </div>
  );
}
