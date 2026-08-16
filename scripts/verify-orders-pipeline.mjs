#!/usr/bin/env node
/**
 * Vérificateur LECTURE SEULE de la chaîne de commande.
 *
 *   node scripts/verify-orders-pipeline.mjs
 *
 * Contrôle, sans rien modifier :
 *   1. que la migration 022 est appliquée (sinon la caisse casse au déploiement) ;
 *   2. les commandes récentes et l'état d'envoi de leurs courriels ;
 *   3. les commandes payées dont les courriels ont échoué (`email_error`).
 *
 * Lit les identifiants depuis .env.local. N'affiche jamais de secret.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    })
);

if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY absent de .env.local");
  process.exit(1);
}

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ── 1. Migration 022 ────────────────────────────────────────────────────────
console.log("=== 1. Migration 022 (colonnes de suivi des courriels) ===");
let manquantes = 0;
for (const c of ["is_florist_order", "emails_sent_at", "email_error"]) {
  const { error } = await sb.from("orders").select(c).limit(1);
  if (error) manquantes++;
  console.log(`  ${error ? "❌" : "✅"} orders.${c}`);
}
if (manquantes) {
  console.log("\n❌ Migration 022 NON appliquée.");
  console.log("   Exécuter supabase/migrations/022_orders_email_tracking.sql dans");
  console.log("   Supabase → SQL Editor AVANT de déployer, sinon toute commande échoue.\n");
  process.exit(1);
}
console.log("  ✅ Migration 022 appliquée.\n");

// ── 2. Commandes récentes ───────────────────────────────────────────────────
const { data: orders } = await sb
  .from("orders")
  .select("id, created_at, customer_name, customer_email, total_amount, status, payment_status, square_payment_id, is_florist_order, emails_sent_at, email_error, payment_error")
  .order("created_at", { ascending: false })
  .limit(15);

console.log(`=== 2. ${orders?.length ?? 0} commande(s) récente(s) ===`);
for (const o of orders ?? []) {
  const courriels = o.email_error ? "❌ échec" : o.emails_sent_at ? "✅ envoyés" : "— non envoyés";
  console.log(`  ${o.created_at.slice(0, 16)}  #${o.id.slice(0, 8).toUpperCase()}  ${o.total_amount}$  ${o.status}/${o.payment_status}${o.is_florist_order ? "  [FLEURISTE]" : ""}`);
  console.log(`     ${o.customer_name} <${o.customer_email}>  courriels: ${courriels}`);
  if (o.email_error) console.log(`     ⚠ courriel : ${o.email_error}`);
  if (o.payment_error) console.log(`     ⛔ paiement refusé par Square : ${o.payment_error}`);
}

// ── 3. Anomalies ────────────────────────────────────────────────────────────
const payees = (orders ?? []).filter((o) => o.payment_status === "completed");
const sansCourriel = payees.filter((o) => !o.emails_sent_at);
const enEchec = payees.filter((o) => o.email_error);
const paiementsRefuses = (orders ?? []).filter((o) => o.payment_error);

console.log("\n=== 3. Anomalies ===");
console.log(`  Commandes payées sans courriel envoyé : ${sansCourriel.length}`);
console.log(`  Commandes payées avec échec d'envoi   : ${enEchec.length}`);
console.log(`  Paiements refusés par Square          : ${paiementsRefuses.length}`);
if (paiementsRefuses.length) {
  console.log("\n  Causes exactes renvoyées par Square :");
  for (const o of paiementsRefuses) {
    console.log(`    #${o.id.slice(0, 8).toUpperCase()}  ${o.payment_error}`);
  }
  console.log("    → PAYMENT_METHOD_ERROR = carte refusée (rien à corriger côté site).");
  console.log("    → AUTHENTICATION_ERROR / INVALID_REQUEST_ERROR = configuration Square à revoir sur Vercel.");
}
if (!sansCourriel.length && !enEchec.length && !paiementsRefuses.length) console.log("  ✅ Rien à signaler.");
