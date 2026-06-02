# FlorusPocus — Contexte complet du projet

---

## 1. Vue d'ensemble

**Nom du projet :** Florus Pocus
**Type :** Site e-commerce + panel admin
**Stack :** Next.js 16, TypeScript, Tailwind v4, Supabase, Square Payments
**Serveur local :** `npm run dev` → http://localhost:3000
**Déploiement :** Vercel (compte FlorusPocus Hobby — `info@floruspocus.com`)
**Domaine production :** https://www.floruspocus.com
**Dernière session :** 2026-06-02

---

## 2. État d'avancement — CE QUI EST FAIT ✅

### Site public
- [x] Homepage allégée : Hero + WhyLocal + BlogPreview (3 sections, 2 queries Supabase)
- [x] Page `/abonnements` — section Subscriptions complète
- [x] Page `/boutique` — Fleuristes + BranchDivider + TransformedProducts
- [x] Page `/autocueillette` — calendrier + réservation billets
- [x] Page `/la-ferme` — histoire + stats + CTA → /contact
- [x] Page `/contact` — formulaire + infos
- [x] Navbar multi-pages : vraies routes, visible immédiatement hors homepage, `hero-curtain` uniquement sur `/`
- [x] Navbar responsive (desktop + mobile hamburger)
- [x] Footer avec liens sociaux (Instagram, LinkedIn, Email)
- [x] CartDrawer avec gestion quantités
- [x] Page `/blog` (listing magazine)
- [x] Page `/blog/[slug]` (article complet + sanitization HTML)
- [x] Page `/checkout` (formulaire client + sauvegarde commande en DB)
- [x] Page 404 blog (`/blog/[slug]/not-found.tsx`)
- [x] Favicon SVG fleur 6 pétales (`src/app/icon.svg`)

### Admin panel (`/admin/*`)
- [x] Login avec Server Action (Supabase Auth) + rate limiting (5 tentatives/15min par IP)
- [x] Déconnexion (`/api/auth/signout`)
- [x] Dashboard avec vraies données (revenus, commandes, abonnements, produits, messages)
- [x] `/admin/produits` — CRUD complet
- [x] `/admin/abonnements` — CRUD abonnements + points de chute
- [x] `/admin/autocueillette` — gestion dates + capacités
- [x] `/admin/pages` — édition contenu homepage
- [x] `/admin/blog` — CRUD articles
- [x] `/admin/commandes` — suivi commandes
- [x] `/admin/stats` — statistiques + exports
- [x] `/admin/parametres` — configuration générale
- [x] Upload d'images (Supabase Storage, bucket `floruspocus`) + rate limiting (20/h) + whitelist dossiers

### Square paiement (production)
- [x] SDK Square installé (`square`)
- [x] `src/lib/square.ts` — `SquareClient` + `SquareEnvironment`
- [x] `src/app/checkout/page.tsx` — Square Web Payments SDK
- [x] `src/app/api/square/payment/route.ts` — charge carte, validation montant, idempotency key = orderId
- [x] `src/app/api/square/webhook/route.ts` — HMAC SHA256, gère payment.updated/created/completed/failed
- [x] Credentials production configurés sur Vercel
- [x] Webhook Square configuré : `https://www.floruspocus.com/api/square/webhook`
  - Events : `payment.updated`, `payment.created`, `refund.updated`
  - Signature Key configurée sur Vercel (`SQUARE_WEBHOOK_SIGNATURE_KEY`)
- [x] Migration `005_square_payment_id.sql` exécutée

### Sécurité (audit 2026-06-02)
- [x] `dangerouslySetInnerHTML` → sanitize-html (blog)
- [x] Validation Zod côté serveur sur tous les inputs
- [x] Validation localStorage cart (Zod schema au rehydrate)
- [x] Headers sécurité dans `next.config.ts` (HSTS, CSP, X-Frame-Options, etc.)
- [x] CSP : `worker-src blob:` ajouté pour Square Web Workers
- [x] Upload : whitelist dossiers (`products`, `blog`, `pages`, `misc`)
- [x] Phone : validation regex dans checkout
- [x] Arrondi flottant total panier corrigé (`Math.round * 100 / 100`)
- [x] Rate limiting : code prêt (`src/lib/ratelimit.ts`) — actif dès que vars Upstash configurées
- [x] Emails confirmation : code prêt (`src/lib/resend.ts`) — actif dès que `RESEND_API_KEY` configurée

### Déploiement & Infrastructure
- [x] Repo GitHub public (`P34KPK/florus_pocus`) — requis pour Vercel Hobby auto-deploy
- [x] Auto-deploy GitHub → Vercel fonctionnel
- [x] Domaine `floruspocus.com` connecté (WHC DNS → Vercel)
  - A `@` → `76.76.21.21`
  - CNAME `www` → `cname.vercel-dns.com`
- [x] Supabase Auth URL → `https://floruspocus.com`

### Base de données
- [x] Migration `001_initial_schema.sql` — schéma + RLS + seed
- [x] Migration `002_storage.sql` — bucket floruspocus (Storage)
- [x] Migration `003_contact_messages.sql` — table contact_messages
- [x] Migration `004_product_season_text.sql` — colonne season ENUM → TEXT
- [x] Migration `005_square_payment_id.sql` — colonne square_payment_id sur orders

---

## 3. CE QUI RESTE À FAIRE 🔲

### En attente confirmation client (comptes créés, code prêt)
- [ ] **Emails de confirmation** — compte Resend créé, en attente code de confirmation
  - Une fois accès : API Key → `RESEND_API_KEY` sur Vercel → Redeploy
  - Vérifier domaine `floruspocus.com` sur Resend (DNS TXT + MX dans WHC)
  - Code prêt : `src/lib/resend.ts` + `src/lib/emails/orderConfirmation.ts`
  - Envoi depuis `commandes@floruspocus.com`
- [ ] **Rate limiting** — compte Upstash créé, en attente code de confirmation
  - Une fois accès : `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` sur Vercel → s'active automatiquement
  - Code prêt : `src/lib/ratelimit.ts` (5 login/15min, 20 uploads/h)

### Priorité basse
- [ ] **Clés Supabase corrompues** — optionnel, fix `extractJwt` fonctionne
  - Vercel → supprimer et recoller `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY` sur une seule ligne depuis `.env.local`
- [ ] **Sitemap + SEO** — `sitemap.xml`, meta dynamiques par page
- [ ] **Contenu réel** — photos produits + articles blog (client le fait via admin)
- [ ] **Gestion stock** — sold out sur les produits

---

## 4. Règles de sécurité (NON-NÉGOCIABLES)

### Secrets & Clés API
- JAMAIS de clé API en dur dans le code
- TOUS les secrets dans `.env.local` (jamais commité)
- `.env.local` dans `.gitignore` AVANT le premier commit
- Variables publiques : préfixe `NEXT_PUBLIC_` obligatoire
- Variables serveur (sans préfixe) : `SUPABASE_SERVICE_ROLE_KEY`, `SQUARE_SECRET_API_KEY` — backend ONLY

### Variables d'environnement Vercel (production)
```
# PUBLIC (visibles côté client)
NEXT_PUBLIC_SUPABASE_URL=https://msxyptzedflnfbtbvrwi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[configurée — corrompue, fix extractJwt en place]
NEXT_PUBLIC_SQUARE_APP_ID=sq0idp-HOzOJErC5EBgA-kB21iu9A
NEXT_PUBLIC_SQUARE_LOCATION_ID=LQ69J6Z1KMTPB
NEXT_PUBLIC_SITE_URL=https://floruspocus.com

# SERVEUR UNIQUEMENT
SUPABASE_SERVICE_ROLE_KEY=[configurée — corrompue, fix extractJwt en place]
SQUARE_SECRET_API_KEY=[configurée]
SQUARE_LOCATION_ID=LQ69J6Z1KMTPB
SQUARE_WEBHOOK_SIGNATURE_KEY=[configurée]
RESEND_API_KEY=[à configurer — en attente]
UPSTASH_REDIS_REST_URL=[à configurer — en attente]
UPSTASH_REDIS_REST_TOKEN=[à configurer — en attente]
```

### Supabase RLS
- RLS activé sur TOUTES les tables
- Tout bloqué par défaut
- `auth.uid()` UNIQUEMENT dans les policies (jamais `user_metadata`)
- `WITH CHECK` sur toutes les policies UPDATE et INSERT
- `service_role_key` jamais exposée au frontend

### Authentication
- Vérification `is_admin` côté SERVEUR (pas seulement client)
- Logout via `/api/auth/signout` (POST) → `supabase.auth.signOut()` + redirect
- JWT validé sur chaque requête sensible

### Inputs
- Uniquement parameterized queries avec Supabase
- Validation Zod côté serveur pour tous les inputs
- HTML sanitisé avec `sanitize-html` (blog posts)
- JAMAIS `dangerouslySetInnerHTML` avec contenu user

---

## 5. Design System

### Couleurs
```
Primary:     #2D5016  (Vert forest)
Secondary:   #D4A574  (Terracotta)
Accent:      #F4D4B0  (Or subtil / crème)
Background:  #FAFAF8  (Off-white)
Foreground:  #1A1A1A  (Dark gray)
Border:      #E0D5C8  (Light beige)
Dark Hero:   #0d1a05  (Vert quasi-noir — hero + abonnements)
Dark Farm:   #1a3009  (Vert forêt — contact)
Dark Sub:    #0a1504  (Vert nuit — section abonnements)
```

### Typographie — Cormorant Garamond partout
| Variable CSS | Police | Usage |
|---|---|---|
| `--font-heading` | **Cormorant Garamond 700** | Titres h1–h6 |
| `--font-body` | **Cormorant Garamond 300** | Corps de texte, paragraphes |
| `--font-display` | **Cormorant Garamond** | Grands titres hero, prix, éditorial |
| `--font-ui` | **DM Sans** | Disponible si besoin pour UI |

- `body { font-weight: 300 }` — textes fins
- `h1, h2, h3, h4, h5, h6 { font-weight: 700 }` — titres gras
- Weights chargés via `next/font/google` : `["300", "400", "700"]`, normal seulement
- Tailles : H1 hero `clamp(2.8rem, 8vw, 6.5rem)` | H2 sections `clamp(2.4rem, 5vw, 4rem)` | Body `1rem`

### Logo & Favicon
- Logo : `/public/florus_pocus_logo.svg` — couleur SVG `#2F4F3E`, dimensions 160×36px dans Navbar
- Favicon : `src/app/icon.svg` — fleur 6 pétales terracotta sur fond vert `#2D5016`
- Navbar : `filter: none` (fond clair) ou `brightness(0) invert(1)` (Hero sombre)

### Z-index hierarchy
```
BotanicalLayers (fixed) : z-index 1
Toutes les sections     : z-index 2
Navbar / CartDrawer     : z-index 50
```

---

## 6. Architecture des fichiers

```
FlorusPocus/
├── .env.local                   ← secrets locaux (JAMAIS commiter)
├── next.config.ts               ← headers sécurité, CSP, remotePatterns, optimizePackageImports
├── contexte.md                  ← CE FICHIER — point de reprise
├── supabase/migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_storage.sql
│   ├── 003_contact_messages.sql
│   ├── 004_product_season_text.sql
│   └── 005_square_payment_id.sql
└── src/
    ├── middleware.ts            ← point d'entrée Next.js (re-exporte proxy)
    ├── proxy.ts                 ← middleware Supabase (rafraîchit tokens via extractJwt)
    ├── app/
    │   ├── icon.svg             ← favicon fleur 6 pétales
    │   ├── globals.css          ← @theme Tailwind v4, animations botanical-float CSS
    │   ├── layout.tsx           ← root layout (fonts + CartProvider)
    │   ├── (public)/layout.tsx  ← BotanicalLayers + Navbar + Footer + ClientCartDrawer
    │   ├── (public)/page.tsx    ← homepage
    │   ├── checkout/page.tsx    ← Client Component, Square Web Payments SDK
    │   ├── api/
    │   │   ├── auth/signout/route.ts
    │   │   ├── upload/route.ts       ← rate limiting + whitelist dossiers
    │   │   ├── square/payment/route.ts
    │   │   ├── square/webhook/route.ts
    │   │   ├── products/route.ts
    │   │   ├── subscriptions/route.ts
    │   │   ├── events/route.ts
    │   │   ├── blog/route.ts
    │   │   └── pages/route.ts
    │   └── admin/...
    ├── components/...
    ├── context/CartContext.tsx  ← Zod validation au rehydrate localStorage
    ├── lib/
    │   ├── supabase-server.ts   ← createClient + createPublicClient + createAdminClient + helpers cache
    │   ├── square.ts            ← SquareClient + SQUARE_LOCATION_ID
    │   ├── resend.ts            ← client Resend (actif si RESEND_API_KEY présente)
    │   ├── ratelimit.ts         ← Upstash limiteurs (actif si vars Upstash présentes)
    │   ├── emails/
    │   │   └── orderConfirmation.ts  ← template HTML + texte FR
    │   └── actions/
    │       ├── auth.ts          ← loginAdmin avec rate limiting
    │       ├── checkout.ts      ← createOrder
    │       └── contact.ts       ← sendContactMessage
    └── types/index.ts
```

---

## 7. Notes techniques critiques

### extractJwt() — Clés Supabase corrompues sur Vercel
Les variables `NEXT_PUBLIC_SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` sur Vercel contiennent des retours chariot (clé doublée → 5 segments JWT au lieu de 3). Fix en place dans `supabase-server.ts`, `proxy.ts` et `auth.ts` :
```ts
function extractJwt(raw: string): string {
  const clean = raw.replace(/\s+/g, "");
  const parts = clean.split(".");
  if (parts.length === 5) return `${parts[0]}.${parts[1]}.${parts[4]}`;
  return clean;
}
```
**À corriger proprement** : Vercel → supprimer/recoller les clés sur une seule ligne.

### supabase-server.ts — IMPORTANT
```ts
// NE PAS utiliser createServerClient() avec service_role_key → infinite recursion RLS
// createPublicClient() n'a PAS de cookies → compatible avec unstable_cache
// createClient() a des cookies → NE PAS utiliser dans unstable_cache
```

### Square Webhook — URL dynamique
Le handler utilise `req.url` (pas `NEXT_PUBLIC_SITE_URL`) pour la vérification HMAC — évite le mismatch www vs non-www.

### Turbopack — `dynamic(ssr: false)`
Doit être dans un Client Component. `ClientCartDrawer.tsx` sert de wrapper.

### Tailwind v4
Config dans `globals.css` avec `@theme {}`. Pas de `tailwind.config.js`.

### Safari mobile
Utiliser `100svh` plutôt que `100vh`.

---

## 8. Déploiement — Vercel

### Compte Vercel
- **Compte :** FlorusPocus Hobby (`info@floruspocus.com`)
- **Username :** `info-74995045`
- **Plan :** Hobby (gratuit)
- **Projet :** `florus-pocus` → `www.floruspocus.com`

### Repo GitHub
- URL : https://github.com/P34KPK/florus_pocus.git (**public**)
- Branch : `main`
- Git user : `peakafeller@me.com` (Sébastien Hamel)
- **Repo public requis** — Vercel Hobby bloque les deploys de collaborateurs sur repos privés

### Paramètres Vercel importants
- **Deployment Protection** : DÉSACTIVÉ
- **GitHub App** : connecté au repo `P34KPK/florus_pocus`
- **Auto-deploy** : actif sur push vers `main`

### Vercel CLI
- CLI connecté au compte **p34kpk** (compte personnel Sébastien) — pas au compte client
- Ne pas utiliser `vercel env add` pour les vars de prod
- Gérer les vars directement sur vercel.com → compte `info@floruspocus.com`

---

## 9. Identifiants admin

- **Email :** info@floruspocus.com
- **Mot de passe :** FlorusPocus2026!
- **URL admin :** http://localhost:3000/admin (dev) / https://www.floruspocus.com/admin (prod)

---

## 10. Dépendances principales

```json
{
  "next": "16.x",
  "react": "19.x",
  "@supabase/supabase-js": "^2.x",
  "@supabase/ssr": "^0.x",
  "square": "latest",
  "resend": "^6.x",
  "@upstash/ratelimit": "^2.x",
  "@upstash/redis": "^1.x",
  "framer-motion": "^12.x",
  "lucide-react": "^0.x",
  "sanitize-html": "^2.x",
  "zod": "^4.x"
}
```

**Polices Google (next/font) :**
- `Cormorant_Garamond` → heading + body + display (weights 300/400/700, normal)
- `DM_Sans` → font-ui (weights 400/500/600/700)
