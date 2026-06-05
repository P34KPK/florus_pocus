import { getPublishedPage, getSiteSettings } from "@/lib/supabase-server";
import Contact          from "@/components/sections/Contact";

export const metadata = {
  title: "Contact",
  description: "Contactez l'équipe Florus Pocus. Nous sommes à Pont-Rouge, Québec.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [page, settings] = await Promise.all([
    getPublishedPage("contact"),
    getSiteSettings(),
  ]);

  return (
    <main className="pt-16">
      <Contact
        page={page}
        address={settings["contact_address"]}
        phone={settings["contact_phone"]}
        email={settings["contact_email"]}
        hours={settings["contact_hours"]}
      />
    </main>
  );
}
