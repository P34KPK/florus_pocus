"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase-server";
import { assertAdmin } from "./auth-guard";

const SubscriptionSchema = z.object({
  name:           z.string().min(1).max(200),
  description:    z.string().min(1),
  price:          z.coerce.number().positive(),
  bouquets_count: z.coerce.number().int().min(1, "Le nombre de bouquets doit être au moins 1"),
  format:         z.string().min(1).max(100),
  active:         z.coerce.boolean(),
});

const DropoffSchema = z.object({
  subscription_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  address: z.string().min(1),
  days_available: z.array(z.number().int().min(0).max(6)),
  hours_start: z.string().regex(/^\d{2}:\d{2}$/),
  hours_end: z.string().regex(/^\d{2}:\d{2}$/),
});

export type SubFormState = { error?: string; success?: boolean };

function invalidate() {
  revalidateTag("subscriptions", "max");
  revalidatePath("/abonnements");
  revalidatePath("/admin/abonnements");
  revalidatePath("/");
}

export async function createSubscription(_prev: SubFormState, formData: FormData): Promise<SubFormState> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const raw = {
    name:           formData.get("name"),
    description:    formData.get("description"),
    price:          formData.get("price"),
    bouquets_count: formData.get("bouquets_count"),
    format:         formData.get("format"),
    active:         formData.get("active") === "true",
  };

  const parsed = SubscriptionSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createAdminClient();
  const { error } = await supabase.from("subscriptions").insert(parsed.data);
  if (error) return { error: error.message };

  invalidate();
  return { success: true };
}

export async function updateSubscription(_prev: SubFormState, formData: FormData): Promise<SubFormState> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const id = formData.get("id") as string;
  if (!id) return { error: "ID manquant" };

  const raw = {
    name:           formData.get("name"),
    description:    formData.get("description"),
    price:          formData.get("price"),
    bouquets_count: formData.get("bouquets_count"),
    format:         formData.get("format"),
    active:         formData.get("active") === "true",
  };

  const parsed = SubscriptionSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createAdminClient();
  const { error } = await supabase.from("subscriptions").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  invalidate();
  return { success: true };
}

export async function deleteSubscription(id: string): Promise<SubFormState> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const supabase = await createAdminClient();
  const { error } = await supabase.from("subscriptions").delete().eq("id", id);
  if (error) return { error: error.message };

  invalidate();
  return { success: true };
}

export async function createDropoffPoint(_prev: SubFormState, formData: FormData): Promise<SubFormState> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const daysRaw = formData.getAll("days_available");
  const raw = {
    subscription_id: formData.get("subscription_id"),
    name: formData.get("name"),
    address: formData.get("address"),
    days_available: daysRaw.map(Number),
    hours_start: formData.get("hours_start"),
    hours_end: formData.get("hours_end"),
  };

  const parsed = DropoffSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createAdminClient();
  const { error } = await supabase.from("subscription_dropoff_points").insert(parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/admin/abonnements");
  return { success: true };
}

export async function deleteDropoffPoint(id: string): Promise<SubFormState> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const supabase = await createAdminClient();
  const { error } = await supabase.from("subscription_dropoff_points").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/abonnements");
  return { success: true };
}
