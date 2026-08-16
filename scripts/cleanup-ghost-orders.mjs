/**
 * Supprime les commandes qui n'ont jamais abouti à un paiement.
 *
 * Une tentative interrompue (carte refusée, panne, abandon) laisse une ligne en
 * base indiscernable d'une vraie commande à préparer. Ce script les retire.
 *
 * GARDE-FOU — une commande est INTOUCHABLE si elle porte la moindre trace de
 * paiement ou de communication :
 *   - `square_payment_id` renseigné      → de l'argent a changé de mains
 *   - `payment_status = 'completed'`     → idem
 *   - `emails_sent_at` renseigné         → le client a reçu une confirmation
 * Ces trois conditions sont vérifiées AVANT toute suppression, et le script
 * s'interrompt si l'une d'elles est violée. Une vraie vente ne peut donc pas
 * être effacée par erreur, même si on se trompe de filtre.
 *
 * Usage :
 *   node scripts/cleanup-ghost-orders.mjs           → liste seulement (à blanc)
 *   node scripts/cleanup-ghost-orders.mjs --appliquer → supprime pour de vrai
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const APPLIQUER = process.argv.includes("--appliquer");

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

const { data: toutes, error } = await sb
  .from("orders")
  .select("id, created_at, customer_name, customer_email, total_amount, status, payment_status, square_payment_id, emails_sent_at, payment_error")
  .order("created_at", { ascending: false });

if (error) {
  console.error("Lecture impossible :", error.message);
  process.exit(1);
}

/** Une commande a-t-elle une trace de paiement ou de communication ? */
const intouchable = (o) =>
  Boolean(o.square_payment_id) || o.payment_status === "completed" || Boolean(o.emails_sent_at);

const gardees   = toutes.filter(intouchable);
const candidates = toutes.filter((o) => !intouchable(o));

console.log(`${toutes.length} commande(s) en base.\n`);

console.log(`── CONSERVÉES (${gardees.length}) — vraies ventes ──`);
for (const o of gardees) {
  console.log(`  ✓ #${o.id.slice(0, 8).toUpperCase()}  ${o.created_at.slice(0, 16)}  ${o.total_amount} $  ${o.status}/${o.payment_status}`);
  console.log(`      ${o.customer_name} | square: ${o.square_payment_id ?? "—"} | courriels: ${o.emails_sent_at ? "envoyés" : "—"}`);
}
if (!gardees.length) console.log("  (aucune)");

console.log(`\n── À SUPPRIMER (${candidates.length}) — aucun paiement, aucun courriel ──`);
for (const o of candidates) {
  const cause = o.payment_error ? "paiement refusé" : o.status === "cancelled" ? "annulée" : "abandonnée";
  console.log(`  ✗ #${o.id.slice(0, 8).toUpperCase()}  ${o.created_at.slice(0, 16)}  ${o.total_amount} $  ${o.status}/${o.payment_status}  (${cause})`);
}
if (!candidates.length) {
  console.log("  (aucune) — rien à nettoyer.");
  process.exit(0);
}

if (!APPLIQUER) {
  console.log("\nAucune suppression effectuée (mode liste).");
  console.log("Pour supprimer : node scripts/cleanup-ghost-orders.mjs --appliquer");
  process.exit(0);
}

// Deuxième vérification, juste avant d'écrire : la liste n'a pas pu être
// contaminée entre-temps.
const ids = candidates.map((o) => o.id);
const { data: recheck } = await sb
  .from("orders")
  .select("id, square_payment_id, payment_status, emails_sent_at")
  .in("id", ids);

const violation = (recheck ?? []).find(intouchable);
if (violation) {
  console.error(`\n⛔ ARRÊT : ${violation.id} porte une trace de paiement. Rien n'a été supprimé.`);
  process.exit(1);
}

const { error: itemsErr, count: nbItems } = await sb
  .from("order_items")
  .delete({ count: "exact" })
  .in("order_id", ids);
if (itemsErr) {
  console.error("order_items :", itemsErr.message);
  process.exit(1);
}

const { error: ordErr, count: nbOrdres } = await sb
  .from("orders")
  .delete({ count: "exact" })
  .in("id", ids);
if (ordErr) {
  console.error("orders :", ordErr.message);
  process.exit(1);
}

console.log(`\n✅ Supprimé : ${nbOrdres} commande(s), ${nbItems} ligne(s) d'articles.`);

const { data: reste } = await sb
  .from("orders")
  .select("id, created_at, total_amount, status, payment_status")
  .order("created_at", { ascending: false });
console.log(`\nIl reste ${reste.length} commande(s) :`);
reste.forEach((o) =>
  console.log(`  #${o.id.slice(0, 8).toUpperCase()}  ${o.created_at.slice(0, 16)}  ${o.total_amount} $  ${o.status}/${o.payment_status}`),
);
