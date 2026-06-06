# FlorusPocus — Contexte complet du projet

---

## 1. Vue d'ensemble

**Nom du projet :** Florus Pocus
**Type :** Site e-commerce + panel admin
**Stack :** Next.js 16, TypeScript, Tailwind v4, Supabase, Square Payments
**Serveur local :** `npm run dev` → http://localhost:3000
**Déploiement :** Vercel (compte FlorusPocus Hobby — `info@floruspocus.com`)
**Domaine production :** https://www.floruspocus.com
**Dernière session :** 2026-06-06 (session 6 — produits fleuristes exclusifs, admin/paramètres, footer adresse, abonnements format)

---

## 2. État d'avancement — CE QUI EST FAIT ✅

### Site public
- [x] Homepage allégée : Hero + WhyLocal + BlogPreview (WhyLocal + BlogPreview affichent les images uploadées)
- [x] Section abonnements : jauge animée par format (Petit ~⅓ / Moyen ~⅔ / Grand-XL plein)
- [x] Page `/abonnements` — section Subscriptions complète
- [x] Page `/boutique` — Fleuristes + BranchDivider + TransformedProducts
- [x] Page `/mange-moi` — catalogue vitrine comestibles (photo + description, sans achat)
- [x] `/autocueillette` SUPPRIMÉE — redirection 301 → `/mange-moi` (next.config.ts)
- [x] Page `/la-ferme` — histoire + stats éditables (CMS) + image uploadée + CTA → /contact
- [x] Page `/contact` — formulaire + infos
- [x] Page `/fleuristes` — espace professionnel protégé par code (cookie 30j)
- [x] Page `/politique-confidentialite` — page légale complète
- [x] Page `/conditions-utilisation` — page légale complète
- [x] Navbar multi-pages : vraies routes, visible immédiatement hors homepage
- [x] Navbar : "Autocueillette" remplacé par "Mange Moi" + lien Fleuristes avec icône cadenas 🔒
- [x] Navbar responsive (desktop + mobile hamburger)
- [x] Footer dynamique (adresse, email, téléphone, réseaux sociaux depuis DB) — liens vrais routes (plus de #anchors)
- [x] CartDrawer avec gestion quantités
- [x] Page `/blog` — listing magazine + filtre cliquable par tags (URL params)
- [x] Page `/blog/[slug]` — article complet + sanitization HTML
- [x] Page `/checkout` — formulaire client + sauvegarde commande en DB
- [x] Page 404 blog (`/blog/[slug]/not-found.tsx`)
- [x] Favicon SVG fleur 6 pétales (`src/app/icon.svg`)

### Admin panel (`/admin/*`)
- [x] Login avec Server Action (Supabase Auth) + rate limiting (5 tentatives/15min par IP)
- [x] Déconnexion (`/api/auth/signout`)
- [x] Dashboard avec vraies données (revenus, commandes, abonnements, produits, messages) — bouton "Voir les messages" → /admin/messages (corrigé)
- [x] Notification email à l'admin à chaque message de contact (vers contact_email)
- [x] `/admin/produits` — CRUD complet + champ prix fleuriste + catégorie libre
- [x] `/admin/abonnements` — CRUD abonnements + points de chute (modèle prix/bouquet + format)
- [x] `/admin/mange-moi` — CRUD catalogue Mange Moi (nom, description, photo, ordre, statut)
- [x] `/admin/pages` — édition contenu homepage (4 sections)
- [x] `/admin/contenu` — CMS global : adresse, téléphone, email, **heures d'ouverture**, réseaux sociaux, footer, WhyLocal (4 cartes), abonnements, code fleuristes
- [x] `/admin/blog` — CRUD articles + éditeur riche TipTap (H2/H3, gras, italique, listes, liens, citations, alignement…)
- [x] `/admin/commandes` — VRAIES commandes : filtres par statut, détail (client/articles/note), changement de statut, export CSV
- [x] `/admin/messages` — lecture messages contact : marquer lu, répondre (mailto), supprimer
- [x] `/admin/stats` — statistiques + exports
- [x] `/admin/parametres` — configuration générale
- [x] `/admin/autocueillette` SUPPRIMÉE (fonctionnalité retirée)
- [x] Upload d'images : Sharp → WebP automatique, max 10 MB, rate limiting (20/h) — bucket Storage `floruspocus` créé via API service_role
- [x] Toutes les pages admin de liste lisent via `createAdminClient` (voient les éléments inactifs/brouillons) — corrige le toggle on/off
- [x] Modals admin protégés contre fermeture accidentelle (pas de clic-fond, confirmation si saisie en cours)
- [x] `/admin/parametres` — page fonctionnelle : changement mot de passe admin, status services (Square/Resend/Upstash/Supabase), liens rapides dashboards externes
- [x] `/admin/contenu` — note contextuelle dans "Pied de page" → pointe vers "Coordonnées" pour adresse/tél/courriel
- [x] Produits fleuristes exclusifs : colonne `florist_only BOOLEAN DEFAULT false` (migration 010) — boutique grand public exclut ces produits, espace fleuristes les affiche uniquement — toggle admin dans ProductForm

### Square paiement (production)
- [x] SDK Square installé (`square`)
- [x] `src/lib/square.ts` — `SquareClient` + `SquareEnvironment`
- [x] `src/app/checkout/page.tsx` — Square Web Payments SDK
- [x] `src/app/api/square/payment/route.ts` — charge carte, validation montant, idempotency key = orderId
- [x] `src/app/api/square/webhook/route.ts` — HMAC SHA256, gère payment.updated/created/completed/failed + envoi email Resend
- [x] Credentials production configurés sur Vercel
- [x] Webhook Square configuré : `https://www.floruspocus.com/api/square/webhook`
- [x] Migration `005_square_payment_id.sql` exécutée

### Sécurité (audit 2026-06-04)
- [x] `dangerouslySetInnerHTML` → sanitize-html (blog) + balises TipTap (h4, s) autorisées
- [x] Validation Zod côté serveur sur tous les inputs
- [x] Validation localStorage cart (Zod schema au rehydrate)
- [x] Headers sécurité dans `next.config.ts` (HSTS, CSP, X-Frame-Options, etc.)
- [x] Upload : whitelist dossiers + conversion WebP via Sharp
- [x] Rate limiting : actif en production (Upstash `ca-central-1`)
- [x] Emails confirmation : actifs en production (Resend, domaine vérifié, `commandes@floruspocus.com`)
- [x] Accès fleuristes : cookie HttpOnly + Secure(prod) + SameSite=lax, 30j, code vérifié en DB
- [x] `assertAdmin()` — helper partagé dans `auth-guard.ts` : vérifie JWT + is_admin DB
- [x] Toutes les Server Actions protégées par `assertAdmin()` (blog, produits, abonnements, pages, events, settings, mangeMoi)
- [x] `revalidateTag(..., "max")` sur toutes les actions — invalidation immédiate du cache
- [x] `ProductSeason` type supprimé — season est `string | null` libre depuis migration 004

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
- [x] Migration `006_subscriptions_format.sql` — price_monthly→price, stems_count→format (TEXT)
- [x] Migration `007_site_settings.sql` — table site_settings (CMS global, RLS public read)
- [x] Migration `008_florist_price.sql` — florist_price sur products + code accès fleuristes
- [x] Migration `009_mange_moi.sql` — table mange_moi_items (name, description, image_url, sort_order, active)
- [x] Migration `010_florist_only.sql` — colonne florist_only BOOLEAN sur products
- [x] Migration `006_subscriptions_format.sql` — exécutée en prod (price_monthly→price, stems_count→format TEXT)

---

## 3. CE QUI RESTE À FAIRE 🔲

- [x] ~~Clés Supabase corrompues~~ — RÉGLÉ : clés ANON + SERVICE recollées proprement dans Vercel, contournement `extractJwt` retiré du code
- [x] ~~Sitemap + SEO~~ — FAIT : `app/sitemap.ts` (statiques + blog), `app/robots.ts`, metadataBase, openGraph/twitter, canonical par page
- [ ] **Contenu réel** — photos produits + articles blog (client le fait via admin)
- [ ] **Gestion stock** — sold out sur les produits (champ stock existe, affichage "Épuisé" existe, mais pas de logique automatique)

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
RESEND_API_KEY=[configurée — domaine floruspocus.com vérifié]
UPSTASH_REDIS_REST_URL=[configurée — ca-central-1]
UPSTASH_REDIS_REST_TOKEN=[configurée — ca-central-1]
```

### Supabase RLS
- RLS activé sur TOUTES les tables (y compris site_settings)
- Tout bloqué par défaut
- `auth.uid()` UNIQUEMENT dans les policies (jamais `user_metadata`)
- `WITH CHECK` sur toutes les policies UPDATE et INSERT
- `service_role_key` jamais exposée au frontend
- `site_settings` : lecture publique autorisée, écriture via service_role uniquement

### Authentication
- Vérification `is_admin` côté SERVEUR (pas seulement client)
- Logout via `/api/auth/signout` (POST) → `supabase.auth.signOut()` + redirect
- JWT validé sur chaque requête sensible
- Fleuristes : cookie `fp_florist` HttpOnly, SameSite=lax, 30 jours, code vérifié en DB

### Inputs
- Uniquement parameterized queries avec Supabase
- Validation Zod côté serveur pour tous les inputs
- HTML sanitisé avec `sanitize-html` (blog posts) — balises TipTap incluses (h4, s)
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
- Favicon : `src/app/icon.svg` UNIQUEMENT — fleur 6 pétales terracotta sur fond vert `#2D5016`. ⚠️ NE PAS ré-ajouter `src/app/favicon.ico` : le `.ico` par défaut de Next.js prenait le dessus sur la fleur (supprimé). App Router auto-détecte `icon.svg`. (Favicons très cachés par le navigateur → forcer Cmd+Shift+R pour voir le changement.)
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
│   ├── 005_square_payment_id.sql
│   ├── 006_subscriptions_format.sql
│   ├── 007_site_settings.sql
│   ├── 008_florist_price.sql
│   └── 009_mange_moi.sql
└── src/
    ├── middleware.ts            ← point d'entrée Next.js (re-exporte proxy)
    ├── proxy.ts                 ← middleware Supabase (rafraîchit tokens via extractJwt)
    ├── app/
    │   ├── icon.svg             ← favicon fleur 6 pétales
    │   ├── globals.css          ← @theme Tailwind v4, animations botanical-float CSS
    │   ├── layout.tsx           ← root layout (fonts + CartProvider)
    │   ├── (public)/layout.tsx  ← BotanicalLayers + Navbar + Footer + ClientCartDrawer
    │   ├── (public)/page.tsx    ← homepage (charge site_settings pour WhyLocal)
    │   ├── (public)/fleuristes/page.tsx  ← vérifie cookie fp_florist, affiche Gate ou Catalog
    │   ├── (public)/mange-moi/page.tsx   ← catalogue vitrine comestibles (sans achat)
    │   ├── (public)/politique-confidentialite/page.tsx
    │   ├── (public)/conditions-utilisation/page.tsx
    │   ├── checkout/page.tsx    ← Client Component, Square Web Payments SDK
    │   ├── api/
    │   │   ├── auth/signout/route.ts
    │   │   ├── upload/route.ts       ← Sharp WebP + rate limiting + whitelist
    │   │   ├── square/payment/route.ts
    │   │   ├── square/webhook/route.ts ← confirme paiement + envoie email Resend
    │   │   ├── products/route.ts
    │   │   ├── subscriptions/route.ts
    │   │   ├── events/route.ts
    │   │   ├── blog/route.ts
    │   │   └── pages/route.ts
    │   └── admin/
    │       └── (protected)/
    │           ├── contenu/page.tsx   ← CMS global (site_settings)
    │           ├── mange-moi/page.tsx ← CRUD catalogue Mange Moi
    │           └── ...autres pages admin
    ├── components/
    │   ├── admin/
    │   │   ├── blog/RichTextEditor.tsx       ← TipTap WYSIWYG
    │   │   ├── contenu/ContenuClient.tsx
    │   │   └── mange-moi/MangeMoiClient.tsx  ← CRUD catalogue
    │   └── sections/
    │       ├── FloristGate.tsx     ← formulaire code d'accès fleuristes
    │       ├── FloristCatalog.tsx  ← catalogue pro avec prix de gros
    │       └── (MangeMoi affiché directement dans /mange-moi/page.tsx)
    ├── context/CartContext.tsx  ← Zod validation au rehydrate localStorage
    ├── lib/
    │   ├── supabase-server.ts   ← createClient + createPublicClient + createAdminClient + getSiteSettings + getMangeMoiItems
    │   ├── square.ts            ← SquareClient + SQUARE_LOCATION_ID
    │   ├── resend.ts            ← client Resend
    │   ├── ratelimit.ts         ← Upstash limiteurs
    │   ├── emails/
    │   │   └── orderConfirmation.ts
    │   └── actions/
    │       ├── auth.ts          ← loginAdmin avec rate limiting
    │       ├── checkout.ts      ← createOrder
    │       ├── contact.ts       ← sendContactMessage + notification email admin
    │       ├── settings.ts      ← updateSiteSettings (CMS)
    │       ├── auth-guard.ts    ← assertAdmin() : JWT + is_admin DB (partagé par toutes les actions)
    │       ├── florist.ts       ← verifyFloristCode + isFloristAuthenticated
    │       ├── mangeMoi.ts      ← CRUD mange_moi_items
    │       ├── messages.ts      ← markMessageRead + deleteMessage
    │       └── orders.ts        ← updateOrderStatus (statuts enum stricts)
    └── types/index.ts           ← Product.florist_price + MangeMoiItem + season: string | null
    (supprimés session 4 : actions/events.ts, api/events, sections/Autocueillette.tsx,
     admin/autocueillette, public/autocueillette, getUpcomingEvents, type AutocueilletteEvent)
```

---

## 7. Notes techniques critiques

### Clés Supabase — RÉGLÉ (historique)
Les clés sur Vercel étaient corrompues (collées avec retours à la ligne → JWT dédoublé) → login admin "Identifiants invalides". Un contournement `extractJwt()` reconstruisait la clé, mais c'était fragile.
**Résolu** : clés `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY` recollées proprement (une seule ligne) dans Vercel. Le hack `extractJwt` a été retiré ; le code utilise simplement `.trim()`.
⚠️ Si jamais le login admin recasse en "Identifiants invalides" en prod : re-vérifier que ces 2 clés Vercel n'ont pas de retour à la ligne (les recopier depuis Supabase → Settings → API).

### supabase-server.ts — IMPORTANT
```ts
// NE PAS utiliser createServerClient() avec service_role_key → infinite recursion RLS
// createPublicClient() n'a PAS de cookies → compatible avec unstable_cache
// createClient() a des cookies → NE PAS utiliser dans unstable_cache
```

### Pages admin — TOUJOURS createAdminClient pour les listes
Les policies RLS ne montrent que `active=true` / `published=true`. Une page admin qui lit
via `createClient()` (RLS) ne verra donc PAS les produits inactifs / brouillons → le toggle
on/off semble "cassé" (l'élément disparaît). Toutes les pages admin de liste utilisent
`createAdminClient()` (bypass RLS) — sûr car le layout `(protected)` vérifie déjà `is_admin`.
L'affichage public reste filtré via getActiveProducts / getPublishedBlogPosts.

### Storage — bucket créé via API, pas par SQL
Le bucket `floruspocus` ne peut pas être créé de façon fiable par `002_storage.sql` (les
CREATE POLICY storage.objects échouent dans l'éditeur SQL → rollback). Créé via
`sb.storage.createBucket("floruspocus", { public:true, fileSizeLimit:10485760, allowedMimeTypes:[...] })`.
Symptôme si absent : upload échoue avec "Bucket not found".

### CMS coordonnées — tout doit lire site_settings
Adresse / téléphone / courriel / heures / réseaux : Footer, section Contact, pages légales
et FloristGate lisent TOUS depuis `getSiteSettings()`. Composants client (Contact, FloristGate)
reçoivent les valeurs en props depuis leur page Server Component (ils ne peuvent pas appeler
getSiteSettings directement). Si tu ajoutes un nouvel endroit affichant une coordonnée, le
brancher sur site_settings — ne jamais coder en dur.

### Modal admin — protection anti-perte
`Modal.tsx` : clic sur le fond ne ferme pas ; Échap/X demandent confirmation seulement si du
contenu a été saisi (détection `dirty` via onInput/onChange). Sauvegarde réussie ferme sans
friction (onSuccess appelle onClose directement).

### Images de section — uploadée vs statique
Les grandes sections affichent `page.featured_image_url` (uploadée via Admin → Pages) avec
repli sur l'image statique `/images/*.webp` :
- WhyLocal (accueil) → image de la page `why-local`
- Farm (/la-ferme) → image de la page `farm`
- BlogPreview (accueil, « Histoires de la ferme ») → image uploadée de chaque article (était placeholder SVG figé)
- Hero & Contact : PAS d'emplacement photo simple (Hero = composition décorative, Contact = pas de photo) — leur uploader dans /admin/pages n'a pas d'effet visible.
⚠️ La page doit être **publiée** (getPublishedPages ne retourne que published=true) sinon repli statique.
Toute section affichant une image éditable doit lire featured_image_url, jamais coder en dur.

### Stats « La Ferme » + jauge abonnements (CMS / animation)
- Stats ferme : 8 réglages site_settings (groupe `ferme`), passés en props à Farm depuis la page.
- Abonnements : `FormatGauge` (arc framer-motion) se remplit selon `FORMAT_FILL` (Petit 0.34 /
  Moyen 0.67 / Grand 1 / XL 1). Remplace l'ancienne `BouquetGauge` basée sur les tiges.

### revalidateTag — Next.js 16
```ts
// Next.js 16 requiert un 2e argument obligatoire
revalidateTag("events", "max");   // ✅
revalidateTag("events");          // ❌ TypeScript error
```

### ⚠️ Statuts de commande — enums Postgres STRICTS (ne pas dévier)
Les colonnes `orders.status` et `orders.payment_status` sont des ENUMS Postgres. **Écrire une valeur hors liste fait échouer l'UPDATE.**
```
order_status   = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
payment_status = 'pending' | 'completed' | 'failed'
```
Après un paiement réussi : `status = "paid"`, `payment_status = "completed"`.
(Bug historique session 4 : le code écrivait `"confirmed"` / `"paid"` invalides → UPDATE échouait en silence → commandes bloquées à pending. Corrigé.)
Toujours vérifier l'erreur de `.update()` sur orders dans la route de paiement.

### Square Webhook — URL dynamique
Le handler utilise `req.url` (pas `NEXT_PUBLIC_SITE_URL`) pour la vérification HMAC — évite le mismatch www vs non-www.

### Turbopack — `dynamic(ssr: false)`
Doit être dans un Client Component. `ClientCartDrawer.tsx` sert de wrapper.

### Tailwind v4
Config dans `globals.css` avec `@theme {}`. Pas de `tailwind.config.js`.

### Safari mobile
Utiliser `100svh` plutôt que `100vh`.

### SEO — URL canonique
`src/lib/site.ts` exporte `SITE_URL` = `NEXT_PUBLIC_SITE_URL` (sans slash final) ou `https://www.floruspocus.com` par défaut. Utilisé par `metadataBase`, `sitemap.ts`, `robots.ts` et les canonical.
⚠️ Vérifier que `NEXT_PUBLIC_SITE_URL` sur Vercel correspond au domaine canonique souhaité (www vs non-www) et que l'autre redirige vers lui — sinon mismatch www/non-www pour Google.
`/sitemap.xml` et `/robots.txt` sont générés automatiquement. `/admin`, `/checkout`, `/api`, `/fleuristes` sont exclus de l'indexation.

### Upload images
Sharp converti tout en WebP (qualité 80, max 1920px). Limite : 10 MB avant compression. Formats acceptés : JPG, PNG, WebP, GIF, AVIF.

### Abonnements — modèle de prix (migration 006)
- `price` (pas `price_monthly`) = prix par bouquet
- `format` (TEXT, pas `stems_count`) = Petit / Moyen / Grand / XL
- `isPopular` basé sur `format === "Moyen"` dans Subscriptions.tsx

### CMS — site_settings
- Table `site_settings` (key, value, label, grp)
- `getSiteSettings()` → retourne `Record<string, string>` — caché avec tag `site_settings`
- Groupes : `contact`, `reseaux_sociaux`, `footer`, `pourquoi_local`, `abonnements`, `fleuristes`
- Admin : `/admin/contenu`

### Server Actions — protection
Toutes les actions d'écriture passent par `assertAdmin()` (`src/lib/actions/auth-guard.ts`) :
1. `createClient().auth.getUser()` → vérifie que le JWT est valide
2. `createAdminClient().from("users").select("is_admin")` → vérifie le flag en DB

Pattern de retour en cas d'échec : `{ error: "Non autorisé." }` ou `{ error: "Accès refusé." }`

### Cache invalidation — pattern standard
Chaque action utilise `revalidateTag(tag, "max")` + `revalidatePath()` via une fonction locale `invalidate()`.
Tags : `blog_posts`, `products`, `subscriptions`, `pages`, `events`, `site_settings`, `mange_moi`.

### Fleuristes — accès privé
- Cookie `fp_florist=1`, HttpOnly, Secure(prod), SameSite=lax, 30 jours
- Code stocké dans `site_settings.florist_access_code` (défaut: `fleuriste2026`)
- Changer le code : Admin → Contenu → section "Accès fleuristes"
- `florist_price` sur products : prix de gros affiché dans FloristCatalog (null = prix public)

### Mange Moi — catalogue vitrine
- Table `mange_moi_items` (id, name, description, image_url, active, sort_order)
- RLS : lecture publique des items actifs uniquement
- `getMangeMoiItems()` → caché avec tag `mange_moi`
- Navbar/Footer/Hero : "Autocueillette" remplacé par "Mange Moi" → `/mange-moi`
- Autocueillette entièrement retirée (session 4) : pages, admin, action, API supprimés ; redirection 301 `/autocueillette` → `/mange-moi`. Table `autocueillette_events` conservée en DB (données historiques, plus utilisée par le code).

### Produits — catégorie libre
- Champ `season` = sous-catégorie libre (TEXT) depuis migration 004
- Admin : champ texte libre avec datalist suggestions
- Boutique : filtres générés dynamiquement depuis les valeurs réelles en DB
- Rétrocompatibilité anciens slugs via `LEGACY_LABELS` dans Fleuristes.tsx et TransformedProducts.tsx

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
- **Mot de passe :** ⚠️ NE PAS écrire ici — repo PUBLIC. Stocké hors repo (gestionnaire de mots de passe). Réinitialisable via Supabase → Authentication → Users, ou `scripts/reset-admin.mjs` (mot de passe passé en argument/variable d'env, jamais en dur).
- **URL admin :** http://localhost:3000/admin (dev) / https://www.floruspocus.com/admin (prod)
- **Code fleuristes :** voir Admin → Contenu → « Accès fleuristes » (ne pas écrire la valeur ici)

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
  "sharp": "latest",
  "@tiptap/react": "latest",
  "@tiptap/pm": "latest",
  "@tiptap/starter-kit": "latest",
  "@tiptap/extension-link": "latest",
  "@tiptap/extension-placeholder": "latest",
  "@tiptap/extension-text-align": "latest",
  "framer-motion": "^12.x",
  "lucide-react": "^0.x",
  "sanitize-html": "^2.x",
  "zod": "^4.x"
}
```

**Polices Google (next/font) :**
- `Cormorant_Garamond` → heading + body + display (weights 300/400/700, normal)
- `DM_Sans` → font-ui (weights 400/500/600/700)
