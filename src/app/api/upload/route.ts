import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase-server";
import { uploadRatelimit } from "@/lib/ratelimit";
import sharp from "sharp";

const BUCKET = "floruspocus";
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB avant compression
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const ALLOWED_FOLDERS = ["products", "blog", "pages", "misc"];

export async function POST(request: NextRequest) {
  // Rate limiting par IP
  if (uploadRatelimit) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { success } = await uploadRatelimit.limit(`upload:${ip}`);
    if (!success) {
      return NextResponse.json({ error: "Trop de requêtes. Réessayez dans une heure." }, { status: 429 });
    }
  }

  // Vérifier session + is_admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  // Lire le fichier
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) || "misc";

  if (!ALLOWED_FOLDERS.includes(folder)) {
    return NextResponse.json({ error: "Dossier invalide." }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: "Aucun fichier fourni." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Type de fichier non autorisé. Utilisez JPG, PNG, WebP ou GIF." }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Fichier trop volumineux. Maximum 10 Mo." }, { status: 400 });
  }

  // Convertir et compresser en WebP via Sharp
  const arrayBuffer = await file.arrayBuffer();
  const compressed = await sharp(Buffer.from(arrayBuffer))
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  // Nom de fichier unique toujours en .webp
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(filename, compressed, {
      contentType: "image/webp",
      upsert: false,
    });

  if (uploadError) {
    console.error("[upload] storage error:", uploadError.message);
    return NextResponse.json({ error: "Erreur lors du téléversement." }, { status: 500 });
  }

  const { data: { publicUrl } } = admin.storage
    .from(BUCKET)
    .getPublicUrl(filename);

  return NextResponse.json({ url: publicUrl });
}
