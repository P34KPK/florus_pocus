"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase-server";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginState = { error?: string; success?: boolean };

export async function loginAdmin(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Identifiants invalides." };

  const supabase = await createClient();
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (authError) return { error: "Identifiants invalides. Veuillez réessayer." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Erreur de connexion." };

  // Vérifier is_admin via REST API directe (bypasse le client JS)
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?id=eq.${user.id}&select=is_admin`,
    {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!.replace(/\s+/g, ""),
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!.replace(/\s+/g, "")}`,
      },
      cache: "no-store",
    }
  );
  const rows = await res.json();
  const isAdmin = rows?.[0]?.is_admin === true;

  if (!isAdmin) {
    await supabase.auth.signOut();
    return { error: "Accès refusé. Compte non-administrateur." };
  }

  // NE PAS utiliser redirect() — les cookies Supabase ne suivent pas le 303.
  // On retourne success:true et le client fait un rechargement complet.
  return { success: true };
}
