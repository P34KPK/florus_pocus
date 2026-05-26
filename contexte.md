# FlorusPocus — Contexte complet du projet

---

## 1. Vue d'ensemble

**Nom du projet :** Florus Pocus
**Type :** Site e-commerce + panel admin
**Stack :** Next.js 16, TypeScript, Tailwind v4, Supabase, Square Payments (à venir)
**Serveur local :** `npm run dev` → http://localhost:3000
**Déploiement :** Vercel (compte FlorusPocus Hobby — `info@floruspocus.com`)
**Dernière session :** 2026-05-26

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
- [x] Footer avec liens sociaux (Instagram, Facebook, Email)
- [x] CartDrawer avec gestion quantités
- [x] Page `/blog` (listing magazine)
- [x] Page `/blog/[slug]` (article complet + sanitization HTML)
- [x] Page `/checkout` (formulaire client + sauvegarde commande en DB)
- [x] Page 404 blog (`/blog/[slug]/not-found.tsx`)

### Admin panel (`/admin/*`)
- [x] Login avec Server Action (Supabase Auth)
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
- [x] Upload d'images (Supabase Storage, bucket `floruspocus`)

### Contenu & UI (2026-05-26)
- [x] **"Ferme florale artisanale" → "Floriculture écoresponsable"** partout (Hero, Footer, blog/page.tsx ×2, la-ferme/page.tsx)
- [x] **Footer — logos certifications** : `aliments-du-qc-logo-white.webp` + `APFCQ-logo-white.webp` (copiés dans `/public`, affichés sous les icônes sociales)
- [x] **Footer — réseaux sociaux mis à jour** :
  - Instagram → `https://www.instagram.com/florus_pocus` (@florus_pocus)
  - Facebook supprimé → remplacé par **LinkedIn** `https://www.linkedin.com/company/floruspocus/`
  - Icônes SVG inline (lucide-react v1.16 n'a pas Instagram/Linkedin)
- [x] **Description SEO** (`layout.tsx`) → commence par "Cultiver la Vie!"
- [x] **Bug build Vercel** corrigé : `Instagram` et `Linkedin` absents de lucide-react v1.16 → SVG inline

### Performance (optimisations 2026-05-25)
- [x] `next.config.ts` : `optimizePackageImports` (framer-motion, lucide-react), format AVIF, cache 1 an `/images/`
- [x] Fonts : Cormorant weights 300+400+700 (normal seulement), DM Sans 400/500/600/700, Inter 400/500/600
- [x] `BotanicalLayers.tsx` → Server Component pur (retiré Framer Motion + useScroll + useTransform, animations CSS pures `@keyframes botanical-float-1/2`)
- [x] `ClientCartDrawer.tsx` (nouveau) → wrapper `"use client"` + `dynamic(ssr: false)` pour CartDrawer — requis par Turbopack
- [x] `Hero.tsx` : particules réduites de 60 → 20 (10 gauche + 10 droite)
- [x] `supabase-server.ts` : `createPublicClient()` sans cookies + 7 helpers `unstable_cache` (revalidate 3600, tags par table)
- [x] Toutes les pages publiques : passées en `○ Static` avec revalidation 1h via les helpers cachés
- [x] 10 sections : suppression `backdropFilter: blur(24px)` → fonds semi-transparents solides (GPU)
- [x] Blog + CartDrawer : `<img>` → `<Image>` Next.js avec `fill` + `sizes`
- [x] `globals.css` : `will-change: transform` sur les layers botaniques, `prefers-reduced-motion` respecté

### Design & UI (2026-05-25)
- [x] **Typographie Cormorant Garamond** sur tout le site : bold (700) pour titres, thin (300) pour textes de corps
  - `--font-heading`, `--font-body`, `--font-display` tous → Cormorant Garamond
  - `--font-ui` → DM Sans (gardé pour éléments UI si besoin)
  - `body { font-weight: 300 }` / `h1-h6 { font-weight: 700 }`
- [x] **Logo SVG** dans la navbar : `/public/florus_pocus_logo.svg` (copié depuis `IMG/`)
  - Filtre CSS : `brightness(0) invert(1)` sur le Hero (fond sombre), aucun filtre ailleurs
  - Dimensions : 160×36px dans le Navbar
- [x] **WhyLocal** : espace insécable (` `) avant `?` dans le titre — le `?` ne passe plus à la ligne

### Sécurité & bugs corrigés
- [x] `dangerouslySetInnerHTML` → sanitize-html (blog)
- [x] Formulaire contact → Server Action + Supabase (table `contact_messages`)
- [x] Navbar invisible au scroll → corrigé
- [x] `<img>` → `<Image>` Next.js partout
- [x] Validation upload côté client (MIME + taille)
- [x] ParallaxPetals : max 5 sur mobile + respect `prefers-reduced-motion`
- [x] Comparaison de dates Autocueillette → `setHours(0,0,0,0)`
- [x] CartContext : quantité ≤ 0 supprime l'item
- [x] Emojis produits → SVG botanique cohérent (#D4A574 / #F4D4B0)
- [x] Logo admin → SVG floral 6 pétales
- [x] Jauge SVG bouquets (arc 270°) dans section Abonnements
- [x] Navbar cachée tant que le rideau Hero est fermé (custom event `hero-curtain`)
- [x] Navbar : animation tiroir (slide-down spring) après ouverture du rideau (délai 800ms)
- [x] Navbar multi-pages : `usePathname()` — visible immédiatement hors `/`, `hero-curtain` ignoré hors `/`
- [x] Couleurs Navbar : `dark = scrolled || !isHomepage` — fond blanc + liens sombres dès le chargement sur pages sans Hero
- [x] Menu mobile : fermeture automatique au changement de route (`useEffect([pathname])`)
- [x] Route group `(public)` — layout partagé (BotanicalLayers + Navbar + Footer + CartDrawer), toutes les pages publiques dedans sauf `/checkout` (isolé volontairement)
- [x] Liens Hero → `/abonnements` et `/autocueillette` (ancres supprimées)
- [x] WhyLocal : CTA "Découvrir notre ferme →" → `/la-ferme` ajouté
- [x] Farm : `href="#contact"` → `Link href="/contact"` corrigé

### Base de données
- [x] Migration `001_initial_schema.sql` exécutée (tables + RLS + seed)
- [x] Migration `002_storage.sql` exécutée (bucket Supabase Storage)
- [x] Migration `003_contact_messages.sql` exécutée (table contact_messages)

---

## 3. CE QUI RESTE À FAIRE 🔲

### Priorité haute
- [ ] **Connecter domaine `floruspocus.ca`**
  - Vercel → florus-pocus → Settings → Domains → ajouter `floruspocus.ca`
  - DNS Cloudflare : A `@` → `76.76.21.21` + CNAME `www` → `cname.vercel-dns.com` (nuage GRIS)
  - Supabase Auth URL → `https://floruspocus.ca` après domaine actif
- [ ] **Square paiement** ← PRIORITÉ SUIVANTE
  - **En attente des credentials du client** (Dashboard Square → developer.squareup.com)
  - 4 valeurs requises (Sandbox d'abord, puis Production) :
    - `NEXT_PUBLIC_SQUARE_APP_ID` — Application ID
    - `SQUARE_SECRET_API_KEY` — Access Token
    - `SQUARE_LOCATION_ID` — Location ID (emplacement physique)
    - `SQUARE_WEBHOOK_SIGNATURE_KEY` — clé générée à la création du webhook
  - **À construire une fois credentials reçus :**
    - Square Web Payments SDK sur `/checkout` (champ carte sécurisé)
    - Route `/api/square/payment` — traitement paiement + sauvegarde commande DB
    - Route `/api/square/webhook` — confirmation async Square → site
    - Validation des montants côté serveur uniquement

### Priorité moyenne
- [ ] **Emails de confirmation** — après achat / inscription abonnement
  - Aucun service email choisi (Resend, SendGrid, etc.)
- [ ] **Rate limiting** — Upstash sur `/api/auth/signout`, `/api/upload`, `/checkout`

### Priorité basse
- [ ] **Sitemap + SEO** — `sitemap.xml`, meta dynamiques par page (metadata déjà en place sur chaque page)
- [ ] **Contenu réel** — photos produits + articles blog (client le fait via admin)

---

## 4. Règles de sécurité (NON-NÉGOCIABLES)

### Secrets & Clés API
- JAMAIS de clé API en dur dans le code
- TOUS les secrets dans `.env.local` (jamais commité)
- `.env.local` dans `.gitignore` AVANT le premier commit
- Variables publiques : préfixe `NEXT_PUBLIC_` obligatoire
- Variables serveur (sans préfixe) : `SUPABASE_SERVICE_ROLE_KEY`, `SQUARE_SECRET_API_KEY` — backend ONLY

### Variables d'environnement
```
# PUBLIC (visibles côté client)
NEXT_PUBLIC_SUPABASE_URL=https://msxyptzedflnfbtbvrwi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[voir .env.local]
NEXT_PUBLIC_SQUARE_APP_ID=placeholder   ← à remplacer quand Square prêt
NEXT_PUBLIC_SITE_URL=https://floruspocus.ca

# SERVEUR UNIQUEMENT
SUPABASE_SERVICE_ROLE_KEY=[voir .env.local]
SQUARE_SECRET_API_KEY=placeholder       ← à remplacer quand Square prêt
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

### API & Réseau
- Headers de sécurité dans `next.config.ts` (HSTS, CSP, X-Frame-Options, etc.)
- HTTPS obligatoire en production

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

### Logo
- Fichier : `/public/florus_pocus_logo.svg` (copié depuis `IMG/florus_pocus_logo.svg`)
- Couleur SVG : `#2F4F3E` (vert foncé fixe)
- Navbar : `filter: none` sur fond clair, `brightness(0) invert(1)` sur Hero (fond sombre)
- Dimensions dans Navbar : 160×36px

### Z-index hierarchy
```
BotanicalLayers (fixed) : z-index 1
Toutes les sections     : z-index 2
BranchDivider           : z-index 2
Navbar / CartDrawer     : z-index 50
```

---

## 6. Architecture des fichiers

```
FlorusPocus/
├── .env.local                   ← secrets locaux (JAMAIS commiter)
├── .env.example                 ← template sans valeurs
├── .gitignore
├── next.config.ts               ← headers sécurité, remotePatterns Supabase, optimizePackageImports
├── contexte.md                  ← CE FICHIER — point de reprise
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql   ← schéma + RLS + seed
│       ├── 002_storage.sql          ← bucket floruspocus (Storage)
│       └── 003_contact_messages.sql ← table contact_messages
└── src/
    ├── app/
    │   ├── globals.css              ← @theme Tailwind v4, animations, botanical-float CSS
    │   ├── layout.tsx               ← root layout (fonts Cormorant 300/400/700 + CartProvider)
    │   ├── (public)/                ← route group — layout partagé
    │   │   ├── layout.tsx           ← BotanicalLayers + Navbar + Footer + ClientCartDrawer
    │   │   ├── page.tsx             ← / homepage : Hero + WhyLocal + BlogPreview
    │   │   ├── abonnements/page.tsx ← getActiveSubscriptions()
    │   │   ├── autocueillette/page.tsx ← getUpcomingEvents()
    │   │   ├── boutique/page.tsx    ← getActiveProducts()
    │   │   ├── la-ferme/page.tsx    ← getPublishedPage("farm")
    │   │   ├── contact/page.tsx     ← getPublishedPage("contact")
    │   │   └── blog/
    │   │       ├── page.tsx         ← getPublishedBlogPosts()
    │   │       └── [slug]/
    │   │           ├── page.tsx     ← getBlogPost(slug) + cache() React
    │   │           └── not-found.tsx
    │   ├── checkout/page.tsx        ← Client Component, flow isolé
    │   ├── api/
    │   │   ├── auth/signout/route.ts
    │   │   ├── upload/route.ts
    │   │   ├── pages/route.ts
    │   │   ├── products/route.ts
    │   │   ├── subscriptions/route.ts
    │   │   ├── events/route.ts
    │   │   └── blog/route.ts
    │   └── admin/...
    ├── components/
    │   ├── Navbar.tsx               ← Logo SVG 160×36, filtre CSS dark/light
    │   ├── ClientCartDrawer.tsx     ← "use client" + dynamic(ssr:false) — requis Turbopack
    │   ├── CartDrawer.tsx
    │   ├── BotanicalLayers.tsx      ← Server Component pur, animations CSS (plus de Framer Motion)
    │   ├── Footer.tsx
    │   ├── BranchDivider.tsx
    │   ├── GrowingStem.tsx
    │   ├── ParallaxPetals.tsx       ← max 5 mobile + reduced-motion
    │   ├── LeafTrail.tsx
    │   └── sections/
    │       ├── Hero.tsx             ← 20 particules (réduit de 60)
    │       ├── WhyLocal.tsx         ←   avant ? dans le titre
    │       ├── Subscriptions.tsx
    │       ├── Autocueillette.tsx
    │       ├── Fleuristes.tsx
    │       ├── TransformedProducts.tsx
    │       ├── BlogPreview.tsx
    │       ├── Farm.tsx
    │       └── Contact.tsx
    ├── context/CartContext.tsx
    ├── lib/
    │   ├── supabase-server.ts       ← createClient + createPublicClient + createAdminClient
    │   │                               + 7 helpers unstable_cache (revalidate:3600, tags)
    │   └── actions/...
    └── types/index.ts
```

---

## 7. supabase-server.ts — Helpers cachés

```ts
// createClient()       → @supabase/ssr → cookies → session utilisateur
// createPublicClient() → @supabase/supabase-js → pas de cookies → compatible cache Next.js
// createAdminClient()  → service role → bypass RLS

// Helpers unstable_cache (revalidate: 3600, tags pour invalidation):
getPublishedPages()           → tags: ["pages"]
getPublishedBlogPosts(limit?) → tags: ["blog_posts"]
getBlogPost(slug)             → tags: ["blog_posts"]
getPublishedPage(slug)        → tags: ["pages"]
getActiveSubscriptions()      → tags: ["subscriptions"]
getActiveProducts()           → tags: ["products"]
getUpcomingEvents()           → tags: ["events"]
```

---

## 8. Base de données (Supabase PostgreSQL)

### Tables et RLS

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| users | own + admin | — | own + admin | admin |
| pages | published=true | admin | admin | admin |
| products | active=true | admin | admin | admin |
| subscriptions | active=true | admin | admin | admin |
| subscription_dropoff_points | public | admin | admin | admin |
| autocueillette_events | active=true | admin | admin | admin |
| blog_posts | published=true | admin | admin | admin |
| orders | own email + admin | service role | admin | admin |
| order_items | own orders + admin | service role | admin | admin |
| contact_messages | admin | service role | admin | admin |

### Supabase Storage
- Bucket : `floruspocus` (public, 5MB max, images seulement)
- Dossiers : `products/`, `blog/`, `pages/`
- Upload via `/api/upload` (admin uniquement, service role key)

---

## 9. Notes techniques critiques

### Turbopack — `dynamic(ssr: false)` doit être dans un Client Component
`dynamic(() => import(...), { ssr: false })` n'est pas autorisé dans un Server Component avec Turbopack.
Solution : wrapper `"use client"` → c'est le rôle de `ClientCartDrawer.tsx`.

### BotanicalLayers — Server Component pur
Retiré tout Framer Motion. Animations via `@keyframes botanical-float-1/2` dans `globals.css`.
Classes CSS : `botanical-leaf-1`, `botanical-leaf-2` avec `will-change: transform`.

### supabase-server.ts — IMPORTANT
```ts
// NE PAS utiliser createServerClient() avec service_role_key → infinite recursion RLS
// createPublicClient() n'a PAS de cookies → compatible avec unstable_cache
// createClient() a des cookies → NE PAS utiliser dans unstable_cache
```

### proxy.ts (middleware Next.js)
- Renommé de `middleware.ts` → `proxy.ts` dans ce projet
- Rafraîchit les tokens Supabase sur chaque requête
- Matcher exclut les fichiers statiques

### Hero — Architecture rideaux
- 2 panneaux absolus `height: 100svh`
- Auto-ouverture après 2800ms
- Fermeture si `scrollY < 40`, ré-ouverture si `scrollY > 80`
- Images : `/public/images/hero/FLEUR-L.webp` et `FLEUR-R.webp`
- Logo : `/public/images/fp_logo.png` (z-30)

### Navbar
- Logo SVG : `filter: none` (fond clair) ou `brightness(0) invert(1)` (Hero sombre)
- `dark = scrolled || !isHomepage`
- Sur `/` : navVisible déclenché par `hero-curtain` event → délai 800ms → slide-down spring
- Sur autres pages : `navVisible = true` immédiatement
- Menu mobile ferme automatiquement au changement de route

### Hydration
- JAMAIS `Math.random()` en SSR → hydration mismatch
- Données placeholder avec valeurs fixes

### Tailwind v4
- Config dans `globals.css` avec `@theme {}`
- Pas de `tailwind.config.js`
- `--font-ui` disponible pour DM Sans si besoin

### Safari mobile
- Utiliser `100svh` (small viewport height) plutôt que `100vh`

---

## 10. Déploiement — Vercel

### Compte Vercel
- **Compte :** FlorusPocus Hobby (`info@floruspocus.com`)
- **Username :** `info-74995045`
- **Plan :** Hobby (gratuit)
- **Projet :** `florus-pocus` → `florus-pocus.vercel.app`
- **Team ID :** `team_K1ZplOff9VGYK3Ce3SkAvLdw`

### Repo GitHub
- URL : https://github.com/P34KPK/florus_pocus.git (privé)
- Branch : `main`
- Git user email : `peakafeller@me.com` (vérifié sur GitHub — obligatoire pour Vercel)

### Paramètres Vercel importants
- **Deployment Protection → Vercel Authentication** : **DÉSACTIVÉ** (sinon les auto-deploys GitHub sont bloqués)
- **Require Verified Commits** : désactivé
- **GitHub App** : connecté au repo `P34KPK/florus_pocus`

### Statut déploiement
- [x] Build réussi — toutes les pages publiques `○ Static` avec revalidation 1h
- [x] Variables d'env configurées sur Vercel
- [x] Auto-deploy depuis GitHub fonctionnel
- [ ] Domaine `floruspocus.ca` connecté (Settings → Domains)
- [ ] DNS Cloudflare configuré (nuage gris)
- [ ] Supabase Auth URL mise à jour → `https://floruspocus.ca`

### DNS Cloudflare — à faire
| Type | Nom | Valeur | Proxy |
|------|-----|--------|-------|
| A | `@` | `76.76.21.21` | Nuage GRIS (DNS only) |
| CNAME | `www` | `cname.vercel-dns.com` | Nuage GRIS (DNS only) |

**Important :** proxy Cloudflare = OFF (nuage gris) — Vercel gère SSL/CDN.

### Variables d'env Vercel (configurées)
```
NEXT_PUBLIC_SUPABASE_URL=https://msxyptzedflnfbtbvrwi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[configurée]
SUPABASE_SERVICE_ROLE_KEY=[configurée — Sensitive]
NEXT_PUBLIC_SITE_URL=https://floruspocus.ca
NEXT_PUBLIC_SQUARE_APP_ID=placeholder
SQUARE_SECRET_API_KEY=placeholder       ← Sensitive
```

### Problèmes résolus (historique)
- Email git corrompu (`deeplink@p34k.compeakafeller@me.com`) → corrigé : `git config user.email "peakafeller@me.com"`
- Vercel Authentication activé → bloquait les auto-deploys → désactivé
- Email `peakafeller@me.com` non vérifié sur GitHub → ajouté et vérifié → résolu
- `Instagram` + `Linkedin` absents de lucide-react v1.16 → build fail → corrigé avec SVG inline
- **Login admin cassé (2026-05-26)** — `NEXT_PUBLIC_SUPABASE_ANON_KEY` corrompue sur Vercel (clé doublée avec retours chariot, possiblement causé par le downgrade Pro→Hobby). Corrigé via `extractJwt()` dans le code.

### Note importante — lucide-react v1.16
Les icônes `Instagram` et `Linkedin` n'existent pas dans cette version.
Toujours utiliser des **SVG inline** pour les logos de réseaux sociaux.

### Note importante — Clés Supabase corrompues sur Vercel
Les variables `NEXT_PUBLIC_SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` sur le compte Vercel `info@floruspocus.com` contiennent des retours chariot (clé doublée → 5 segments JWT au lieu de 3).

**Fix en place :** `extractJwt()` dans `supabase-server.ts`, `supabase.ts`, `proxy.ts` et `auth.ts` reconstruit la bonne clé : `parts[0].parts[1].parts[4]`.

**À corriger proprement un jour :** aller sur Vercel → Settings → Environment Variables → supprimer et recoller les clés proprement (une seule ligne, pas de retour chariot). Les clés correctes sont dans `.env.local`.

### Note importante — Compte Vercel CLI
- CLI `npx vercel` connecté au compte **p34kpk** (Sébastien Hamel — compte personnel)
- Le vrai projet déployé est sur le compte **info@floruspocus.com** (FlorusPocus Hobby)
- Les `vercel env add` via CLI vont au mauvais compte — ne pas utiliser pour gérer les env vars de prod
- Pour gérer les env vars : aller directement sur vercel.com → compte `info@floruspocus.com`

---

## 11. Identifiants admin (dev)

- **Email :** info@floruspocus.com
- **Mot de passe :** FlorusPocus2026!
- **URL admin :** http://localhost:3000/admin (dev) / https://floruspocus.ca/admin (prod)

---

## 12. Dépendances principales

```json
{
  "next": "16.x",
  "react": "19.x",
  "@supabase/supabase-js": "^2.x",
  "@supabase/ssr": "^0.x",
  "framer-motion": "^12.x",
  "lucide-react": "^0.x",
  "sanitize-html": "^2.x",
  "zod": "^4.x"
}
```

**Polices Google (next/font) :**
- `Cormorant_Garamond` → heading + body + display (weights 300/400/700, normal)
- `DM_Sans` → font-ui (weights 400/500/600/700)
- `Inter` → chargé mais non utilisé comme font principale (conservé au cas où)
