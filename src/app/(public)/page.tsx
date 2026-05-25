import { getPublishedPages, getPublishedBlogPosts } from "@/lib/supabase-server";
import Hero             from "@/components/sections/Hero";
import WhyLocal         from "@/components/sections/WhyLocal";
import BlogPreview      from "@/components/sections/BlogPreview";
import type { Page }    from "@/types";

export default async function HomePage() {
  const [pages, posts] = await Promise.all([
    getPublishedPages(),
    getPublishedBlogPosts(4),
  ]);

  const pageMap = Object.fromEntries((pages as Page[]).map((p) => [p.slug, p]));

  return (
    <main>
      <Hero      page={pageMap["hero"]      ?? null} />
      <WhyLocal  page={pageMap["why-local"] ?? null} />
      <BlogPreview posts={posts ?? undefined} />
    </main>
  );
}
