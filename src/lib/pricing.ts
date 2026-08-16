/**
 * Calcul des totaux de commande — source unique de vérité.
 *
 * Utilisé côté serveur par `createOrder` (montant faisant foi, celui qui est
 * encaissé) ET côté client par la caisse pour l'affichage. Les deux DOIVENT
 * passer par ici, sinon le montant affiché et le montant débité divergent.
 *
 * Ordre des opérations (Québec) :
 *   sous-total → + frais de livraison → taxes sur la somme des deux → + arrondi
 * L'arrondi pour la cause est un don : il n'est jamais taxé, donc il s'ajoute
 * en dernier, après les taxes.
 */

export interface PricingConfig {
  /** Taux de TPS en fraction (0.05 = 5 %). */
  gstRate: number;
  /** Taux de TVQ en fraction (0.09975 = 9,975 %). */
  qstRate: number;
  /** Frais de livraison locale, en dollars. */
  deliveryFee: number;
  /** Sous-total à partir duquel la livraison devient gratuite. */
  freeDeliveryThreshold: number;
  /** Si faux, aucune taxe n'est facturée (entreprise non inscrite). */
  taxesEnabled: boolean;
}

/** Taux légaux du Québec au moment de l'écriture — TPS 5 %, TVQ 9,975 %. */
export const DEFAULT_PRICING: PricingConfig = {
  gstRate:               0.05,
  qstRate:               0.09975,
  deliveryFee:           9.99,
  freeDeliveryThreshold: 100,
  taxesEnabled:          true,
};

/** Arrondi monétaire au cent, sans dérive de virgule flottante. */
export function toCents(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100);
}

export function round2(amount: number): number {
  return toCents(amount) / 100;
}

function num(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === null || raw.trim() === "") return fallback;
  // Accepte « 9,99 » comme « 9.99 » — le CMS est utilisé par des francophones.
  const parsed = Number(raw.replace(",", ".").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

/**
 * Construit la configuration à partir de `site_settings`.
 * Les taux sont stockés en POURCENTAGE dans le CMS (« 5 », « 9.975 »),
 * plus lisibles pour l'administrateur, et convertis en fraction ici.
 */
export function pricingFromSettings(s: Record<string, string>): PricingConfig {
  return {
    gstRate:               num(s["gst_rate"], DEFAULT_PRICING.gstRate * 100) / 100,
    qstRate:               num(s["qst_rate"], DEFAULT_PRICING.qstRate * 100) / 100,
    deliveryFee:           num(s["delivery_fee"], DEFAULT_PRICING.deliveryFee),
    freeDeliveryThreshold: num(s["free_delivery_threshold"], DEFAULT_PRICING.freeDeliveryThreshold),
    taxesEnabled:          (s["taxes_enabled"] ?? "true").trim().toLowerCase() !== "false",
  };
}

/**
 * Prix unitaire applicable à un produit — source unique de vérité.
 *
 * Le prix de gros ne s'applique qu'aux fleuristes authentifiés. TOUT endroit qui
 * met un produit au panier ou qui affiche son prix doit passer par ici : si
 * l'affichage et `createOrder` divergent d'un seul cent, la caisse refuse de
 * payer (elle ne débite jamais un montant que l'acheteur n'a pas vu).
 */
export function effectiveUnitPrice(
  product: { price: number | string; florist_price?: number | string | null },
  isFlorist: boolean,
): number {
  return isFlorist && product.florist_price !== null && product.florist_price !== undefined
    ? Number(product.florist_price)
    : Number(product.price);
}

export interface OrderTotals {
  subtotal:    number;
  deliveryFee: number;
  gst:         number;
  qst:         number;
  taxTotal:    number;
  roundUp:     number;
  /** Montant réellement encaissé. */
  total:       number;
}

/** Frais de livraison applicables — gratuits au ramassage et au-delà du seuil. */
export function deliveryFeeFor(
  subtotal: number,
  deliveryMethod: "pickup" | "delivery",
  config: PricingConfig,
): number {
  if (deliveryMethod === "pickup") return 0;
  if (subtotal >= config.freeDeliveryThreshold) return 0;
  return round2(config.deliveryFee);
}

/**
 * Totaux complets d'une commande.
 * `roundUpRequested` : le client a coché l'arrondi pour la cause.
 */
export function computeTotals(params: {
  subtotal: number;
  deliveryMethod: "pickup" | "delivery";
  config: PricingConfig;
  roundUpRequested?: boolean;
}): OrderTotals {
  const { subtotal: rawSubtotal, deliveryMethod, config, roundUpRequested = false } = params;

  const subtotal    = round2(rawSubtotal);
  const deliveryFee = deliveryFeeFor(subtotal, deliveryMethod, config);
  const taxable     = round2(subtotal + deliveryFee);

  const gst = config.taxesEnabled ? round2(taxable * config.gstRate) : 0;
  const qst = config.taxesEnabled ? round2(taxable * config.qstRate) : 0;

  const beforeRoundUp = round2(taxable + gst + qst);

  // Le don complète jusqu'au dollar supérieur. Rien à arrondir si le total
  // tombe déjà juste.
  const roundUp = roundUpRequested
    ? round2(Math.ceil(beforeRoundUp) - beforeRoundUp)
    : 0;

  return {
    subtotal,
    deliveryFee,
    gst,
    qst,
    taxTotal: round2(gst + qst),
    roundUp,
    total:    round2(beforeRoundUp + roundUp),
  };
}
