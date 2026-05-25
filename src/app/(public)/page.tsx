import { createClient }  from "@/lib/supabase-server";
import Hero             from "@/components/sections/Hero";
import WhyLocal         from "@/components/sections/WhyLocal";
import BlogPreview      from "@/components/sections/BlogPreview";
import type { Page }    from "@/types";

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { data: pages },
    { data: posts },
  ] = await Promise.all([
    supabase.from("pages").select("*").eq("published", true),
    supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("published_date", { ascending: false })
      .limit(4),
  ]);

  const pageMap = Object.fromEntries((pages ?? []).map((p: Page) => [p.slug, p]));

  return (
    <main>
      <Hero      page={pageMap["hero"]      ?? null} />
      <WhyLocal  page={pageMap["why-local"] ?? null} />
      <BlogPreview posts={posts ?? undefined} />
    </main>
  );
}
