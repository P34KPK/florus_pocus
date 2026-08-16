import { createAdminClient } from "@/lib/supabase-server";
import { getResend, FROM_EMAIL } from "@/lib/resend";
import { orderConfirmationHtml, orderConfirmationText, type OrderBreakdown } from "@/lib/emails/orderConfirmation";
import { orderNotificationHtml, orderNotificationText, type OrderNotificationProps } from "@/lib/emails/orderNotification";
import { formatPrix } from "@/lib/pricing";

/**
 * Envoie les deux courriels d'une commande payée : confirmation au client et
 * notification à l'administrateur.
 *
 * Idempotent : la colonne `orders.emails_sent_at` sert de verrou. La route de
 * paiement et le webhook Square appellent tous deux cette fonction ; seul le
 * premier arrivé envoie réellement. C'est ce qui donne au webhook son rôle de
 * filet de secours quand la route de paiement échoue après l'encaissement.
 *
 * Ne lève jamais : un échec d'envoi ne doit pas masquer un paiement réussi.
 * Les erreurs sont journalisées ET enregistrées dans `orders.email_error`.
 */
export async function sendOrderEmails(orderId: string): Promise<void> {
  const supabase = createAdminClient();

  try {
    // Réservation atomique : le UPDATE ne touche la ligne que si personne
    // ne l'a déjà réservée. Si aucune ligne ne revient, les courriels sont
    // déjà partis (ou en cours d'envoi) — on s'arrête là.
    const { data: order } = await supabase
      .from("orders")
      .update({ emails_sent_at: new Date().toISOString() })
      .eq("id", orderId)
      .is("emails_sent_at", null)
      .select("id, customer_name, customer_email, customer_phone, customer_address, delivery_method, notes, total_amount, subtotal, delivery_fee, gst_amount, qst_amount, round_up_amount, is_florist_order")
      .maybeSingle();

    if (!order) return;

    const { data: rows } = await supabase
      .from("order_items")
      .select("price_per_unit, quantity, metadata")
      .eq("order_id", orderId);

    const items = (rows ?? []).map((row) => ({
      name:     (row.metadata as { product_name?: string })?.product_name ?? "Article",
      quantity: row.quantity,
      price:    row.price_per_unit,
    }));

    const total = Number(order.total_amount);
    const errors: string[] = [];

    const { data: settingRows } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["contact_email", "gst_number", "qst_number"]);
    const settings = Object.fromEntries((settingRows ?? []).map((r) => [r.key, r.value ?? ""]));

    const breakdown: OrderBreakdown = {
      subtotal:    Number(order.subtotal ?? 0),
      deliveryFee: Number(order.delivery_fee ?? 0),
      gst:         Number(order.gst_amount ?? 0),
      qst:         Number(order.qst_amount ?? 0),
      roundUp:     Number(order.round_up_amount ?? 0),
      gstNumber:   settings["gst_number"] || undefined,
      qstNumber:   settings["qst_number"] || undefined,
    };

    // --- Confirmation au client ---
    if (order.customer_email) {
      const { error } = await getResend().emails.send({
        from:    FROM_EMAIL,
        to:      order.customer_email,
        subject: `Confirmation de commande #${orderId.slice(0, 8).toUpperCase()} — Florus Pocus`,
        html:    orderConfirmationHtml({ orderId, customerName: order.customer_name, items, total, breakdown }),
        text:    orderConfirmationText({ orderId, customerName: order.customer_name, items, total, breakdown }),
      });
      // Resend ne lève pas d'exception : il retourne { error }. Sans cette
      // lecture, un échec d'envoi resterait totalement invisible.
      if (error) errors.push(`client: ${JSON.stringify(error)}`);
    } else {
      errors.push("client: aucune adresse courriel sur la commande");
    }

    // --- Notification à l'administrateur ---
    const adminEmail = settings["contact_email"] || "info@floruspocus.com";

    const payload: OrderNotificationProps = {
      orderId,
      customerName:   order.customer_name,
      customerEmail:  order.customer_email,
      customerPhone:  order.customer_phone,
      deliveryMethod: order.delivery_method === "pickup" ? "pickup" : "delivery",
      address:        order.customer_address,
      notes:          order.notes,
      items,
      total,
      roundUp:        breakdown.roundUp,
      isFloristOrder: Boolean(order.is_florist_order),
      breakdown,
    };

    const { error: adminError } = await getResend().emails.send({
      from:    FROM_EMAIL,
      to:      adminEmail,
      replyTo: order.customer_email || undefined,
      subject: `${payload.isFloristOrder ? "[FLEURISTE] " : ""}Nouvelle commande #${orderId.slice(0, 8).toUpperCase()} — ${formatPrix(total)} $`,
      html:    orderNotificationHtml(payload),
      text:    orderNotificationText(payload),
    });
    if (adminError) errors.push(`admin: ${JSON.stringify(adminError)}`);

    if (errors.length) {
      console.error("[orderEmails] échec d'envoi", orderId, errors.join(" | "));
      await supabase.from("orders").update({ email_error: errors.join(" | ").slice(0, 2000) }).eq("id", orderId);
    } else {
      await supabase.from("orders").update({ email_error: null }).eq("id", orderId);
    }
  } catch (err) {
    // getResend() lève si RESEND_API_KEY manque — on trace sans jamais propager.
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[orderEmails] exception", orderId, msg);
    await supabase.from("orders").update({ email_error: `exception: ${msg}`.slice(0, 2000) }).eq("id", orderId);
  }
}
