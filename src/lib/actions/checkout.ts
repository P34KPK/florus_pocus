"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase-server";

const CustomerSchema = z.object({
  name:           z.string().min(2, "Le nom est requis.").max(255),
  email:          z.string().email("Adresse courriel invalide.").max(255),
  phone:          z.string().regex(/^\+?[\d\s\-().]{7,20}$/, "Numéro de téléphone invalide.").optional(),
  address:        z.string().min(5, "L'adresse est requise.").max(500),
  notes:          z.string().max(1000).optional(),
  round_up_amount: z.coerce.number().min(0).max(1).optional(),
});

export type CheckoutState = { success?: boolean; orderId?: string; error?: string };

export async function createOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const parsed = CustomerSchema.safeParse({
    name:            formData.get("name"),
    email:           formData.get("email"),
    phone:           formData.get("phone") || undefined,
    address:         formData.get("address"),
    notes:           formData.get("notes") || undefined,
    round_up_amount: formData.get("round_up_amount") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const itemsRaw = formData.get("items");
  if (!itemsRaw || typeof itemsRaw !== "string") {
    return { error: "Panier vide ou invalide." };
  }

  let items: Array<{ referenceId: string; name: string; price: number; quantity: number; type: string; metadata?: Record<string, string> }>;
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    return { error: "Panier invalide." };
  }

  if (!items.length) return { error: "Votre panier est vide." };

  const itemsTotal  = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const roundUp     = parsed.data.round_up_amount ?? 0;
  const totalAmount = Math.round((itemsTotal + roundUp) * 100) / 100;

  const supabase = createAdminClient();

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      customer_name:    parsed.data.name,
      customer_email:   parsed.data.email,
      customer_phone:   parsed.data.phone ?? null,
      customer_address: parsed.data.address,
      total_amount:     totalAmount,
      round_up_amount:  roundUp,
      notes:            parsed.data.notes ?? null,
      status:           "pending",
      payment_status:   "pending",
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    console.error("[checkout] order insert:", orderErr?.message);
    return { error: "Erreur lors de la création de la commande." };
  }

  const orderItems = items.map((item) => ({
    order_id:       order.id,
    product_id:     item.type === "product" ? item.referenceId : null,
    product_type:   item.type as "product" | "subscription" | "autocueillette",
    quantity:       item.quantity,
    price_per_unit: item.price,
    metadata:       {
      product_name: item.name,
      ...item.metadata,
    },
  }));

  const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);

  if (itemsErr) {
    console.error("[checkout] order_items insert:", itemsErr.message);
    await supabase.from("orders").delete().eq("id", order.id);
    return { error: "Erreur lors de l'enregistrement de la commande." };
  }

  return { success: true, orderId: order.id };
}
