"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase-server";

const ProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1),
  category: z.enum(["fleur", "transforme"]),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0).nullable(),
  image_url: z.string().url().nullable().or(z.literal("")),
  season: z.enum(["spring", "summer", "fall", "winter"]).nullable(),
  active: z.coerce.boolean(),
});

export type ProductFormState = { error?: string; success?: boolean };

export async function createProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const raw = {
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    price: formData.get("price"),
    stock: formData.get("stock") || null,
    image_url: formData.get("image_url") || null,
    season: formData.get("season") || null,
    active: formData.get("active") === "true",
  };

  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = { ...parsed.data, image_url: parsed.data.image_url || null };

  const supabase = await createAdminClient();
  const { error } = await supabase.from("products").insert(data);
  if (error) return { error: error.message };

  revalidatePath("/admin/produits");
  revalidatePath("/");
  return { success: true };
}

export async function updateProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const id = formData.get("id") as string;
  if (!id) return { error: "ID manquant" };

  const raw = {
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    price: formData.get("price"),
    stock: formData.get("stock") || null,
    image_url: formData.get("image_url") || null,
    season: formData.get("season") || null,
    active: formData.get("active") === "true",
  };

  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = { ...parsed.data, image_url: parsed.data.image_url || null };

  const supabase = await createAdminClient();
  const { error } = await supabase.from("products").update(data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/produits");
  revalidatePath("/");
  return { success: true };
}

export async function deleteProduct(id: string): Promise<ProductFormState> {
  if (!id) return { error: "ID manquant" };

  const supabase = await createAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/produits");
  revalidatePath("/");
  return { success: true };
}

export async function toggleProductActive(id: string, active: boolean): Promise<ProductFormState> {
  const supabase = await createAdminClient();
  const { error } = await supabase.from("products").update({ active: !active }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/produits");
  revalidatePath("/");
  return { success: true };
}
