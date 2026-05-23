import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";
import type { AutocueilletteEvent } from "@/types";
import AutocueilletteClient from "@/components/admin/autocueillette/AutocueilletteClient";

export const metadata: Metadata = { title: "Autocueillette" };

export default async function AdminAutocueilletePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("autocueillette_events")
    .select("*")
    .order("event_date", { ascending: true });

  const events: AutocueilletteEvent[] = data ?? [];

  return (
    <div className="p-8">
      <AutocueilletteClient events={events} />
    </div>
  );
}
