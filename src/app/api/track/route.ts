import { NextRequest, NextResponse } from "next/server";
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
    if (!success) return NextResponse.json(null, { status: 429 });
  }

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json(null, { status: 400 }); }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json(null, { status: 400 });

  // Ignorer les routes admin
  if (parsed.data.path.startsWith("/admin")) return NextResponse.json(null, { status: 204 });

  const supabase = createAdminClient();
  await supabase.from("page_views").insert({
    path:     parsed.data.path,
    referrer: parsed.data.referrer || null,
  });

  return NextResponse.json(null, { status: 204 });
}
