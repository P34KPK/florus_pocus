import { getPublishedPage } from "@/lib/supabase-server";
import Contact          from "@/components/sections/Contact";

export const metadata = {
  title: "Contact",
  description: "Contactez l'équipe Florus Pocus. Nous sommes à Pont-Rouge, Québec.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const page = await getPublishedPage("contact");

  return (
    <main className="pt-16">
      <Contact page={page} />
    </main>
  );
}
