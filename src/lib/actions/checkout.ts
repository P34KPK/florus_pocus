"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase-server";

const POSTAL_CODE = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

const CustomerSchema = z.object({
  name:            z.string().min(2, "Le nom est requis.").max(255),
  email:           z.string().email("Adresse courriel invalide.").max(255),
  phone:           z.string().regex(/^\+?[\d\s\-().]{7,20}$/, "Numéro de téléphone invalide."),
  delivery_method: z.enum(["pickup", "delivery"]),
  address:         z.string().max(500).optional(),
  city:            z.string().max(255).optional(),
  province:        z.string().max(100).optional(),
  postal_code:     z.string().max(20).optional(),
  notes:           z.string().max(1000).optional(),
  round_up_amount: z.coerce.number().min(0).max(1).optional(),
}).superRefine((data, ctx) => {
  // L'adresse n'est requise que pour la livraison locale (pas pour le ramassage).
  if (data.delivery_method === "delivery") {
    if (!data.address || data.address.trim().length < 5)
      ctx.addIssue({ code: "custom", path: ["address"], message: "L'adresse est requise." });
    if (!data.city || data.city.trim().length < 2)
      ctx.addIssue({ code: "custom", path: ["city"], message: "La ville est requise." });
    if (!data.province || data.province.trim().length < 2)
      ctx.addIssue({ code: "custom", path: ["province"], message: "La province est requise." });
    if (!data.postal_code || !POSTAL_CODE.test(data.postal_code.trim()))
      ctx.addIssue({ code: "custom", path: ["postal_code"], message: "Code postal invalide (ex : G3H 1A1)." });
  }
});

export type CheckoutState = { success?: boolean; orderId?: string; error?: string };

export async function createOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const parsed = CustomerSchema.safeParse({
    name:            formData.get("name"),
    email:           formData.get("email"),
    phone:           formData.get("phone"),
    delivery_method: formData.get("delivery_method") || "delivery",
    address:         formData.get("address") || undefined,
    city:            formData.get("city") || undefined,
    province:        formData.get("province") || undefined,
    postal_code:     formData.get("postal_code") || undefined,
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

  const isPickup = parsed.data.delivery_method === "pickup";
  const fullAddress = isPickup
    ? "Ramassage à la ferme"
    : `${parsed.data.address}, ${parsed.data.city} (${parsed.data.province}) ${parsed.data.postal_code}`;

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      customer_name:        parsed.data.name,
      customer_email:       parsed.data.email,
      customer_phone:       parsed.data.phone,
      customer_address:     fullAddress,
      delivery_method:      parsed.data.delivery_method,
      customer_city:        isPickup ? null : parsed.data.city,
      customer_province:    isPickup ? null : parsed.data.province,
      customer_postal_code: isPickup ? null : parsed.data.postal_code,
      total_amount:         totalAmount,
      round_up_amount:      roundUp,
      notes:                parsed.data.notes ?? null,
      status:               "pending",
      payment_status:       "pending",
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
