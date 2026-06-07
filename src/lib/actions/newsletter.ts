"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase-server";

const EmailSchema = z.string().email().max(255);

export type NewsletterState = { success?: boolean; error?: string };

export async function subscribeNewsletter(
  _prev: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const raw = formData.get("email");
  const parsed = EmailSchema.safeParse(raw);
  if (!parsed.success) return { error: "Adresse courriel invalide." };

  const supabase = createAdminClient();
  const { error } = await supabase.from("newsletter_subscribers").insert({
    email:  parsed.data,
    source: (formData.get("source") as string) || "popup",
  });

  // Duplicate email → not an error from the user's perspective
  if (error && error.code !== "23505") {
    console.error("[newsletter]", error.message);
    return { error: "Erreur lors de l'inscription. Veuillez réessayer." };
  }

  return { success: true };
}

// Called server-side from contact action (no FormData)
export async function subscribeNewsletterEmail(email: string, source: string) {
  const supabase = createAdminClient();
  try {
    await supabase.from("newsletter_subscribers").insert({ email, source });
  } catch { /* ignore duplicate */ }
}
