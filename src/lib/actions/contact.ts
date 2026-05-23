"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase-server";

const ContactSchema = z.object({
  nom:     z.string().min(2, "Le nom est requis.").max(255),
  email:   z.string().email("Adresse courriel invalide.").max(255),
  message: z.string().min(10, "Le message doit faire au moins 10 caractères.").max(5000),
});

export type ContactState = { success?: boolean; error?: string };

export async function sendContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = ContactSchema.safeParse({
    nom:     formData.get("nom"),
    email:   formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { error: first ?? "Données invalides." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("contact_messages").insert({
    name:    parsed.data.nom,
    email:   parsed.data.email,
    message: parsed.data.message,
  });

  if (error) {
    console.error("[contact]", error.message);
    return { error: "Erreur d'envoi. Veuillez réessayer." };
  }

  return { success: true };
}
