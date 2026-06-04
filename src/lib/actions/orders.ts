"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase-server";
import { assertAdmin } from "./auth-guard";

export type OrderState = { error?: string; success?: boolean };

const StatusSchema = z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]);

export async function updateOrderStatus(id: string, status: string): Promise<OrderState> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const parsed = StatusSchema.safeParse(status);
  if (!parsed.success) return { error: "Statut invalide." };

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: parsed.data })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/commandes");
  revalidatePath("/admin");
  return { success: true };
}
