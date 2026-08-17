import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { squareClient, SQUARE_LOCATION_ID } from "@/lib/square";
import { createAdminClient } from "@/lib/supabase-server";
import { sendOrderEmails } from "@/lib/orderEmails";
import { applyOrderStock } from "@/lib/stock";

/**
 * Détaille une erreur Square pour la rendre exploitable.
 *
 * Le SDK lève une exception dont le message seul (« Bad Request ») ne dit rien.
 * Ce qui compte est dans `errors[]` : `category` distingue une carte refusée
 * (`PAYMENT_METHOD_ERROR`) d'un problème de configuration (`AUTHENTICATION_ERROR`,
 * `INVALID_REQUEST_ERROR`) — deux situations qui appellent des réponses opposées.
 */
function detailsSquare(err: unknown): { texte: string; categorie: string | null; code: string | null } {
  const e = err as {
    statusCode?: number;
    errors?: Array<{ category?: string; code?: string; detail?: string }>;
    body?: unknown;
    message?: string;
  } | null;

  if (!e || typeof e !== "object") {
    return { texte: String(err).slice(0, 500), categorie: null, code: null };
  }

  const morceaux: string[] = [];
  if (e.statusCode) morceaux.push(`HTTP ${e.statusCode}`);

  const premiere = Array.isArray(e.errors) ? e.errors[0] : undefined;
  if (Array.isArray(e.errors) && e.errors.length) {
    morceaux.push(
      ...e.errors.map((x) => [x.category, x.code, x.detail].filter(Boolean).join(" / ")),
    );
  } else if (e.body !== undefined) {
    morceaux.push(typeof e.body === "string" ? e.body : JSON.stringify(e.body));
  } else if (e.message) {
    morceaux.push(e.message);
  }

  return {
    texte:     morceaux.join(" | ").slice(0, 500) || "Erreur Square sans détail.",
    categorie: premiere?.category ?? null,
    code:      premiere?.code ?? null,
  };
}

/** Message destiné à l'acheteur — sans jargon, mais qui distingue les deux cas. */
function messageAcheteur(categorie: string | null, code: string | null): string {
  if (categorie === "PAYMENT_METHOD_ERROR") {
    if (code === "INSUFFICIENT_FUNDS") return "Fonds insuffisants sur cette carte.";
    if (code === "CVV_FAILURE")        return "Le code de sécurité (CVV) est incorrect.";
    if (code === "ADDRESS_VERIFICATION_FAILURE") return "L'adresse de facturation ne correspond pas à la carte.";
    if (code === "EXPIRATION_FAILURE") return "La date d'expiration de la carte est invalide.";
    if (code === "CARD_EXPIRED")       return "Cette carte est expirée.";
    return "Votre carte a été refusée. Essayez une autre carte.";
  }
  // Tout le reste (authentification, requête invalide, panne) n'est pas la faute
  // de l'acheteur : ne pas lui dire de réessayer indéfiniment.
  return "Le paiement n'a pas pu être traité en raison d'un problème technique. Votre carte n'a pas été débitée — contactez-nous et nous finaliserons votre commande.";
}

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

      // Le stock ne bouge qu'ici, une fois l'argent encaissé — jamais à la
      // création de la commande, sinon les tentatives échouées consommeraient
      // du stock qui n'a jamais été vendu.
      await applyOrderStock(orderId);

      // Confirmation au client + notification à l'admin. JAMAIS bloquant : un
      // échec d'envoi ne doit pas masquer un paiement réussi (carte déjà
      // débitée). sendOrderEmails ne lève pas et est idempotent — si elle
      // échoue ici, le webhook Square repassera derrière.
      await sendOrderEmails(orderId);

      return NextResponse.json({ success: true, paymentId: payment.id });
    }

    // Square a répondu sans encaisser : l'issue est certaine, donc la commande
    // est marquée « failed ». Sans cela elle restait « pending », impossible à
    // distinguer d'une vraie commande à préparer dans l'admin.
    console.error("[square/payment] statut non complété:", payment?.status, "orderId:", orderId);
    await supabase
      .from("orders")
      .update({ payment_status: "failed", payment_error: `Statut Square : ${payment?.status ?? "inconnu"}` })
      .eq("id", orderId);

    return NextResponse.json({ error: "Paiement non complété." }, { status: 402 });

  } catch (err: unknown) {
    const { texte, categorie, code } = detailsSquare(err);
    console.error("[square/payment]", texte, "orderId:", orderId);

    // La vraie cause est écrite en base : sans elle, un échec en production est
    // indiagnosticable (les logs runtime de Vercel ne sont pas accessibles ici).
    // On n'écrase pas `payment_status` : l'issue est incertaine (la carte a pu
    // être débitée avant la coupure), et le webhook Square doit rester libre de
    // confirmer un encaissement réel.
    await supabase.from("orders").update({ payment_error: texte }).eq("id", orderId);

    return NextResponse.json({ error: messageAcheteur(categorie, code) }, { status: 402 });
  }
}
