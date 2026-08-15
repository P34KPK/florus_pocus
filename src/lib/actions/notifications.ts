"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase-server";
import { assertAdmin } from "./auth-guard";

/**
 * Mémorise que l'administrateur vient de consulter ses notifications.
 * Seuls les ÉVÉNEMENTS sont ainsi marqués lus — les actions à faire continuent
 * d'être signalées tant qu'elles ne sont pas réglées.
 */
export async function markNotificationsSeen(): Promise<{ error?: string; success?: boolean }> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorisé." };

  const now = new Date().toISOString();
  const { error } = await createAdminClient()
    .from("admin_notification_reads")
    .upsert({ user_id: user.id, last_seen_at: now, updated_at: now }, { onConflict: "user_id" });

  if (error) return { error: error.message };

  revalidatePath("/admin", "layout");
  return { success: true };
}
