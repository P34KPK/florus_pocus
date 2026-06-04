import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getPublishedBlogPosts } from "@/lib/supabase-server";
import type { BlogPost } from "@/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Pages statiques publiques (admin / checkout / api exclus)
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,                          lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE_URL}/boutique`,                  lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE_URL}/abonnements`,               lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/mange-moi`,                 lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE_URL}/fleuristes`,                lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/la-ferme`,                  lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`,                   lastModified: now, changeFrequency: "yearly",  priority: 0.6 },
    { url: `${SITE_URL}/blog`,                      lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${SITE_URL}/politique-confidentialite`, lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
    { url: `${SITE_URL}/conditions-utilisation`,    lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
  ];

  // Articles de blog publiés
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = (await getPublishedBlogPosts()) as BlogPost[];
    blogRoutes = posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.updated_at ?? p.published_date ?? now),
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch {
    // En cas d'indisponibilité DB, on sert au moins les routes statiques.
  }

  return [...staticRoutes, ...blogRoutes];
}
