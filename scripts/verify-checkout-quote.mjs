/**
 * Appelle réellement l'action serveur `quoteCart`, exactement comme le fait la
 * caisse dans le navigateur (protocole Server Actions de Next.js).
 * Lecture seule : aucune commande créée, aucun paiement.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const BASE = process.argv[2] ?? "http://localhost:3001";

/**
 * Identifiant de l'action serveur `quoteCart`, extrait des bundles construits.
 * Il change à chaque build : le lire ici évite de le coder en dur.
 * ⚠️ Les identifiants du serveur de développement ne correspondent PAS au
 * manifeste sur disque — ce script exige `npm run build` puis `npx next start`.
 */
function actionId() {
  const dir = ".next/static/chunks";
  for (const f of readdirSync(dir, { recursive: true })) {
    if (typeof f !== "string" || !f.endsWith(".js")) continue;
    const src = readFileSync(join(dir, f), "utf8");
    const m = src.match(/createServerReference\)\("([a-f0-9]{40,})"[^)]*"quoteCart"/);
    if (m) return m[1];
  }
  throw new Error("Action quoteCart introuvable — lancez `npm run build` d'abord.");
}

const ACTION_ID = actionId();

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function quote(items, deliveryMethod, cookie) {
  const res = await fetch(`${BASE}/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Next-Action": ACTION_ID,
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify([{ items, deliveryMethod }]),
  });
  const text = await res.text();
  // La réponse est un flux RSC : la valeur de retour est la dernière ligne JSON.
  for (const line of text.split("\n").reverse()) {
    const m = line.match(/^[0-9a-f]+:(.*)$/);
    if (!m) continue;
    try {
      const v = JSON.parse(m[1]);
      if (v && (v.base || v.error)) return v;
    } catch { /* ligne non JSON */ }
  }
  return { raw: text.slice(0, 400), status: res.status };
}

const { data: prods } = await sb
  .from("products")
  .select("id,name,price,florist_price,stock,track_inventory,active,price_type");

const calendula = prods.find((p) => p.name.startsWith("Calendula"));
// Un produit à stock 0 sans suivi : c'était le cas « épuisé » qui bloquait tout.
const stockZero = prods.find(
  (p) => p.active && p.price_type !== "devis" && p.stock === 0 && !p.track_inventory,
);

const item = (p, qty = 1) => ({
  cartId: `product_${p.id}`,
  referenceId: p.id,
  name: p.name,
  price: Number(p.price),
  quantity: qty,
  type: "product",
});

const TVQ = 0.09975, TPS = 0.05;
const attendu = (sousTotal, livraison) => {
  const t = Math.round((sousTotal + livraison) * 100) / 100;
  const g = Math.round(t * TPS * 100) / 100;
  const q = Math.round(t * TVQ * 100) / 100;
  return Math.round((t + g + q) * 100) / 100;
};

let echecs = 0;
const check = (label, got, want) => {
  const ok = got !== undefined && Math.abs(got - want) < 0.005;
  if (!ok) echecs++;
  console.log(`  ${ok ? "✓" : "✗"} ${label} — obtenu ${got}, attendu ${want.toFixed(2)}`);
};

console.log("── quoteCart appelée pour de vrai ──");

// 1. Client ordinaire, ramassage → prix public, pas de livraison
let r = await quote([item(calendula)], "pickup", "");
console.log(`  [public/ramassage] ${JSON.stringify(r.base ?? r)}`);
check("sous-total = prix public", r.base?.subtotal, Number(calendula.price));
check("total TTC", r.base?.total, attendu(Number(calendula.price), 0));

// 2. Fleuriste, ramassage → prix de gros appliqué par le serveur
r = await quote([item(calendula)], "pickup", "fp_florist=1");
console.log(`  [fleuriste/ramassage] ${JSON.stringify(r.base ?? r)}`);
check("sous-total = prix de gros", r.base?.subtotal, Number(calendula.florist_price));
check("total TTC", r.base?.total, attendu(Number(calendula.florist_price), 0));

// 3. Livraison sous le seuil → 9,99 $ facturés
r = await quote([item(calendula)], "delivery", "");
console.log(`  [public/livraison] ${JSON.stringify(r.base ?? r)}`);
check("frais de livraison", r.base?.deliveryFee, 9.99);
check("total TTC", r.base?.total, attendu(Number(calendula.price), 9.99));

// 4. Livraison au-dessus du seuil (100 $) → gratuite
r = await quote([item(calendula, 12)], "delivery", "");
check("livraison gratuite dès 100 $", r.base?.deliveryFee, 0);

// 5. LE bug corrigé : stock = 0 sans suivi doit rester commandable
if (stockZero) {
  r = await quote([item(stockZero)], "pickup", "");
  // Un devis valide est la seule preuve d'acceptation : une réponse vide ou en
  // erreur compte comme un échec, jamais comme un succès par défaut.
  if (r.base?.total > 0) console.log(`  ✓ « ${stockZero.name} » (stock 0, non suivi) accepté — total ${r.base.total} $`);
  else { echecs++; console.log(`  ✗ « ${stockZero.name} » (stock 0, non suivi) NON accepté : ${r.error ?? JSON.stringify(r)}`); }
} else {
  console.log("  (aucun produit stock 0 sans suivi à tester)");
}

// 6. Arrondi pour la cause : jamais taxé, complète au dollar supérieur
r = await quote([item(calendula)], "pickup", "");
if (r.withRoundUp) {
  check("arrondi au dollar supérieur", r.withRoundUp.total, Math.ceil(r.base.total));
  check("l'arrondi ne change pas les taxes", r.withRoundUp.gst, r.base.gst);
}

console.log(echecs === 0 ? "\n✅ quoteCart : tous les contrôles passent." : `\n❌ ${echecs} échec(s).`);
process.exit(echecs === 0 ? 0 : 1);
