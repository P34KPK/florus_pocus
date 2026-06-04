// Usage: node scripts/reset-admin.mjs "<NOUVEAU_MOT_DE_PASSE>"
//   ou : ADMIN_PASSWORD="<...>" node scripts/reset-admin.mjs
// Vérifie et recrée le compte admin dans Supabase Auth + table users.
// Le mot de passe N'EST JAMAIS écrit en dur (repo public).

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Lire .env.local manuellement
const envPath = resolve(process.cwd(), ".env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => l.split("=").map((s) => s.trim()))
    .map(([k, ...v]) => [k, v.join("=")])
);

const SUPABASE_URL = env["NEXT_PUBLIC_SUPABASE_URL"];
const SERVICE_ROLE_KEY = env["SUPABASE_SERVICE_ROLE_KEY"];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌  Variables manquantes dans .env.local");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EMAIL = "info@floruspocus.com";
const PASSWORD = process.argv[2] || process.env.ADMIN_PASSWORD;

if (!PASSWORD || PASSWORD.length < 8) {
  console.error("❌  Mot de passe requis (min 8 car.) :");
  console.error('    node scripts/reset-admin.mjs "MonNouveauMotDePasse"');
  console.error('    ou  ADMIN_PASSWORD="..." node scripts/reset-admin.mjs');
  process.exit(1);
}

console.log("🔍  Recherche du compte admin...");

// Lister les users Auth pour trouver le compte
const { data: { users }, error: listError } = await admin.auth.admin.listUsers();
if (listError) { console.error("❌", listError.message); process.exit(1); }

const existing = users.find((u) => u.email === EMAIL);

if (existing) {
  console.log(`✅  Compte trouvé : ${existing.id}`);
  console.log(`   email_confirmed: ${existing.email_confirmed_at ? "oui" : "NON"}`);

  // Réinitialiser le mot de passe
  const { error: pwError } = await admin.auth.admin.updateUserById(existing.id, {
    password: PASSWORD,
    email_confirm: true,
  });
  if (pwError) { console.error("❌  Erreur reset password:", pwError.message); process.exit(1); }
  console.log("🔑  Mot de passe réinitialisé.");

  // Vérifier is_admin dans la table users
  const { data: profile, error: profileError } = await admin
    .from("users")
    .select("is_admin")
    .eq("id", existing.id)
    .single();

  if (profileError || !profile) {
    console.log("⚠️   Profil absent dans table users — création...");
    await admin.from("users").insert({ id: existing.id, email: EMAIL, is_admin: true });
    console.log("✅  Profil créé avec is_admin = true");
  } else if (!profile.is_admin) {
    await admin.from("users").update({ is_admin: true }).eq("id", existing.id);
    console.log("✅  is_admin mis à true");
  } else {
    console.log("✅  is_admin déjà à true");
  }
} else {
  console.log("⚠️   Compte introuvable — création...");
  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
  });
  if (createError) { console.error("❌", createError.message); process.exit(1); }
  console.log(`✅  Compte créé : ${newUser.user.id}`);

  await admin.from("users").insert({ id: newUser.user.id, email: EMAIL, is_admin: true });
  console.log("✅  Profil admin inséré dans table users");
}

console.log("\n🎉  Prêt — connecte-toi avec :");
console.log(`   Email    : ${EMAIL}`);
console.log("   Password : (celui que tu viens de définir)");
console.log("   URL      : http://localhost:3000/admin/login");
