import { NextResponse } from "next/server";
import { createClient as createSb } from "@supabase/supabase-js";

// ENDPOINT DE DIAGNOSTIC TEMPORAIRE — à supprimer après usage.
// N'expose AUCUN secret : seulement longueur, nb de segments, et résultat d'un test de login.
export async function GET(req: Request) {
  const url   = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const anon  = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
  const svc   = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();

  const meta = {
    url,
    anon: { len: anon.length, segments: anon.split(".").length, prefix: anon.slice(0, 6) },
    service: { len: svc.length, segments: svc.split(".").length, prefix: svc.slice(0, 6) },
    resend: !!process.env.RESEND_API_KEY,
    upstash: !!process.env.UPSTASH_REDIS_REST_URL,
  };

  // Test de login optionnel : /api/_diag?test=1&email=...&pw=...
  const sp = new URL(req.url).searchParams;
  let loginTest: unknown = "non testé (ajouter ?test=1&email=...&pw=...)";
  if (sp.get("test") === "1" && sp.get("email") && sp.get("pw")) {
    try {
      const sb = createSb(url, anon, { auth: { persistSession: false } });
      const { data, error } = await sb.auth.signInWithPassword({
        email: sp.get("email")!,
        password: sp.get("pw")!,
      });
      loginTest = error
        ? { ok: false, status: error.status, code: error.code, message: error.message }
        : { ok: true, user: data.user?.email };
    } catch (e) {
      loginTest = { ok: false, thrown: e instanceof Error ? e.message : String(e) };
    }
  }

  return NextResponse.json({ meta, loginTest });
}
