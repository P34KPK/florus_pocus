import { createClient }  from "@/lib/supabase-server";
import Contact          from "@/components/sections/Contact";

export const metadata = {
  title: "Contact",
  description: "Contactez l'équipe Florus Pocus. Nous sommes à Pont-Rouge, Québec.",
};

export default async function ContactPage() {
  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", "contact")
    .eq("published", true)
    .single();

  return (
    <main className="pt-16">
      <Contact page={page ?? null} />
    </main>
  );
}
