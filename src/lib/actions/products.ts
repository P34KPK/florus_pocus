"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase-server";
import { assertAdmin } from "./auth-guard";

const ProductSchema = z.object({
  name:         z.string().min(1).max(200),
  description:  z.string().min(1),
  category:     z.enum(["fleur", "transforme"]),
  price:        z.coerce.number().nonnegative(),
  price_type:   z.enum(["fixed", "devis"]),
  florist_price: z.coerce.number().positive().nullable(),
  florist_only: z.boolean(),
  stock:        z.coerce.number().int().min(0).nullable(),
  image_url:    z.string().url().nullable().or(z.literal("")),
  season:       z.string().max(100).nullable(),
  active:       z.coerce.boolean(),
});

export type ProductFormState = { error?: string; success?: boolean };

function invalidate() {
  revalidateTag("products", "max");
  revalidatePath("/boutique");
  revalidatePath("/fleuristes");
  revalidatePath("/admin/produits");
  revalidatePath("/");
}

function parseImages(formData: FormData): string[] {
  try {
    const raw = formData.get("images_json");
    if (!raw || typeof raw !== "string") return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((u): u is string => typeof u === "string" && u.startsWith("http")).slice(0, 5);
  } catch { return []; }
}

async function saveImages(supabase: ReturnType<typeof createAdminClient>, productId: string, urls: string[]) {
  await supabase.from("product_images").delete().eq("product_id", productId);
  if (urls.length === 0) return;
  await supabase.from("product_images").insert(
    urls.map((image_url, sort_order) => ({ product_id: productId, image_url, sort_order }))
  );
}

export async function createProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const images   = parseImages(formData);
  const priceType = formData.get("price_type") as string;
  const raw = {
    name:         formData.get("name"),
    description:  formData.get("description"),
    category:     formData.get("category"),
    price:        priceType === "devis" ? "0" : formData.get("price"),
    price_type:   priceType,
    florist_price: formData.get("florist_price") || null,
    florist_only: formData.get("florist_only") === "true",
    stock:        formData.get("stock") || null,
    image_url:    images[0] ?? formData.get("image_url") ?? null,
    season:       formData.get("season") || null,
    active:       formData.get("active") === "true",
  };

  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = { ...parsed.data, image_url: parsed.data.image_url || null };
  const supabase = createAdminClient();
  const { data: product, error } = await supabase.from("products").insert(data).select("id").single();
  if (error || !product) return { error: error?.message ?? "Erreur création produit" };

  await saveImages(supabase, product.id, images);
  invalidate();
  return { success: true };
}

export async function updateProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const id = formData.get("id") as string;
  if (!id) return { error: "ID manquant" };

  const images    = parseImages(formData);
  const priceType = formData.get("price_type") as string;
  const raw = {
    name:         formData.get("name"),
    description:  formData.get("description"),
    category:     formData.get("category"),
    price:        priceType === "devis" ? "0" : formData.get("price"),
    price_type:   priceType,
    florist_price: formData.get("florist_price") || null,
    florist_only: formData.get("florist_only") === "true",
    stock:        formData.get("stock") || null,
    image_url:    images[0] ?? formData.get("image_url") ?? null,
    season:       formData.get("season") || null,
    active:       formData.get("active") === "true",
  };

  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = { ...parsed.data, image_url: parsed.data.image_url || null };
  const supabase = createAdminClient();
  const { error } = await supabase.from("products").update(data).eq("id", id);
  if (error) return { error: error.message };

  await saveImages(supabase, id, images);
  invalidate();
  return { success: true };
}

export async function deleteProduct(id: string): Promise<ProductFormState> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const supabase = createAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };

  invalidate();
  return { success: true };
}

export async function toggleProductActive(id: string, active: boolean): Promise<ProductFormState> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const supabase = createAdminClient();
  const { error } = await supabase.from("products").update({ active: !active }).eq("id", id);
  if (error) return { error: error.message };

  invalidate();
  return { success: true };
}
