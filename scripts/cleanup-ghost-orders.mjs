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

const IDS = [
  "b8fd2362-1e66-4745-8c10-702e39daeefd",
  "998a3964-bcce-4910-ac6c-f92bf022ae3c",
];

// Garde-fou : ne jamais supprimer une commande qui porte la moindre trace de
// paiement ou de courriel envoyé.
const { data: cibles } = await sb
  .from("orders")
  .select("id,square_payment_id,payment_status,emails_sent_at,total_amount")
  .in("id", IDS);

for (const o of cibles) {
  if (o.square_payment_id || o.payment_status === "completed" || o.emails_sent_at) {
    console.error("REFUS de supprimer", o.id, "— trace de paiement/courriel présente.");
    process.exit(1);
  }
}
console.log("Garde-fou OK :", cibles.length, "commandes sans aucun paiement ni courriel.");

const { error: itemsErr, count: itemsCount } = await sb
  .from("order_items")
  .delete({ count: "exact" })
  .in("order_id", IDS);
if (itemsErr) { console.error("order_items:", itemsErr.message); process.exit(1); }

const { error: ordErr, count: ordCount } = await sb
  .from("orders")
  .delete({ count: "exact" })
  .in("id", IDS);
if (ordErr) { console.error("orders:", ordErr.message); process.exit(1); }

console.log(`Supprimé : ${ordCount} commande(s), ${itemsCount} ligne(s) d'articles.`);

const { data: reste } = await sb
  .from("orders")
  .select("id,created_at,status,payment_status,total_amount");
console.log("Commandes restantes :", reste.length);
reste.forEach((o) => console.log(" ", o.created_at, o.status + "/" + o.payment_status, o.total_amount + " $"));
