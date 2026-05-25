# FlorusPocus — Contexte complet du projet

---

## 1. Vue d'ensemble

**Nom du projet :** Florus Pocus
**Type :** Site e-commerce + panel admin
**Stack :** Next.js 16, TypeScript, Tailwind v4, Supabase, Square Payments (à venir)
**Serveur local :** `npm run dev` → http://localhost:3000
**Déploiement :** Vercel (WHC abandonné)
**Dernière session :** 2026-05-24

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
- [ ] **Déploiement Vercel** ← NOUVEAU PLAN (WHC abandonné)
  - Repo GitHub : https://github.com/P34KPK/florus_pocus.git ✅ (pushé 2026-05-22)
  - Étape suivante : vercel.com → "Add New Project" → importer `P34KPK/florus_pocus`
  - Ajouter les variables d'env dans le dashboard Vercel (voir section 9)
  - Connecter domaine `floruspocus.ca` (Cloudflare DNS → mode "DNS only" / nuage gris)
  - Après déploiement : ajouter `https://floruspocus.ca` dans Supabase Auth URL Configuration
- [ ] **Square paiement** — en attente des credentials du client
  - Square Web Payments SDK sur `/checkout`
  - Webhook pour confirmer paiements

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
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SQUARE_APP_ID=
NEXT_PUBLIC_SITE_URL=https://floruspocus.ca

# SERVEUR UNIQUEMENT
SUPABASE_SERVICE_ROLE_KEY=
SQUARE_SECRET_API_KEY=
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

### Typographie — 3 polices
| Variable CSS | Police | Usage |
|---|---|---|
| `--font-heading` / `font-heading` | **DM Sans** | Titres de section, boutons, labels |
| `--font-body` / `font-body` | **Inter** | Corps de texte, paragraphes |
| `--font-display` / `font-display` | **Cormorant Garamond** | Grands titres hero, prix, titres éditoriaux |

- Cormorant chargé via `next/font/google`, weights 400/500/600/700, normal (PAS italic)
- Tailles : H1 hero `clamp(2.8rem, 8vw, 6.5rem)` | H2 sections `clamp(2.4rem, 5vw, 4rem)` | Body `1rem`

### Z-index hierarchy
```
BotanicalLayers (fixed) : z-index 1
Toutes les sections     : z-index 2  (backdrop-filter blur 24px)
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
├── next.config.ts               ← headers sécurité, remotePatterns Supabase
├── contexte.md                  ← CE FICHIER — point de reprise
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql   ← schéma + RLS + seed
│       ├── 002_storage.sql          ← bucket floruspocus (Storage)
│       └── 003_contact_messages.sql ← table contact_messages
└── src/
    ├── app/
    │   ├── globals.css              ← @theme Tailwind v4, animations
    │   │                               section-padding = py-20 (mobile) / py-28 (desktop)
    │   ├── layout.tsx               ← root layout (fonts + CartProvider)
    │   ├── (public)/                ← route group — layout partagé (BotanicalLayers+Navbar+Footer+CartDrawer)
    │   │   ├── layout.tsx           ← shell public partagé
    │   │   ├── page.tsx             ← / homepage : Hero + WhyLocal + BlogPreview
    │   │   ├── abonnements/
    │   │   │   └── page.tsx         ← /abonnements — fetch subscriptions + dropoff_points
    │   │   ├── autocueillette/
    │   │   │   └── page.tsx         ← /autocueillette — fetch events (futures dates)
    │   │   ├── boutique/
    │   │   │   └── page.tsx         ← /boutique — fetch products (fleurs + transformés)
    │   │   ├── la-ferme/
    │   │   │   └── page.tsx         ← /la-ferme — fetch page slug=farm
    │   │   ├── contact/
    │   │   │   └── page.tsx         ← /contact — fetch page slug=contact
    │   │   └── blog/
    │   │       ├── page.tsx         ← /blog — listing magazine
    │   │       └── [slug]/
    │   │           ├── page.tsx     ← /blog/[slug] — article + sanitize-html
    │   │           └── not-found.tsx
    │   ├── checkout/
    │   │   └── page.tsx             ← /checkout — Client Component, pas de Navbar (flow isolé)
    │   ├── api/
    │   │   ├── auth/signout/route.ts ← POST → signOut + redirect
    │   │   ├── upload/route.ts       ← upload Supabase Storage (admin only)
    │   │   ├── pages/route.ts
    │   │   ├── products/route.ts
    │   │   ├── subscriptions/route.ts
    │   │   ├── events/route.ts
    │   │   └── blog/route.ts
    │   └── admin/
    │       ├── login/page.tsx
    │       └── (protected)/
    │           ├── layout.tsx        ← auth check + sidebar
    │           ├── page.tsx          ← dashboard (vraies données)
    │           ├── produits/
    │           ├── abonnements/
    │           ├── autocueillette/
    │           ├── pages/
    │           ├── blog/
    │           ├── commandes/
    │           ├── stats/
    │           └── parametres/
    ├── components/
    │   ├── Navbar.tsx               ← usePathname, multi-pages, dark = scrolled || !isHomepage
    │   │                               navVisible = !isHomepage par défaut, hero-curtain ignoré hors /
    │   ├── Footer.tsx
    │   ├── CartDrawer.tsx
    │   ├── BotanicalLayers.tsx
    │   ├── BranchDivider.tsx
    │   ├── GrowingStem.tsx
    │   ├── ParallaxPetals.tsx       ← max 5 mobile + reduced-motion
    │   ├── LeafTrail.tsx
    │   └── sections/
    │       ├── Hero.tsx             ← boutons → Link /abonnements + /autocueillette
    │       ├── WhyLocal.tsx         ← CTA → Link /la-ferme
    │       ├── Subscriptions.tsx    ← BouquetGauge SVG (arc 270°)
    │       ├── Autocueillette.tsx
    │       ├── Fleuristes.tsx       ← FlowerPlaceholder SVG
    │       ├── TransformedProducts.tsx
    │       ├── BlogPreview.tsx
    │       ├── Farm.tsx             ← CTA → Link /contact
    │       └── Contact.tsx          ← useActionState + Server Action
    ├── context/
    │   └── CartContext.tsx          ← React Context + localStorage
    ├── lib/
    │   ├── supabase-server.ts       ← createClient + createAdminClient
    │   └── actions/
    │       ├── auth.ts              ← loginAdmin Server Action
    │       ├── contact.ts           ← sendContactMessage Server Action
    │       ├── checkout.ts          ← createOrder Server Action
    │       ├── pages.ts
    │       ├── products.ts
    │       ├── blog.ts
    │       ├── subscriptions.ts
    │       └── events.ts
    └── types/
        └── index.ts
```

---

## 7. Base de données (Supabase PostgreSQL)

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

## 8. Notes techniques critiques

### supabase-server.ts — IMPORTANT
```ts
// createClient() → @supabase/ssr → lit les cookies → session utilisateur
// createAdminClient() → @supabase/supabase-js → service role → bypass RLS
// NE PAS utiliser createServerClient() avec service_role_key → cause infinite recursion RLS
export function createAdminClient() {
  return createSupabaseClient(URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}
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
- Logo : `/public/images/fp_logo.png` (z-30, toujours au-dessus)

### Navbar
- Desktop : toujours visible (pas de `opacity-0` au scroll — bug corrigé)
- Mobile : burger toujours visible, font-size `clamp(1.25rem, 5vw, 1.75rem)`
- Fond blanc/blur uniquement après `scrollY > 40` (ou toujours sur les pages sans Hero)
- **Sur `/` (homepage)** : cachée jusqu'à l'événement `hero-curtain` → délai 800ms → slide-down spring (`stiffness:120, damping:20`)
- **Sur toutes les autres pages** : `navVisible = true` immédiatement, `hero-curtain` ignoré
- Couleurs : `dark = scrolled || !isHomepage` — texte sombre + fond blanc dès le chargement hors homepage
- Menu mobile se ferme automatiquement à chaque navigation (`useEffect([pathname])`)

### Checkout
- Client Component (lit le CartContext)
- Server Action `createOrder` → insert `orders` + `order_items` via service role
- Message "Square en cours d'intégration" affiché

### Hydration
- JAMAIS `Math.random()` en SSR → hydration mismatch
- Données placeholder avec valeurs fixes

### Tailwind v4
- Config dans `globals.css` avec `@theme {}`
- Pas de `tailwind.config.js`
- Classes custom : `font-heading`, `font-body`, `font-display`, `section-padding`

### Safari mobile
- Utiliser `100svh` (small viewport height) plutôt que `100vh`

---

## 9. Déploiement — Vercel + Cloudflare DNS

> WHC abandonné. Nouvelle stratégie : Vercel (gratuit) + domaine Cloudflare.

### Repo GitHub
- URL : https://github.com/P34KPK/florus_pocus.git
- Branch : `main`
- Pushé le 2026-05-22 (87 fichiers, tout le site)

### Étapes Vercel (à compléter)
1. vercel.com → "Add New Project" → importer `P34KPK/florus_pocus`
2. Framework : Next.js (auto-détecté, ne pas changer)
3. Ajouter les variables d'environnement (voir ci-dessous)
4. Cliquer "Deploy" → URL temporaire `floruspocus.vercel.app`
5. Settings → Domains → ajouter `floruspocus.ca`

### Variables d'env dans le dashboard Vercel
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SQUARE_APP_ID=          ← laisser vide pour l'instant
NEXT_PUBLIC_SITE_URL=https://floruspocus.ca
SUPABASE_SERVICE_ROLE_KEY=
SQUARE_SECRET_API_KEY=              ← laisser vide pour l'instant
NODE_ENV=production
```

### DNS Cloudflare (après déploiement Vercel)
| Type | Nom | Valeur | Proxy |
|------|-----|--------|-------|
| A | `@` | `76.76.21.21` | Nuage GRIS (DNS only) |
| CNAME | `www` | `cname.vercel-dns.com` | Nuage GRIS (DNS only) |

**Important :** proxy Cloudflare = OFF (nuage gris) — Vercel gère lui-même SSL/CDN.

### Supabase après déploiement
Aller dans Supabase → Authentication → URL Configuration :
- Site URL : `https://floruspocus.ca`
- Redirect URLs : `https://floruspocus.ca/**`

### Coûts
| Service | Plan | Coût |
|---------|------|------|
| Vercel | Hobby | Gratuit |
| Supabase | Free | Gratuit |
| Cloudflare | Free | Gratuit |

### Statut déploiement
- [x] Repo GitHub créé et pushé
- [ ] Projet importé sur Vercel
- [ ] Variables d'env ajoutées sur Vercel
- [ ] Premier build réussi
- [ ] Domaine `floruspocus.ca` connecté sur Vercel
- [ ] DNS Cloudflare configuré (nuage gris)
- [ ] SSL actif (auto via Vercel)
- [ ] Supabase Auth URL mise à jour

### Checklist avant mise en production
- [ ] `npm audit` = 0 critiques
- [ ] RLS activé sur toutes les tables Supabase
- [ ] `.env.local` hors du repo (vérifier `.gitignore`) ✅
- [ ] HTTPS activé (auto Vercel)
- [ ] Test login/logout admin
- [ ] Test formulaire contact
- [ ] Test ajout au panier + checkout
- [ ] Backup Supabase activé
- [ ] Test Square sandbox (quand credentials disponibles)

---

## 10. Identifiants admin (dev)

- **Email :** info@floruspocus.com
- **Mot de passe :** FlorusPocus2026!
- **URL admin :** http://localhost:3000/admin (dev) / https://floruspocus.ca/admin (prod)

---

## 11. Dépendances principales

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
- `DM_Sans` → `font-heading`
- `Inter` → `font-body`
- `Cormorant_Garamond` → `font-display` (weights 400-700, normal seulement)
