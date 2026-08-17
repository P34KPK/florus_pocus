import { NextRequest, NextResponse } from "next/server";

/**
 * Réponse vide.
 *
 * ⚠️ Ne PAS utiliser `NextResponse.json(null, { status: 204 })` : un 204 ne peut
 * pas porter de corps, et le constructeur `Response` lève alors
 * « Invalid response status code 204 ». L'insertion en base ayant déjà eu lieu,
 * la mesure fonctionnait — mais chaque visite terminait en erreur 500 côté
 * serveur, invisible parce que `sendBeacon` ignore la réponse.
 */
const vide = (status: number) => new NextResponse(null, { status });
import { createAdminClient } from "@/lib/supabase-server";
import { trackRatelimit } from "@/lib/ratelimit";
import { z } from "zod";

const Schema = z.object({
  path:     z.string().startsWith("/").max(500),
  referrer: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  if (trackRatelimit) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { success } = await trackRatelimit.limit(`track:${ip}`);
    if (!success) return vide(429);
  }

  let body: unknown;
  try { body = await request.json(); } catch { return vide(400); }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) return vide(400);

  // Ignorer les routes admin
  if (parsed.data.path.startsWith("/admin")) return vide(204);

  const supabase = createAdminClient();
  await supabase.from("page_views").insert({
    path:     parsed.data.path,
    referrer: parsed.data.referrer || null,
  });

  return vide(204);
}
