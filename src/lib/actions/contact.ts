"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase-server";
import { getResend, FROM_EMAIL } from "@/lib/resend";

const ContactSchema = z.object({
  nom:       z.string().min(2, "Le nom est requis.").max(255),
  email:     z.string().email("Adresse courriel invalide.").max(255),
  telephone: z.string()
    .regex(/^\+?[\d\s\-().]{7,20}$/, "Numéro de téléphone invalide.")
    .max(50),
  message:   z.string().min(10, "Le message doit faire au moins 10 caractères.").max(5000),
  newsletter: z.enum(["on", "off"]).optional(),
});

export type ContactState = { success?: boolean; error?: string };

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function sendContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = ContactSchema.safeParse({
    nom:       formData.get("nom"),
    email:     formData.get("email"),
    telephone: formData.get("telephone"),
    message:   formData.get("message"),
    newsletter: formData.get("newsletter") ?? "off",
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { error: first ?? "Données invalides." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("contact_messages").insert({
    name:      parsed.data.nom,
    email:     parsed.data.email,
    telephone: parsed.data.telephone ?? null,
    message:   parsed.data.message,
  });

  if (error) {
    console.error("[contact]", error.message);
    return { error: "Erreur d'envoi. Veuillez réessayer." };
  }

  // Abonnement infolettre si coché
  if (parsed.data.newsletter === "on") {
    try {
      await supabase.from("newsletter_subscribers").insert({
        email:  parsed.data.email,
        source: "contact",
      });
    } catch { /* ignore duplicate */ }
  }

  // Notification email à l'admin — non bloquant
  try {
    const { data: setting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "contact_email")
      .single();
    const adminEmail = setting?.value || "info@floruspocus.com";

    const phoneHtml = parsed.data.telephone
      ? `<p><strong>Téléphone :</strong> ${escapeHtml(parsed.data.telephone)}</p>`
      : "";
    const newsletterHtml = parsed.data.newsletter === "on"
      ? `<p style="color:#2D5016;">✓ Inscrit(e) à l'infolettre</p>`
      : "";

    const { error: mailError } = await getResend().emails.send({
      from:    FROM_EMAIL,
      to:      adminEmail,
      replyTo: parsed.data.email,
      subject: `Nouveau message de ${parsed.data.nom} — Florus Pocus`,
      html: `
        <h2 style="font-family:Georgia,serif;color:#2D5016;">Nouveau message du formulaire de contact</h2>
        <p><strong>Nom :</strong> ${escapeHtml(parsed.data.nom)}</p>
        <p><strong>Courriel :</strong> ${escapeHtml(parsed.data.email)}</p>
        ${phoneHtml}
        ${newsletterHtml}
        <p><strong>Message :</strong></p>
        <p style="white-space:pre-wrap;background:#FAFAF8;padding:16px;border-radius:8px;border:1px solid #E0D5C8;">${escapeHtml(parsed.data.message)}</p>
      `,
      text: `Nouveau message de ${parsed.data.nom} (${parsed.data.email})${parsed.data.telephone ? ` — Tél: ${parsed.data.telephone}` : ""}\n\n${parsed.data.message}`,
    });

    // Resend ne lève pas d'exception sur erreur API : il faut lire l'objet error.
    if (mailError) {
      console.error("[contact] Resend a refusé l'envoi:", JSON.stringify(mailError));
    }
  } catch (err) {
    console.error("[contact] notification email failed:", err);
  }

  return { success: true };
}
