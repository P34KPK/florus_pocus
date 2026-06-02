import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { squareClient, SQUARE_LOCATION_ID } from "@/lib/square";
import { createAdminClient } from "@/lib/supabase-server";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { orderConfirmationHtml, orderConfirmationText } from "@/lib/emails/orderConfirmation";

const PaymentSchema = z.object({
  sourceId:  z.string().min(1),
  orderId:   z.string().uuid(),
  amountCAD: z.number().positive(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const parsed = PaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const { sourceId, orderId, amountCAD } = parsed.data;

  const amountMoney = BigInt(Math.round(amountCAD * 100));

  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, total_amount, payment_status, customer_name, customer_email")
    .eq("id", orderId)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  if (order.payment_status === "paid") {
    return NextResponse.json({ error: "Cette commande est déjà payée." }, { status: 409 });
  }

  // Validation côté serveur du montant (anti-fraude)
  const expectedCents = Math.round(order.total_amount * 100);
  if (Math.abs(expectedCents - Number(amountMoney)) > 1) {
    return NextResponse.json({ error: "Montant invalide." }, { status: 400 });
  }

  try {
    const { payment } = await squareClient.payments.create({
      sourceId,
      idempotencyKey: orderId,
      amountMoney: {
        amount:   amountMoney,
        currency: "CAD",
      },
      locationId:  SQUARE_LOCATION_ID,
      referenceId: orderId,
      note: `Commande FlorusPocus #${orderId.slice(0, 8).toUpperCase()}`,
    });

    if (payment?.status === "COMPLETED") {
      // Récupérer les items pour l'email
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("price_per_unit, quantity, metadata")
        .eq("order_id", orderId);

      await supabase
        .from("orders")
        .update({
          payment_status:    "paid",
          status:            "confirmed",
          square_payment_id: payment.id,
        })
        .eq("id", orderId);

      // Envoyer email de confirmation (non-bloquant)
      if (order.customer_email) {
        const items = (orderItems ?? []).map((i) => ({
          name:     (i.metadata as { product_name?: string })?.product_name ?? "Article",
          quantity: i.quantity,
          price:    i.price_per_unit,
        }));

        resend.emails.send({
          from:    FROM_EMAIL,
          to:      order.customer_email,
          subject: `Confirmation de commande #${orderId.slice(0, 8).toUpperCase()} — Florus Pocus`,
          html:    orderConfirmationHtml({ orderId, customerName: order.customer_name, items, total: order.total_amount }),
          text:    orderConfirmationText({ orderId, customerName: order.customer_name, items, total: order.total_amount }),
        }).catch((err) => console.error("[email] confirmation failed:", err));
      }

      return NextResponse.json({ success: true, paymentId: payment.id });
    }

    return NextResponse.json({ error: "Paiement non complété." }, { status: 402 });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur Square inconnue.";
    console.error("[square/payment]", msg);
    return NextResponse.json({ error: "Paiement refusé. Veuillez réessayer." }, { status: 402 });
  }
}
