import { createClient }      from "@/lib/supabase-server";
import Navbar                from "@/components/Navbar";
import Footer                from "@/components/Footer";
import CartDrawer            from "@/components/CartDrawer";
import BotanicalLayers       from "@/components/BotanicalLayers";
import BranchDivider         from "@/components/BranchDivider";
import Hero                  from "@/components/sections/Hero";
import WhyLocal              from "@/components/sections/WhyLocal";
import Subscriptions         from "@/components/sections/Subscriptions";
import Autocueillette        from "@/components/sections/Autocueillette";
import Fleuristes            from "@/components/sections/Fleuristes";
import TransformedProducts   from "@/components/sections/TransformedProducts";
import BlogPreview           from "@/components/sections/BlogPreview";
import Farm                  from "@/components/sections/Farm";
import Contact               from "@/components/sections/Contact";
import type { Page, Product, Subscription } from "@/types";

export default async function HomePage() {
  const supabase = await createClient();
  const today    = new Date().toISOString().split("T")[0];

  const [
    { data: pages },
    { data: products },
    { data: subscriptions },
    { data: events },
    { data: posts },
  ] = await Promise.all([
    supabase.from("pages").select("*").eq("published", true),
    supabase.from("products").select("*").eq("active", true).order("name"),
    supabase
      .from("subscriptions")
      .select("*, dropoff_points:subscription_dropoff_points(*)")
      .eq("active", true)
      .order("price_monthly", { ascending: true }),
    supabase
      .from("autocueillette_events")
      .select("*")
      .eq("active", true)
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .limit(60),
    supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("published_date", { ascending: false })
      .limit(4),
  ]);

  const pageMap    = Object.fromEntries((pages  ?? []).map((p: Page)    => [p.slug, p]));
  const fleurs     = (products ?? []).filter((p: Product) => p.category === "fleur");
  const transformes = (products ?? []).filter((p: Product) => p.category === "transforme");

  return (
    <>
      <BotanicalLayers />
      <Navbar />
      <main>
        <Hero    page={pageMap["hero"]      ?? null} />
        <WhyLocal page={pageMap["why-local"] ?? null} />
        <Subscriptions
          subscriptions={(subscriptions as unknown as Subscription[]) ?? undefined}
        />
        <Autocueillette events={events ?? undefined} />
        <BranchDivider />
        <Fleuristes         products={fleurs.length      > 0 ? fleurs      : undefined} />
        <TransformedProducts products={transformes.length > 0 ? transformes : undefined} />
        <BlogPreview posts={posts ?? undefined} />
        <Farm    page={pageMap["farm"]    ?? null} />
        <Contact page={pageMap["contact"] ?? null} />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
