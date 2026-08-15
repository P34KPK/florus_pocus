"use server";

import { z } from "zod";
import { createAdminClient, getSiteSettings } from "@/lib/supabase-server";
import { computeTotals, pricingFromSettings } from "@/lib/pricing";
import { isFloristAuthenticated } from "@/lib/actions/florist";

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
  // Le client indique seulement s'il souhaite l'arrondi ; le montant exact est
  // calculé ici, après taxes et livraison.
  round_up:        z.boolean(),
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

export type CheckoutState = { success?: boolean; orderId?: string; total?: number; error?: string };

/** Article tel qu'envoyé par le panier du navigateur. Le prix qu'il contient n'est JAMAIS utilisé. */
const CartItemSchema = z.object({
  referenceId: z.string().uuid(),
  name:        z.string().max(255).optional(),
  price:       z.number().optional(),
  quantity:    z.number().int().min(1).max(99),
  type:        z.enum(["product", "subscription", "autocueillette"]),
  metadata:    z.record(z.string(), z.string()).optional(),
});

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
    round_up:        formData.get("round_up") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const itemsRaw = formData.get("items");
  if (!itemsRaw || typeof itemsRaw !== "string") {
    return { error: "Panier vide ou invalide." };
  }

  let rawItems: unknown;
  try {
    rawItems = JSON.parse(itemsRaw);
  } catch {
    return { error: "Panier invalide." };
  }

  const itemsParsed = z.array(CartItemSchema).min(1).max(50).safeParse(rawItems);
  if (!itemsParsed.success) {
    return { error: "Votre panier est vide ou invalide." };
  }
  const items = itemsParsed.data;

  const supabase = createAdminClient();

  // ── Prix recalculés côté serveur ──────────────────────────────────────────
  // Le panier vit dans le navigateur : ses prix sont modifiables par le client.
  // On ne s'en sert donc que pour connaître QUOI a été commandé ; le montant
  // vient toujours de la base. Les prix de gros ne s'appliquent que si le cookie
  // fleuriste est valide, vérifié ici côté serveur.
  const isFlorist = await isFloristAuthenticated();

  const productIds = items.filter((i) => i.type === "product").map((i) => i.referenceId);
  const subIds     = items.filter((i) => i.type === "subscription").map((i) => i.referenceId);

  const [{ data: dbProducts }, { data: dbSubs }] = await Promise.all([
    productIds.length
      ? supabase.from("products").select("id, name, price, florist_price, price_type, active, stock").in("id", productIds)
      : Promise.resolve({ data: [] as never[] }),
    subIds.length
      ? supabase.from("subscriptions").select("id, name, price, active").in("id", subIds)
      : Promise.resolve({ data: [] as never[] }),
  ]);

  const productById = new Map((dbProducts ?? []).map((p) => [p.id, p]));
  const subById     = new Map((dbSubs ?? []).map((s) => [s.id, s]));

  const priced: Array<{ item: (typeof items)[number]; name: string; unitPrice: number }> = [];

  for (const item of items) {
    if (item.type === "product") {
      const p = productById.get(item.referenceId);
      if (!p || !p.active)         return { error: "Un article de votre panier n'est plus disponible. Veuillez rafraîchir votre panier." };
      if (p.price_type === "devis") return { error: `« ${p.name} » est vendu sur devis et ne peut pas être payé en ligne. Retirez-le de votre panier.` };
      if (p.stock === 0)            return { error: `« ${p.name} » est épuisé. Retirez-le de votre panier.` };

      const unitPrice = isFlorist && p.florist_price !== null ? Number(p.florist_price) : Number(p.price);
      if (!(unitPrice > 0))         return { error: `Le prix de « ${p.name} » est indisponible. Contactez-nous pour finaliser cette commande.` };

      priced.push({ item, name: p.name, unitPrice });
    } else if (item.type === "subscription") {
      const s = subById.get(item.referenceId);
      if (!s || !s.active)          return { error: "Un abonnement de votre panier n'est plus disponible. Veuillez rafraîchir votre panier." };
      if (!(Number(s.price) > 0))   return { error: `Le prix de « ${s.name} » est indisponible.` };

      priced.push({ item, name: s.name, unitPrice: Number(s.price) });
    } else {
      return { error: "Un article de votre panier n'est plus offert. Veuillez rafraîchir votre panier." };
    }
  }

  // Taxes et livraison : mêmes règles et mêmes réglages que ceux affichés à la
  // caisse, via le module partagé `pricing.ts`.
  const settings = await getSiteSettings();
  const totals   = computeTotals({
    subtotal:         priced.reduce((acc, p) => acc + p.unitPrice * p.item.quantity, 0),
    deliveryMethod:   parsed.data.delivery_method,
    config:           pricingFromSettings(settings),
    roundUpRequested: parsed.data.round_up,
  });

  if (!(totals.total > 0)) {
    return { error: "Le montant de la commande est invalide." };
  }

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
      subtotal:             totals.subtotal,
      delivery_fee:         totals.deliveryFee,
      gst_amount:           totals.gst,
      qst_amount:           totals.qst,
      total_amount:         totals.total,
      round_up_amount:      totals.roundUp,
      notes:                parsed.data.notes ?? null,
      status:               "pending",
      payment_status:       "pending",
      is_florist_order:     isFlorist,
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    console.error("[checkout] order insert:", orderErr?.message);
    return { error: "Erreur lors de la création de la commande." };
  }

  const orderItems = priced.map(({ item, name, unitPrice }) => ({
    order_id:       order.id,
    product_id:     item.type === "product" ? item.referenceId : null,
    product_type:   item.type,
    quantity:       item.quantity,
    price_per_unit: unitPrice,
    metadata:       {
      ...item.metadata,
      product_name: name,
    },
  }));

  const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);

  if (itemsErr) {
    console.error("[checkout] order_items insert:", itemsErr.message);
    await supabase.from("orders").delete().eq("id", order.id);
    return { error: "Erreur lors de l'enregistrement de la commande." };
  }

  // `total` remonte au client pour qu'il compare avec le montant affiché avant
  // de lancer le paiement — jamais de surprise sur la carte.
  return { success: true, orderId: order.id, total: totals.total };
}
