"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase-server";
import { assertAdmin } from "./auth-guard";

export type SettingsState = { error?: string; success?: boolean };

export async function updateSiteSettings(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const supabase = await createAdminClient();

  const entries = Array.from(formData.entries()) as [string, string][];

  for (const [key, value] of entries) {
    const { error } = await supabase
      .from("site_settings")
      .update({ value })
      .eq("key", key);
    if (error) return { error: `Erreur sur la clé "${key}": ${error.message}` };
  }

  revalidateTag("site_settings", "max");
  revalidatePath("/");
  revalidatePath("/abonnements");
  revalidatePath("/boutique");
  revalidatePath("/contact");
  revalidatePath("/la-ferme");
  revalidatePath("/fleuristes");
  revalidatePath("/mange-moi");
  revalidatePath("/checkout");
  revalidatePath("/admin/contenu");
  return { success: true };
}
