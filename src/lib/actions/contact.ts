"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase-server";
import { getResend, FROM_EMAIL } from "@/lib/resend";

const ContactSchema = z.object({
  nom:     z.string().min(2, "Le nom est requis.").max(255),
  email:   z.string().email("Adresse courriel invalide.").max(255),
  message: z.string().min(10, "Le message doit faire au moins 10 caractères.").max(5000),
});

export type ContactState = { success?: boolean; error?: string };

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

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

  // Notification email à l'admin — non bloquant, ne doit jamais faire échouer
  // l'enregistrement du message déjà sauvegardé en DB.
  try {
    const { data: setting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "contact_email")
      .single();
    const adminEmail = setting?.value || "info@floruspocus.com";

    await getResend().emails.send({
      from:     FROM_EMAIL,
      to:       adminEmail,
      replyTo:  parsed.data.email,
      subject:  `Nouveau message de ${parsed.data.nom} — Florus Pocus`,
      html: `
        <h2 style="font-family:Georgia,serif;color:#2D5016;">Nouveau message du formulaire de contact</h2>
        <p><strong>Nom :</strong> ${escapeHtml(parsed.data.nom)}</p>
        <p><strong>Courriel :</strong> ${escapeHtml(parsed.data.email)}</p>
        <p><strong>Message :</strong></p>
        <p style="white-space:pre-wrap;background:#FAFAF8;padding:16px;border-radius:8px;border:1px solid #E0D5C8;">${escapeHtml(parsed.data.message)}</p>
      `,
      text: `Nouveau message de ${parsed.data.nom} (${parsed.data.email})\n\n${parsed.data.message}`,
    });
  } catch (err) {
    console.error("[contact] notification email failed:", err);
  }

  return { success: true };
}
