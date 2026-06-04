"use server";

import { createClient, createAdminClient } from "@/lib/supabase-server";

export async function assertAdmin(): Promise<{ error: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorisé." };

  const admin = createAdminClient();
  const { data } = await admin
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!data?.is_admin) return { error: "Accès refusé." };
  return null;
}
