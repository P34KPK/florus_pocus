"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase-server";
import { assertAdmin } from "./auth-guard";

const BlogSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Slug: lettres minuscules, chiffres et tirets seulement"),
  content: z.string().min(1),
  excerpt: z.string().max(160),
  author: z.string().min(1).max(200),
  featured_image_url: z.string().url().nullable().or(z.literal("")),
  tags: z.array(z.string()),
  published: z.coerce.boolean(),
});

export type BlogFormState = { error?: string; success?: boolean };

function invalidate() {
  revalidateTag("blog_posts", "max");
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  revalidatePath("/");
}

export async function createBlogPost(_prev: BlogFormState, formData: FormData): Promise<BlogFormState> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  const raw = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    content: formData.get("content"),
    excerpt: formData.get("excerpt"),
    author: formData.get("author"),
    featured_image_url: formData.get("featured_image_url") || null,
    tags,
    published: formData.get("published") === "true",
  };

  const parsed = BlogSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = {
    ...parsed.data,
    featured_image_url: parsed.data.featured_image_url || null,
    published_date: parsed.data.published ? new Date().toISOString() : null,
  };

  const supabase = await createAdminClient();
  const { error } = await supabase.from("blog_posts").insert(data);
  if (error) return { error: error.message };

  invalidate();
  return { success: true };
}

export async function updateBlogPost(_prev: BlogFormState, formData: FormData): Promise<BlogFormState> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const id = formData.get("id") as string;
  if (!id) return { error: "ID manquant" };

  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  const raw = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    content: formData.get("content"),
    excerpt: formData.get("excerpt"),
    author: formData.get("author"),
    featured_image_url: formData.get("featured_image_url") || null,
    tags,
    published: formData.get("published") === "true",
  };

  const parsed = BlogSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = {
    ...parsed.data,
    featured_image_url: parsed.data.featured_image_url || null,
    published_date: parsed.data.published ? new Date().toISOString() : null,
  };

  const supabase = await createAdminClient();
  const { error } = await supabase.from("blog_posts").update(data).eq("id", id);
  if (error) return { error: error.message };

  invalidate();
  return { success: true };
}

export async function deleteBlogPost(id: string): Promise<BlogFormState> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const supabase = await createAdminClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return { error: error.message };

  invalidate();
  return { success: true };
}

export async function togglePublished(id: string, published: boolean): Promise<BlogFormState> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("blog_posts")
    .update({ published: !published, published_date: !published ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) return { error: error.message };

  invalidate();
  return { success: true };
}
