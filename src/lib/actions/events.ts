"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase-server";

const EventSchema = z.object({
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  capacity: z.coerce.number().int().positive(),
  price_per_ticket: z.coerce.number().positive(),
  description: z.string().nullable().or(z.literal("")),
  active: z.coerce.boolean(),
});

export type EventFormState = { error?: string; success?: boolean };

export async function createEvent(_prev: EventFormState, formData: FormData): Promise<EventFormState> {
  const raw = {
    event_date: formData.get("event_date"),
    capacity: formData.get("capacity"),
    price_per_ticket: formData.get("price_per_ticket"),
    description: formData.get("description") || null,
    active: formData.get("active") === "true",
  };

  const parsed = EventSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = { ...parsed.data, description: parsed.data.description || null };

  const supabase = await createAdminClient();
  const { error } = await supabase.from("autocueillette_events").insert(data);
  if (error) return { error: error.message };

  revalidatePath("/admin/autocueillette");
  revalidatePath("/");
  return { success: true };
}

export async function updateEvent(_prev: EventFormState, formData: FormData): Promise<EventFormState> {
  const id = formData.get("id") as string;
  if (!id) return { error: "ID manquant" };

  const raw = {
    event_date: formData.get("event_date"),
    capacity: formData.get("capacity"),
    price_per_ticket: formData.get("price_per_ticket"),
    description: formData.get("description") || null,
    active: formData.get("active") === "true",
  };

  const parsed = EventSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const data = { ...parsed.data, description: parsed.data.description || null };

  const supabase = await createAdminClient();
  const { error } = await supabase.from("autocueillette_events").update(data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/autocueillette");
  revalidatePath("/");
  return { success: true };
}

export async function deleteEvent(id: string): Promise<EventFormState> {
  const supabase = await createAdminClient();
  const { error } = await supabase.from("autocueillette_events").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/autocueillette");
  revalidatePath("/");
  return { success: true };
}
