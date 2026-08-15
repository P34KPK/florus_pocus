import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { squareClient, SQUARE_LOCATION_ID } from "@/lib/square";
import { createAdminClient } from "@/lib/supabase-server";
import { sendOrderEmails } from "@/lib/orderEmails";

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

  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, total_amount, payment_status")
    .eq("id", orderId)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  // `payment_status` est un enum Postgres : pending | completed | failed.
  // (L'ancienne valeur testée ici, "paid", n'existe pas — le garde-fou ne
  // s'est jamais déclenché.)
  if (order.payment_status === "completed") {
    return NextResponse.json({ error: "Cette commande est déjà payée." }, { status: 409 });
  }

  // Le montant encaissé vient TOUJOURS de la base, jamais du navigateur.
  const expectedCents = Math.round(Number(order.total_amount) * 100);
  const amountMoney   = BigInt(expectedCents);

  // Le montant annoncé par le client doit correspondre à celui affiché ; sinon
  // son panier est périmé et on refuse plutôt que de débiter une autre somme.
  if (Math.abs(expectedCents - Math.round(amountCAD * 100)) > 1) {
    return NextResponse.json(
      { error: "Le montant de votre panier a changé. Rafraîchissez la page avant de payer." },
      { status: 409 },
    );
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
      const { error: updateErr } = await supabase
        .from("orders")
        .update({
          payment_status:    "completed",
          status:            "paid",
          square_payment_id: payment.id,
        })
        .eq("id", orderId);

      if (updateErr) {
        // Le paiement Square a réussi mais la mise à jour DB a échoué.
        // On log en priorité — la commande est récupérable via square_payment_id.
        console.error("[square/payment] order update failed:", updateErr.message, "orderId:", orderId, "paymentId:", payment.id);
      }

      // Confirmation au client + notification à l'admin. JAMAIS bloquant : un
      // échec d'envoi ne doit pas masquer un paiement réussi (carte déjà
      // débitée). sendOrderEmails ne lève pas et est idempotent — si elle
      // échoue ici, le webhook Square repassera derrière.
      await sendOrderEmails(orderId);

      return NextResponse.json({ success: true, paymentId: payment.id });
    }

    return NextResponse.json({ error: "Paiement non complété." }, { status: 402 });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur Square inconnue.";
    console.error("[square/payment]", msg);
    return NextResponse.json({ error: "Paiement refusé. Veuillez réessayer." }, { status: 402 });
  }
}
