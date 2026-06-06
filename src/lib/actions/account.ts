"use server";

import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase-server";
import { assertAdmin } from "./auth-guard";

const PasswordSchema = z.object({
  current_password: z.string().min(1, "Mot de passe actuel requis"),
  new_password: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
  confirm_password: z.string().min(1, "Confirmation requise"),
}).refine((d) => d.new_password === d.confirm_password, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm_password"],
});

export type PasswordFormState = { error?: string; success?: boolean };

export async function changeAdminPassword(
  _prev: PasswordFormState,
  formData: FormData
): Promise<PasswordFormState> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const parsed = PasswordSchema.safeParse({
    current_password: formData.get("current_password"),
    new_password: formData.get("new_password"),
    confirm_password: formData.get("confirm_password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Session invalide." };

  // Vérifier le mot de passe actuel
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.current_password,
  });
  if (signInError) return { error: "Mot de passe actuel incorrect." };

  // Mettre à jour via service_role pour éviter les conflits de session
  const admin = await createAdminClient();
  const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
    password: parsed.data.new_password,
  });
  if (updateError) return { error: updateError.message };

  return { success: true };
}
