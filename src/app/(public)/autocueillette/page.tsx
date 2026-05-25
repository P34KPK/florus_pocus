import { createClient }    from "@/lib/supabase-server";
import Autocueillette     from "@/components/sections/Autocueillette";

export const metadata = {
  title: "Autocueillette",
  description: "Venez cueillir vos fleurs directement dans nos champs. Réservez votre billet pour une expérience unique à la ferme.",
};

export default async function AutocueillettePage() {
  const supabase = await createClient();
  const today    = new Date().toISOString().split("T")[0];

  const { data: events } = await supabase
    .from("autocueillette_events")
    .select("*")
    .eq("active", true)
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(60);

  return (
    <main className="pt-16">
      <Autocueillette events={events ?? undefined} />
    </main>
  );
}
