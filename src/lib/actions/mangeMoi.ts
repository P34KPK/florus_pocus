"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase-server";
import { assertAdmin } from "./auth-guard";

const ItemSchema = z.object({
  name:        z.string().min(1).max(200),
  description: z.string().max(2000),
  image_url:   z.string().url().nullable().or(z.literal("")),
  sort_order:  z.coerce.number().int().min(0),
  active:      z.coerce.boolean(),
});

export type MangeMoiState = { error?: string; success?: boolean };

function invalidate() {
  revalidateTag("mange_moi", "max");
  revalidatePath("/mange-moi");
  revalidatePath("/admin/mange-moi");
}

export async function createMangeMoiItem(_prev: MangeMoiState, formData: FormData): Promise<MangeMoiState> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const raw = {
    name:        formData.get("name"),
    description: formData.get("description") ?? "",
    image_url:   formData.get("image_url") || null,
    sort_order:  formData.get("sort_order") ?? 0,
    active:      formData.get("active") === "true",
  };

  const parsed = ItemSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createAdminClient();
  const { error } = await supabase.from("mange_moi_items").insert({
    ...parsed.data,
    image_url: parsed.data.image_url || null,
  });
  if (error) return { error: error.message };

  invalidate();
  return { success: true };
}

export async function updateMangeMoiItem(_prev: MangeMoiState, formData: FormData): Promise<MangeMoiState> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const id = formData.get("id") as string;
  if (!id) return { error: "ID manquant" };

  const raw = {
    name:        formData.get("name"),
    description: formData.get("description") ?? "",
    image_url:   formData.get("image_url") || null,
    sort_order:  formData.get("sort_order") ?? 0,
    active:      formData.get("active") === "true",
  };

  const parsed = ItemSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createAdminClient();
  const { error } = await supabase.from("mange_moi_items").update({
    ...parsed.data,
    image_url: parsed.data.image_url || null,
  }).eq("id", id);
  if (error) return { error: error.message };

  invalidate();
  return { success: true };
}

export async function deleteMangeMoiItem(id: string): Promise<MangeMoiState> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const supabase = await createAdminClient();
  const { error } = await supabase.from("mange_moi_items").delete().eq("id", id);
  if (error) return { error: error.message };

  invalidate();
  return { success: true };
}
