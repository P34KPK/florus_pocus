import { createBrowserClient } from "@supabase/ssr";

function extractJwt(raw: string): string {
  const clean = raw.replace(/\s+/g, "");
  const parts = clean.split(".");
  if (parts.length === 5) return `${parts[0]}.${parts[1]}.${parts[4]}`;
  return clean;
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    extractJwt(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  );
}
