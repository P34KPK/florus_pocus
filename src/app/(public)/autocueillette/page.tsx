import { getUpcomingEvents } from "@/lib/supabase-server";
import Autocueillette     from "@/components/sections/Autocueillette";

export const metadata = {
  title: "Autocueillette",
  description: "Venez cueillir vos fleurs directement dans nos champs. Réservez votre billet pour une expérience unique à la ferme.",
};

export default async function AutocueillettePage() {
  const events = await getUpcomingEvents();

  return (
    <main className="pt-16">
      <Autocueillette events={events ?? undefined} />
    </main>
  );
}
