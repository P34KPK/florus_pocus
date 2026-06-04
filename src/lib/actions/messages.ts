"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase-server";
import { assertAdmin } from "./auth-guard";

export type MessageState = { error?: string; success?: boolean };

export async function markMessageRead(id: string, read: boolean): Promise<MessageState> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("contact_messages")
    .update({ read })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteMessage(id: string): Promise<MessageState> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const supabase = await createAdminClient();
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return { success: true };
}
