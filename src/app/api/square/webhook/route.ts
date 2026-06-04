import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createAdminClient } from "@/lib/supabase-server";
import { getResend, FROM_EMAIL } from "@/lib/resend";
import { orderConfirmationHtml, orderConfirmationText } from "@/lib/emails/orderConfirmation";

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
    if (orderId && paymentId) {
      const { data: updated } = await supabase
        .from("orders")
        .update({
          payment_status:    "paid",
          status:            "confirmed",
          square_payment_id: paymentId,
        })
        .eq("id", orderId)
        .eq("payment_status", "pending")
        .select("id, customer_name, customer_email")
        .single();

      if (updated?.customer_email) {
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("price_per_unit, quantity, metadata")
          .eq("order_id", orderId);

        const items = (orderItems ?? []).map((row) => ({
          name:     (row.metadata as { product_name?: string })?.product_name ?? "Article",
          quantity: row.quantity,
          price:    row.price_per_unit,
        }));

        const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

        try {
          const resend = getResend();
          await resend.emails.send({
            from:    FROM_EMAIL,
            to:      updated.customer_email,
            subject: "Votre commande Florus Pocus est confirmée 🌸",
            html:    orderConfirmationHtml({ orderId, customerName: updated.customer_name, items, total }),
            text:    orderConfirmationText({ orderId, customerName: updated.customer_name, items, total }),
          });
        } catch (err) {
          console.error("[webhook] resend error:", err);
        }
      }
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
