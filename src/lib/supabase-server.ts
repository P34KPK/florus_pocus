import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
const ANON_KEY      = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.replace(/\s+/g, "");
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!.replace(/\s+/g, "");

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    SUPABASE_URL,
    ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore — appelé depuis un Server Component (lecture seule)
          }
        },
      },
    }
  );
}

/* Client sans cookies pour les données publiques — compatible avec le cache Next.js */
export function createPublicClient() {
  return createSupabaseClient(
    SUPABASE_URL,
    ANON_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/* Helpers cachés — revalidate 1h, invalidation via revalidateTag */
export const getPublishedPages = unstable_cache(
  async () => {
    const { data } = await createPublicClient()
      .from("pages")
      .select("*")
      .eq("published", true);
    return data ?? [];
  },
  ["published-pages"],
  { revalidate: 3600, tags: ["pages"] }
);

export const getPublishedBlogPosts = unstable_cache(
  async (limit?: number) => {
    let query = createPublicClient()
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("published_date", { ascending: false });
    if (limit) query = query.limit(limit);
    const { data } = await query;
    return data ?? [];
  },
  ["published-blog-posts"],
  { revalidate: 3600, tags: ["blog_posts"] }
);

export const getBlogPost = unstable_cache(
  async (slug: string) => {
    const { data } = await createPublicClient()
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();
    return data ?? null;
  },
  ["blog-post"],
  { revalidate: 3600, tags: ["blog_posts"] }
);

export const getPublishedPage = unstable_cache(
  async (slug: string) => {
    const { data } = await createPublicClient()
      .from("pages")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();
    return data ?? null;
  },
  ["published-page"],
  { revalidate: 3600, tags: ["pages"] }
);

export const getActiveSubscriptions = unstable_cache(
  async () => {
    const { data } = await createPublicClient()
      .from("subscriptions")
      .select("*, dropoff_points:subscription_dropoff_points(*)")
      .eq("active", true)
      .order("price_monthly", { ascending: true });
    return data ?? [];
  },
  ["active-subscriptions"],
  { revalidate: 3600, tags: ["subscriptions"] }
);

export const getActiveProducts = unstable_cache(
  async () => {
    const { data } = await createPublicClient()
      .from("products")
      .select("*")
      .eq("active", true)
      .order("name");
    return data ?? [];
  },
  ["active-products"],
  { revalidate: 3600, tags: ["products"] }
);

export const getUpcomingEvents = unstable_cache(
  async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await createPublicClient()
      .from("autocueillette_events")
      .select("*")
      .eq("active", true)
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .limit(60);
    return data ?? [];
  },
  ["upcoming-events"],
  { revalidate: 3600, tags: ["events"] }
);

export function createAdminClient() {
  return createSupabaseClient(
    SUPABASE_URL,
    SERVICE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
