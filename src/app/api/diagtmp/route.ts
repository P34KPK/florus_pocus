import { NextResponse } from "next/server";

// ENDPOINT DE DIAGNOSTIC TEMPORAIRE — à supprimer après usage.
// N'expose AUCUN secret : seulement longueur et nb de segments des clés.
export async function GET() {
  const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
  const svc  = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();

  return NextResponse.json({
    anon:    { len: anon.length, segments: anon.split(".").length, ok: anon.split(".").length === 3 },
    service: { len: svc.length,  segments: svc.split(".").length,  ok: svc.split(".").length === 3 },
  });
}
