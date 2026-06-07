import { getPublishedPages, getPublishedBlogPosts, getSiteSettings } from "@/lib/supabase-server";
import Hero        from "@/components/sections/Hero";
import WhyLocal    from "@/components/sections/WhyLocal";
import BlogPreview from "@/components/sections/BlogPreview";
import type { Page } from "@/types";
import type { WhyLocalReason } from "@/components/sections/WhyLocal";

export default async function HomePage() {
  const [pages, posts, settings] = await Promise.all([
    getPublishedPages(),
    getPublishedBlogPosts(4),
    getSiteSettings(),
  ]);

  const pageMap = Object.fromEntries((pages as Page[]).map((p) => [p.slug, p]));

  const reasons: WhyLocalReason[] = [
    { title: settings["whylocal_reason1_title"] ?? "Cultivées sans pesticides",  desc: settings["whylocal_reason1_desc"] ?? "" },
    { title: settings["whylocal_reason2_title"] ?? "Livraison locale",           desc: settings["whylocal_reason2_desc"] ?? "" },
    { title: settings["whylocal_reason3_title"] ?? "Saisons respectées",         desc: settings["whylocal_reason3_desc"] ?? "" },
    { title: settings["whylocal_reason4_title"] ?? "Soutenir l'économie locale", desc: settings["whylocal_reason4_desc"] ?? "" },
  ];

  return (
    <main>
      <Hero      page={pageMap["hero"]      ?? null} />
      <WhyLocal  page={pageMap["why-local"] ?? null} reasons={reasons} />
      <BlogPreview posts={posts ?? undefined} sectionTitle={settings["blog_section_title"]} />
    </main>
  );
}
