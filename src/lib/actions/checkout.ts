"use server";

import { z } from "zod";
import { createAdminClient, getSiteSettings } from "@/lib/supabase-server";
import { computeTotals, effectiveUnitPrice, pricingFromSettings, type OrderTotals } from "@/lib/pricing";
import { isSoldOut } from "@/lib/inventory";
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
  // Identifiant de ligne du panier. Renvoyé tel quel par `quoteCart` : le
  // reconstruire perdrait le suffixe des abonnements (même abonnement à deux
  // points de chute = deux lignes distinctes).
  cartId:      z.string().min(1).max(200).optional(),
  referenceId: z.string().uuid(),
  name:        z.string().max(255).optional(),
  price:       z.number().optional(),
  quantity:    z.number().int().min(1).max(99),
  type:        z.enum(["product", "subscription", "autocueillette"]),
  metadata:    z.record(z.string(), z.string()).optional(),
});

type CartItemInput = z.infer<typeof CartItemSchema>;

interface PricedLine {
  item:      CartItemInput;
  name:      string;
  unitPrice: number;
}

/**
 * Tarification autoritaire d'un panier, depuis la base.
 *
 * Point d'entrée unique partagé par `quoteCart` (ce que la caisse AFFICHE) et
 * `createOrder` (ce qui est ENCAISSÉ). Les deux doivent traverser exactement le
 * même code : c'est la seule garantie que le montant montré et le montant débité
 * ne puissent pas diverger — une divergence fait échouer la vente au lieu de
 * débiter le client à son insu.
 */
async function priceItems(
  items: CartItemInput[],
): Promise<{ error: string } | { lines: PricedLine[]; isFlorist: boolean }> {
  const supabase = createAdminClient();

  // Le panier vit dans le navigateur : ses prix sont modifiables par le client.
  // On ne s'en sert que pour connaître QUOI a été commandé. Les prix de gros ne
  // s'appliquent que si le cookie fleuriste est valide, vérifié ici côté serveur.
  const isFlorist = await isFloristAuthenticated();

  const productIds = items.filter((i) => i.type === "product").map((i) => i.referenceId);
  const subIds     = items.filter((i) => i.type === "subscription").map((i) => i.referenceId);

  const [{ data: dbProducts }, { data: dbSubs }] = await Promise.all([
    productIds.length
      ? supabase
          .from("products")
          .select("id, name, price, florist_price, price_type, active, stock, track_inventory")
          .in("id", productIds)
      : Promise.resolve({ data: [] as never[] }),
    subIds.length
      ? supabase.from("subscriptions").select("id, name, price, active").in("id", subIds)
      : Promise.resolve({ data: [] as never[] }),
  ]);

  const productById = new Map((dbProducts ?? []).map((p) => [p.id, p]));
  const subById     = new Map((dbSubs ?? []).map((s) => [s.id, s]));

  const lines: PricedLine[] = [];

  for (const item of items) {
    if (item.type === "product") {
      const p = productById.get(item.referenceId);
      if (!p || !p.active)          return { error: "Un article de votre panier n'est plus disponible. Veuillez rafraîchir votre panier." };
      if (p.price_type === "devis") return { error: `« ${p.name} » est vendu sur devis et ne peut pas être payé en ligne. Retirez-le de votre panier.` };
      // `isSoldOut` et non `stock === 0` : sans suivi d'inventaire, un stock à 0
      // signifie « illimité ». Tester le stock brut ici rendait invendables des
      // produits que la boutique affichait pourtant comme disponibles.
      if (isSoldOut(p))             return { error: `« ${p.name} » est épuisé. Retirez-le de votre panier.` };

      const unitPrice = effectiveUnitPrice(p, isFlorist);
      if (!(unitPrice > 0))         return { error: `Le prix de « ${p.name} » est indisponible. Contactez-nous pour finaliser cette commande.` };

      lines.push({ item, name: p.name, unitPrice });
    } else if (item.type === "subscription") {
      const s = subById.get(item.referenceId);
      if (!s || !s.active)          return { error: "Un abonnement de votre panier n'est plus disponible. Veuillez rafraîchir votre panier." };
      if (!(Number(s.price) > 0))   return { error: `Le prix de « ${s.name} » est indisponible.` };

      lines.push({ item, name: s.name, unitPrice: Number(s.price) });
    } else {
      return { error: "Un article de votre panier n'est plus offert. Veuillez rafraîchir votre panier." };
    }
  }

  return { lines, isFlorist };
}

/** Totaux d'un panier déjà tarifé, pour un mode de réception donné. */
async function totalsFor(
  lines: PricedLine[],
  deliveryMethod: "pickup" | "delivery",
  roundUpRequested: boolean,
): Promise<OrderTotals> {
  const settings = await getSiteSettings();
  return computeTotals({
    subtotal:       lines.reduce((acc, l) => acc + l.unitPrice * l.item.quantity, 0),
    deliveryMethod,
    config:         pricingFromSettings(settings),
    roundUpRequested,
  });
}

export interface QuoteLine {
  cartId:    string;
  name:      string;
  unitPrice: number;
  quantity:  number;
  lineTotal: number;
}

export type QuoteResult =
  | { error: string }
  | {
      lines:       QuoteLine[];
      /** Totaux sans l'arrondi pour la cause. */
      base:        OrderTotals;
      /** Mêmes totaux, arrondi inclus — sert à libeller la case à cocher. */
      withRoundUp: OrderTotals;
      isFlorist:   boolean;
    };

/**
 * Devis d'un panier — ce que la caisse affiche.
 *
 * La caisse ne calcule plus rien à partir des prix du `localStorage` : elle
 * demande au serveur. Sans cela, le moindre écart entre le prix mis au panier et
 * le prix réel (prix de gros d'un fleuriste, prix modifié depuis, panier vieux de
 * plusieurs jours) bloquait la vente au dernier moment.
 */
export async function quoteCart(input: {
  items: unknown;
  deliveryMethod: "pickup" | "delivery";
}): Promise<QuoteResult> {
  const itemsParsed = z.array(CartItemSchema).min(1).max(50).safeParse(input.items);
  if (!itemsParsed.success) return { error: "Votre panier est vide ou invalide." };

  const method = input.deliveryMethod === "pickup" ? "pickup" : "delivery";

  const priced = await priceItems(itemsParsed.data);
  if ("error" in priced) return { error: priced.error };

  const [base, withRoundUp] = await Promise.all([
    totalsFor(priced.lines, method, false),
    totalsFor(priced.lines, method, true),
  ]);

  return {
    lines: priced.lines.map((l) => ({
      cartId:    l.item.cartId ?? `${l.item.type}_${l.item.referenceId}`,
      name:      l.name,
      unitPrice: l.unitPrice,
      quantity:  l.item.quantity,
      lineTotal: Math.round(l.unitPrice * l.item.quantity * 100) / 100,
    })),
    base,
    withRoundUp,
    isFlorist: priced.isFlorist,
  };
}

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

  // Prix et totaux passent par le même chemin que le devis affiché à la caisse
  // (`quoteCart`) — ce qui est montré est ce qui est encaissé, par construction.
  const pricedResult = await priceItems(items);
  if ("error" in pricedResult) return { error: pricedResult.error };

  const { lines: priced, isFlorist } = pricedResult;

  const totals = await totalsFor(priced, parsed.data.delivery_method, parsed.data.round_up);

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
