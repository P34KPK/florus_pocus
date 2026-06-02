import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { squareClient, SQUARE_LOCATION_ID } from "@/lib/square";
import { createAdminClient } from "@/lib/supabase-server";

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
    .select("id, total_amount, payment_status")
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
      await supabase
        .from("orders")
        .update({
          payment_status:    "paid",
          status:            "confirmed",
          square_payment_id: payment.id,
        })
        .eq("id", orderId);

      return NextResponse.json({ success: true, paymentId: payment.id });
    }

    return NextResponse.json({ error: "Paiement non complété." }, { status: 402 });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur Square inconnue.";
    console.error("[square/payment]", msg);
    return NextResponse.json({ error: "Paiement refusé. Veuillez réessayer." }, { status: 402 });
  }
}
