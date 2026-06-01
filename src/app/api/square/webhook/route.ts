import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createAdminClient } from "@/lib/supabase-server";

function verifySignature(body: string, signature: string, url: string): boolean {
  const secret = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!secret) return false;

  const hash = createHmac("sha256", secret)
    .update(url + body)
    .digest("base64");

  return hash === signature;
}

export async function POST(req: NextRequest) {
  const rawBody  = await req.text();
  const signature = req.headers.get("x-square-hmacsha256-signature") ?? "";
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/api/square/webhook`;

  if (!verifySignature(rawBody, signature, url)) {
    return NextResponse.json({ error: "Signature invalide." }, { status: 401 });
  }

  let event: { type: string; data?: { object?: { payment?: { reference_id?: string; id?: string; status?: string } } } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  if (event.type === "payment.completed") {
    const payment = event.data?.object?.payment;
    const orderId = payment?.reference_id;
    const paymentId = payment?.id;

    if (orderId && paymentId) {
      const supabase = createAdminClient();
      await supabase
        .from("orders")
        .update({
          payment_status:    "paid",
          status:            "confirmed",
          square_payment_id: paymentId,
        })
        .eq("id", orderId)
        .eq("payment_status", "pending");
    }
  }

  if (event.type === "payment.failed") {
    const orderId = event.data?.object?.payment?.reference_id;
    if (orderId) {
      const supabase = createAdminClient();
      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("id", orderId)
        .eq("payment_status", "pending");
    }
  }

  return NextResponse.json({ received: true });
}
