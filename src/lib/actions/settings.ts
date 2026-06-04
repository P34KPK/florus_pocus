"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase-server";

export type SettingsState = { error?: string; success?: boolean };

export async function updateSiteSettings(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
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
  revalidatePath("/admin/contenu");
  return { success: true };
}
