/**
 * Vérificateur LECTURE SEULE du tunnel d'achat.
 *
 * Répond à deux questions, sans jamais déclencher de paiement :
 *   1. La boutique affiche-t-elle des produits comme achetables alors que la
 *      caisse les refuserait ? (règle d'inventaire `track_inventory`)
 *   2. Le prix affiché sur la fiche produit est-il celui que la caisse
 *      facturera, pour un client ordinaire ET pour un fleuriste authentifié ?
 *
 * Ces deux écarts sont exactement ce qui rendait le site invendable : le premier
 * refusait la commande, le second la faisait abandonner avant le débit.
 *
 * Usage : npm run dev, puis `node scripts/verify-purchase-flow.mjs`
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

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

/** Mêmes règles que src/lib/inventory.ts et src/lib/pricing.ts. */
const isSoldOut = (p) => Boolean(p.track_inventory) && p.stock === 0;
const unitPrice = (p, isFlorist) =>
  isFlorist && p.florist_price !== null && p.florist_price !== undefined
    ? Number(p.florist_price)
    : Number(p.price);

const { data: products, error } = await sb
  .from("products")
  .select("id, name, active, stock, track_inventory, price, florist_price, price_type, florist_only");
if (error) {
  console.error("Lecture des produits impossible :", error.message);
  process.exit(1);
}

let echecs = 0;

/* ── 1. Règle d'inventaire ───────────────────────────────────────────────── */
const affichesAchetables = products.filter(
  (p) => p.active && p.price_type !== "devis" && !isSoldOut(p),
);
// La caisse ne doit refuser AUCUN produit que la boutique montre comme achetable.
const refusesParLaCaisse = affichesAchetables.filter((p) => isSoldOut(p));

console.log("── Inventaire ──");
console.log(`  produits actifs            : ${products.filter((p) => p.active).length}`);
console.log(`  affichés comme achetables  : ${affichesAchetables.length}`);
console.log(`  dont la caisse refuserait  : ${refusesParLaCaisse.length}`);
console.log(`  (stock = 0 sans suivi, donc illimité : ${affichesAchetables.filter((p) => p.stock === 0).length} — doivent rester vendables)`);
if (refusesParLaCaisse.length > 0) {
  echecs++;
  refusesParLaCaisse.slice(0, 10).forEach((p) => console.log(`    ✗ ${p.name}`));
}

/* ── 2. Prix affiché == prix facturé ─────────────────────────────────────── */
// Le grand prix de la fiche produit. React scinde « 12.00 » et « $ » en deux
// nœuds de texte : on n'ancre donc que sur le nombre.
const PRIX = /class="font-display font-bold" style="[^"]*line-height:1">([\d]+\.[\d]{2})/;

async function prixAffiche(id, cookie) {
  const res = await fetch(`${BASE}/boutique/${id}`, {
    headers: cookie ? { cookie } : {},
    redirect: "follow",
  });
  if (!res.ok) return { err: `HTTP ${res.status}` };
  const html = await res.text();
  const m = html.match(PRIX);
  return m ? { prix: Number(m[1]) } : { err: "prix introuvable dans la page" };
}

// Priorité aux produits dont le prix de gros diffère du prix public : ce sont
// eux qui déclenchaient l'écart de total.
const echantillon = [
  ...affichesAchetables.filter((p) => p.florist_price !== null && Number(p.florist_price) !== Number(p.price)).slice(0, 8),
  ...affichesAchetables.filter((p) => p.florist_price === null).slice(0, 4),
];

console.log("\n── Prix affiché vs prix facturé ──");
let joignable = true;
for (const p of echantillon) {
  for (const isFlorist of [false, true]) {
    const attendu = unitPrice(p, isFlorist);
    const r = await prixAffiche(p.id, isFlorist ? "fp_florist=1" : "");
    if (r.err) {
      // Un prix qu'on n'arrive pas à lire n'est pas un prix vérifié : c'est un
      // échec, pas une abstention.
      if (r.err.startsWith("HTTP")) joignable = false;
      echecs++;
      console.log(`  ✗ ${p.name} (${isFlorist ? "fleuriste" : "public"}) — ${r.err}`);
      continue;
    }
    const ok = Math.abs(r.prix - attendu) < 0.005;
    if (!ok) echecs++;
    console.log(
      `  ${ok ? "✓" : "✗"} ${p.name} (${isFlorist ? "fleuriste" : "public"}) — affiché ${r.prix.toFixed(2)} $, facturé ${attendu.toFixed(2)} $`,
    );
  }
}
if (!joignable) {
  console.log("\n  ⚠️  Serveur injoignable sur " + BASE + " — lancez `npm run dev` d'abord.");
}

console.log(echecs === 0 ? "\n✅ Aucun écart détecté." : `\n❌ ${echecs} écart(s) — la vente est encore bloquée.`);
process.exit(echecs === 0 ? 0 : 1);
