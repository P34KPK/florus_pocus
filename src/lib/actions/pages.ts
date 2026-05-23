"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase-server";

const PageSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  featured_image_url: z.string().url().nullable().or(z.literal("")),
  meta_description: z.string().max(160).nullable().or(z.literal("")),
  published: z.coerce.boolean(),
});

export type PageFormState = { error?: string; success?: boolean };

export async function updatePage(_prev: PageFormState, formData: FormData): Promise<PageFormState> {
  const id = formData.get("id") as string;
  if (!id) return { error: "ID manquant" };

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    featured_image_url: formData.get("featured_image_url") || null,
    meta_description: formData.get("meta_description") || null,
    published: formData.get("published") === "true",
  };

  const parsed = PageSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = {
    ...parsed.data,
    featured_image_url: parsed.data.featured_image_url || null,
    meta_description: parsed.data.meta_description || null,
  };

  const supabase = await createAdminClient();
  const { error } = await supabase.from("pages").update(data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/pages");
  revalidatePath("/");
  return { success: true };
}
