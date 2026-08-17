/**
 * Vérifie la décrémentation automatique du stock (migration 027).
 *
 * Ne déclenche AUCUN paiement : la fonction `apply_order_stock` travaille à
 * partir des lignes de commande, pas de Square. Le script crée une commande
 * factice, appelle la fonction, contrôle le résultat, puis **restaure le stock
 * exact et supprime tout ce qu'il a créé**.
 *
 * Ce qu'il prouve :
 *   1. le stock d'un produit suivi diminue de la quantité vendue ;
 *   2. un deuxième appel ne décompte pas une seconde fois (idempotence) ;
 *   3. un produit NON suivi n'est jamais touché.
 *
 * Usage : node scripts/verify-stock-decrement.mjs
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

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

let ko = 0;
const controle = (label, obtenu, attendu) => {
  const ok = obtenu === attendu;
  if (!ok) ko++;
  console.log(`  ${ok ? "✓" : "✗"} ${label} → ${obtenu} (attendu ${attendu})`);
};

// ── 0. La migration est-elle en place ? ─────────────────────────────────────
const { error: colErr } = await sb.from("orders").select("stock_applied_at").limit(1);
if (colErr) {
  console.error("❌ Migration 027 non appliquée : orders.stock_applied_at est absente.");
  console.error("   Exécuter supabase/migrations/027_order_stock_decrement.sql dans Supabase → SQL Editor.");
  process.exit(1);
}
console.log("✅ Migration 027 : colonne présente.\n");

// ── 1. Choisir un cobaye suivi, et un témoin non suivi ──────────────────────
const { data: produits } = await sb
  .from("products")
  .select("id, name, stock, track_inventory")
  .eq("active", true);

const suivi = produits.find((p) => p.track_inventory && p.stock !== null && p.stock >= 2);
const nonSuivi = produits.find((p) => !p.track_inventory);

if (!suivi) {
  console.error("❌ Aucun produit suivi avec au moins 2 en stock — impossible de tester sans fausser les données.");
  process.exit(1);
}

console.log(`Cobaye  : « ${suivi.name} » — stock ${suivi.stock}, suivi`);
if (nonSuivi) console.log(`Témoin  : « ${nonSuivi.name} » — stock ${nonSuivi.stock ?? "∞"}, NON suivi`);

const stockDepart = suivi.stock;
const stockTemoinDepart = nonSuivi?.stock ?? null;
let commandeId = null;

try {
  // ── 2. Commande factice ───────────────────────────────────────────────────
  const { data: cmd, error: cmdErr } = await sb
    .from("orders")
    .insert({
      customer_name:  "VERIFICATION STOCK — a supprimer",
      customer_email: "verif@floruspocus.invalid",
      customer_phone: "418 555-0000",
      customer_address: "Ramassage à la ferme",
      delivery_method: "pickup",
      subtotal: 1, delivery_fee: 0, gst_amount: 0, qst_amount: 0, total_amount: 1,
      status: "pending", payment_status: "pending",
    })
    .select("id")
    .single();
  if (cmdErr) throw new Error(`création commande : ${cmdErr.message}`);
  commandeId = cmd.id;

  const lignes = [
    { order_id: commandeId, product_id: suivi.id, product_type: "product", quantity: 2, price_per_unit: 1 },
  ];
  if (nonSuivi) {
    lignes.push({ order_id: commandeId, product_id: nonSuivi.id, product_type: "product", quantity: 3, price_per_unit: 1 });
  }
  const { error: ligErr } = await sb.from("order_items").insert(lignes);
  if (ligErr) throw new Error(`création lignes : ${ligErr.message}`);

  // ── 3. Premier appel : doit décrémenter ───────────────────────────────────
  console.log("\n── 1er appel de apply_order_stock ──");
  const { data: r1, error: e1 } = await sb.rpc("apply_order_stock", { p_order_id: commandeId });
  if (e1) throw new Error(`RPC : ${e1.message} — la fonction existe-t-elle ?`);
  controle("retour", r1, true);

  const { data: apres1 } = await sb.from("products").select("stock").eq("id", suivi.id).single();
  controle("stock du cobaye (2 vendus)", apres1.stock, stockDepart - 2);

  if (nonSuivi) {
    const { data: t1 } = await sb.from("products").select("stock").eq("id", nonSuivi.id).single();
    controle("stock du témoin NON suivi (intact)", t1.stock, stockTemoinDepart);
  }

  const { data: cmd1 } = await sb.from("orders").select("stock_applied_at").eq("id", commandeId).single();
  console.log(`  ${cmd1.stock_applied_at ? "✓" : "✗"} stock_applied_at horodaté`);
  if (!cmd1.stock_applied_at) ko++;

  // ── 4. Deuxième appel : ne doit RIEN faire ────────────────────────────────
  console.log("\n── 2e appel (idempotence) ──");
  const { data: r2, error: e2 } = await sb.rpc("apply_order_stock", { p_order_id: commandeId });
  if (e2) throw new Error(`RPC : ${e2.message}`);
  controle("retour", r2, false);

  const { data: apres2 } = await sb.from("products").select("stock").eq("id", suivi.id).single();
  controle("stock inchangé", apres2.stock, stockDepart - 2);

} finally {
  // ── 5. Tout remettre en état, quoi qu'il arrive ───────────────────────────
  console.log("\n── remise en état ──");
  await sb.from("products").update({ stock: stockDepart }).eq("id", suivi.id);
  if (nonSuivi) await sb.from("products").update({ stock: stockTemoinDepart }).eq("id", nonSuivi.id);
  if (commandeId) {
    await sb.from("order_items").delete().eq("order_id", commandeId);
    await sb.from("orders").delete().eq("id", commandeId);
  }
  const { data: fin } = await sb.from("products").select("stock").eq("id", suivi.id).single();
  controle("stock du cobaye restauré", fin.stock, stockDepart);
  const { data: reste } = await sb.from("orders").select("id").eq("customer_email", "verif@floruspocus.invalid");
  controle("commande de test supprimée", reste.length, 0);
}

console.log(ko === 0 ? "\n✅ Décrémentation du stock : conforme." : `\n❌ ${ko} écart(s).`);
process.exit(ko === 0 ? 0 : 1);
