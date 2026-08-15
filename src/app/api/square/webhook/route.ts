import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createAdminClient } from "@/lib/supabase-server";
import { sendOrderEmails } from "@/lib/orderEmails";

function verifySignature(body: string, signature: string, url: string): boolean {
  const secret = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!secret) return false;

  const hash = createHmac("sha256", secret)
    .update(url + body)
    .digest("base64");

  return hash === signature;
}

export async function POST(req: NextRequest) {
  const rawBody   = await req.text();
  const signature = req.headers.get("x-square-hmacsha256-signature") ?? "";

  // Utiliser l'URL réelle de la requête pour que la signature corresponde
  // peu importe www ou non dans NEXT_PUBLIC_SITE_URL
  const url = req.url;

  if (!verifySignature(rawBody, signature, url)) {
    return NextResponse.json({ error: "Signature invalide." }, { status: 401 });
  }

  let event: { type: string; data?: { object?: { payment?: { reference_id?: string; id?: string; status?: string } } } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const payment  = event.data?.object?.payment;
  const orderId  = payment?.reference_id;
  const paymentId = payment?.id;
  const status   = payment?.status;

  const supabase = createAdminClient();

  // payment.completed OU payment.updated/created avec status COMPLETED
  if (
    event.type === "payment.completed" ||
    ((event.type === "payment.updated" || event.type === "payment.created") && status === "COMPLETED")
  ) {
    // Les paiements encaissés au terminal (POS) passent aussi par ce webhook,
    // mais sans reference_id : ils ne correspondent à aucune commande web.
    if (orderId && paymentId) {
      // Ne marque payée qu'une commande encore en attente, sans écraser un
      // statut déjà avancé (expédiée, livrée…).
      await supabase
        .from("orders")
        .update({
          payment_status:    "completed",
          status:            "paid",
          square_payment_id: paymentId,
        })
        .eq("id", orderId)
        .eq("payment_status", "pending");

      // Filet de secours : appelé systématiquement, même si la route de
      // paiement a déjà marqué la commande. L'idempotence est assurée par
      // `orders.emails_sent_at`, donc aucun risque de doublon — et si la route
      // de paiement a planté après l'encaissement, les courriels partent ici.
      await sendOrderEmails(orderId);
    }
  }

  // payment.failed OU payment.updated avec status FAILED/CANCELED
  if (
    event.type === "payment.failed" ||
    (event.type === "payment.updated" && (status === "FAILED" || status === "CANCELED"))
  ) {
    if (orderId) {
      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("id", orderId)
        .eq("payment_status", "pending");
    }
  }

  return NextResponse.json({ received: true });
}
