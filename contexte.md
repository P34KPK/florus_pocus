# FlorusPocus — Contexte complet du projet

---

## 1. Vue d'ensemble

**Nom du projet :** Florus Pocus
**Type :** Site e-commerce + panel admin
**Stack :** Next.js 16, TypeScript, Tailwind v4, Supabase, Square Payments
**Serveur local :** `npm run dev` → http://localhost:3000
**Déploiement :** Vercel (compte FlorusPocus Hobby — `info@floruspocus.com`)
**Domaine production :** https://www.floruspocus.com
**Dernière session :** 2026-08-16 (session 15 — réparation du tunnel d'achat : le site était invendable)
**Migrations appliquées en prod :** jusqu'à `025` incluse (aucune nouvelle migration en session 15)
**Derniers commits :** `1cea9af` (tunnel d'achat réparé — session 15) · `d2661bb` (messages non lus hiérarchisés) · `553d1a5` (taxes/livraison + notifications)
**⚠️ `1cea9af` est commité mais PAS ENCORE POUSSÉ** — la production tourne donc toujours sur le code cassé. `git push` déclenche l'auto-deploy Vercel.
**Build id en prod après `d2661bb` :** `gNOG2Mt824wjCLxPtMn0k` (à revérifier après le push de `1cea9af`)

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
- [x] Abonnements — modèle packs saisonniers (migration 012) : prix global saison + `bouquets_count`, plus de fréquences (1x/2x/4x retiré). Cartes affichent "X$ / saison / Y bouquets inclus". "Annulation facile" retiré.
- [x] Produits sur devis (migration 013) : colonne `price_type TEXT ('fixed'|'devis')`. Produits "devis" affichent badge "Sur devis" + bouton "Obtenir un prix" → `/contact?produit=NOM`. Le champ prix masqué dans l'admin en mode devis.
- [x] Page détail produit `/boutique/[id]` — grande photo, description complète, prix ou bouton devis, produits suggérés. Cartes boutique entièrement cliquables (pattern overlay link — bouton panier reste fonctionnel).
- [x] Page Mange Moi — header éditable depuis admin (migration 011, slug `mange-moi` dans pages)
- [x] Galerie multi-photos par produit (max 5) — migration 019, `product_images` table, `ProductForm.tsx` reécrit, `ProductGallery.tsx` (client component, miniatures cliquables), fallback image unique pour anciens produits
- [x] Analytics de visites temps réel — migration 020, table `page_views` (no PII, Loi 25 conforme), composant `Analytics.tsx` (sendBeacon), route `/api/track` (Zod + rate limit 120/min), stats page : sections ventes Phase 3 conservées EN HAUT + nouvelles sections visites réelles EN BAS (KPI today/7j/30j, graphique 14j CSS, top 10 pages)
- [x] Audit dashboard 4 réparations : `await` inutile retiré (commandes), revenus excluent `round_up_amount`, carte "Abonnements actifs" → "Abonnés infolettre" (vrai count), stats page corrigée
- [x] Fix catalogue fleuristes (session 10) : `/fleuristes` affiche les produits `florist_only` **OU** ayant un `florist_price` (avant : `florist_only` seul → produits avec prix de gros invisibles). Cartes du catalogue (liste + grille) cliquables vers `/boutique/[id]` via overlay Link (galerie multi-photos + description complète). ⚠️ La fiche produit affiche le prix **public**, pas le prix de gros (page partagée — non résolu, en attente retour client)
- [x] **Session 11 — 10 correctifs clients :**
  - Blog : fix publication (TipTap v3 breaking change — `useEditor` ne re-render plus React sur frappe → `useState` + `onUpdate` pour tracker le HTML dans le hidden input)
  - Téléphone obligatoire sur formulaire contact et caisse (regex `+?[\d\s\-().]{7,20}`, max 50)
  - Adresse de livraison éclatée : Adresse / Ville / Province (select 13 provinces) / Code postal avec validation format canadien
  - Choix Ramassage / Livraison locale à la caisse (migration 021) — toggle UI avec icônes, adresse ferme affichée en ramassage, disclaimer "fleurs fraîches ne se livrent pas par la poste"
  - Mange Moi : texte hardcodé "Catalogue vitrine…" retiré de l'admin, items cliquables (page `/mange-moi/[id]` créée), intro éditable via Admin → Pages → Mange Moi
  - Admin messages : numéro de téléphone affiché (lien `tel:`), interface `ContactMessage` mise à jour
  - Resend : erreur loguée explicitement (SDK ne throw pas, retourne `{ error }` — maintenant capturé)
  - Mise en page blog/boutique : `.prose-farm` corrigé (`overflow-wrap: anywhere`, `word-break`, `max-width: 100%`) + pages boutique/[id] idem
  - Produits admin : tri alphabétique par `name` (était `created_at DESC`)
  - Crédit P34K : footer, lien cliquable → p34k.com, logo SVG inliné couleur terracotta `#D4A574`, taille 19px
- [x] **Session 12 — Refonte boutique + livraison :**
  - Navbar : liens desktop grossis (`text-sm` → `text-[15px] font-semibold`)
  - `BoutiqueShop.tsx` (nouveau composant) : remplace les deux sections séparées (Fleuristes + TransformedProducts) par un layout sidebar gauche + grille droite — un seul filtre vertical par catégorie (`season`), badge livraison dans le header
  - `boutique/page.tsx` : simplifié — passe tous les produits publics (`!florist_only`) à `BoutiqueShop`, plus de `BranchDivider` ni de split fleurs/transformés
  - `CartDrawer.tsx` : bannière livraison dynamique entre le total et le bouton commander (affiche "Gratuite ✓" dès 100$, "9,99 $" en dessous)
  - Mobile boutique : barre filtres scrollable horizontale (une ligne, glissable au doigt), badge livraison compact, vue liste adaptée petit écran
  - Fix mobile : badge "Sur devis" + bouton "Obtenir un prix" déformés sur cartes 2 colonnes → `flex-col` avec `self-start` + `whitespace-nowrap`
  - `Fleuristes.tsx` et `TransformedProducts.tsx` conservés intacts (non utilisés sur boutique mais présents)
- [x] **Session 13 — Image Optimization Vercel désactivée :**
  - Alerte Vercel : 75 % du free tier Image Optimization (5 000 transformations/mois) consommé
  - `next.config.ts` → `images.unoptimized: true` — Vercel sert les images directement, **0 transformation facturable, pour toujours**
  - Sans risque visuel : les images sont déjà optimisées à l'upload (Sharp → WebP, 1920px, qualité 80)
  - Compromis mineur : mobile télécharge la pleine taille (1920px) au lieu d'une version redimensionnée
  - Commit `c25a96a` poussé sur `main`

- [x] **Session 14 — Audit du tunnel de commande (suite à une commande fleuriste « disparue ») :**
  - **Constat de l'enquête** : 1 seule commande en base (test du 31 mai, `pending`) et **0 paiement sur 86 dans Square provenant du site** (aucun `reference_id`). La cliente n'a jamais été débitée ; aucune commande web n'a jamais abouti.
  - **Cause de l'absence de notification** : il n'existait **aucun** courriel de commande vers l'admin. Ajout de `src/lib/emails/orderNotification.ts` (bon de travail : client, mode de réception, adresse, note, articles, total, badge FLEURISTE, lien admin).
  - **Courriels fiabilisés** : `src/lib/orderEmails.ts` centralise l'envoi. Lecture du `{ error }` de Resend (il ne throw jamais — même bug qu'en session 11, jamais reporté sur les routes de commande). Erreurs journalisées ET écrites dans `orders.email_error`.
  - **Webhook redevenu un filet de secours** : il ne pouvait plus jamais envoyer de courriel (la route de paiement avait déjà passé `payment_status` à `completed`, donc son `.eq("payment_status","pending")` ne retournait aucune ligne). Il appelle désormais `sendOrderEmails()` systématiquement ; l'idempotence vient de `orders.emails_sent_at`.
  - **Faille de prix corrigée** : `createOrder` recalcule tous les prix depuis la base (les prix du panier navigateur étaient acceptés tels quels — on pouvait payer 0,01 $). Prix de gros appliqués seulement si le cookie fleuriste est valide côté serveur. Refus des produits inactifs, `devis` et `stock = 0`.
  - **Montant encaissé** : la route de paiement charge `orders.total_amount` (base), plus le montant envoyé par le navigateur. En cas d'écart → 409 « panier périmé » au lieu de débiter une autre somme.
  - Garde-fou mort réparé : `payment_status === "paid"` → `"completed"` (l'enum ne contient pas `"paid"`, le test anti-double-paiement n'a jamais fonctionné).
  - Bouton « Payer » muet corrigé : si le SDK Square n'est pas chargé, un message s'affiche au lieu d'un `return` silencieux.
  - Migration `022_orders_email_tracking.sql` + `scripts/verify-orders-pipeline.mjs` (vérificateur lecture seule).
  - **Suivi d'inventaire explicite (migration 023)** : enquête sur les 39 produits « Épuisé » → tous de catégorie `fleur`, tous créés le 2026-06-08, 38 sur 39 jamais rouverts depuis. Ce n'était pas un choix maintenu mais une saisie initiale périmée. Ajout de `track_inventory` + `src/lib/inventory.ts` (`isSoldOut` / `lowStockCount`) + interrupteur admin. Remplissage : les 39 repassent en « toujours disponible » et redeviennent commandables.
  - **Taxes et livraison (migration 024)** : TPS 5 % + TVQ 9,975 % et frais de livraison sont désormais facturés. `src/lib/pricing.ts` est le module de calcul partagé serveur/client. Ventilation stockée sur chaque commande (`subtotal`, `delivery_fee`, `gst_amount`, `qst_amount`), affichée à la caisse, dans les deux courriels, dans le détail admin et l'export CSV (5 colonnes de plus). Réglages éditables via Admin → Contenu (groupe « Taxes et livraison »). Contrôle : 20 $ au ramassage → 23,00 $, exactement les montants du terminal Square.
  - **Cloche de notifications admin (migration 025)** : barre supérieure dans `admin/(protected)/layout.tsx`. Notifications **dérivées** des données existantes — aucune table de notifications, aucun déclencheur : une notification disparaît d'elle-même quand la situation est réglée. Deux natures : `action` (à faire, compte tant que non réglé) et `event` (activité, lu après ouverture). Sources : numéros TPS/TVQ manquants, courriels de commande en échec, commandes payées à préparer, messages de contact non lus, nouvelles commandes, nouveaux abonnés.
  - **Messages non lus détaillés un par un** (pas de compteur agrégé, qui se survole trop facilement) : titre « Message de X — sans réponse depuis N jours », extrait de 130 caractères, tri du plus ancien au plus récent. Gravité montante avec l'attente : `info` (< 2 j) → `warning` (2-6 j) → `danger` (≥ 7 j), de sorte qu'une demande qui traîne remonte seule au-dessus des alertes de configuration. Déclencheur : la demande de Marianne Pertuiset-Ferland (fleurs pour un mariage) était non lue depuis 47 jours.

  **Vérifications faites en production (sans accès Vercel) :**
  - Code serveur déployé : les fiches produits de fleurs à `stock = 0` renvoient le bouton d'ajout au lieu de « Épuisé ».
  - Espace fleuristes : **60 / 60 produits commandables** (21 / 60 avant), fleurs coupées 50 / 50.
  - Cloche simulée sur les données réelles : pastille à 7 — alerte numéros TPS/TVQ + 3 messages non lus + activité.
  - ⚠️ **3 messages de contact jamais ouverts**, dont Marianne Pertuiset-Ferland (28 juin) qui demandait des fleurs pour son mariage du 6 septembre. La cloche les remonte désormais.
  - Déploiement de `d2661bb` confirmé par le changement d'identifiant de build (`bPQDZdOEQ9DUJYdUprnSs` → `gNOG2Mt824wjCLxPtMn0k`) et la santé des routes (`/`, `/boutique`, `/checkout` en 200 ; `/admin` en 307).
  - ❗ Reste non vérifiable sans une vraie commande : l'envoi effectif des courriels (`RESEND_API_KEY` en prod, réponse de Resend). Diagnostic après le premier achat : `node scripts/verify-orders-pipeline.mjs`.
  - ❗ **L'affichage de la cloche n'est pas sondable de l'extérieur** : son code n'est servi qu'aux pages admin authentifiées. Ce qui a été vérifié, c'est sa logique exécutée contre la base de production (pastille à 6, bon ordre, bons libellés), pas le rendu à l'écran.

- [x] **Session 15 — Le site était invendable (deux régressions de la session 14) :**
  - **Symptôme** : impossible d'acheter quoi que ce soit. Deux commandes créées le 2026-08-16 à 21:04 et 21:05 UTC (Calendula, 11,50 $) restées `pending`/`pending`, **sans aucun paiement correspondant chez Square** (les 3 paiements du jour venaient du terminal, sans `reference_id`).
  - **Cause 1 — inventaire.** `createOrder` refusait sur `p.stock === 0` **sans regarder `track_inventory`**. La session 14 avait branché `isSoldOut()` sur les 6 points d'**affichage** mais jamais sur la seule fonction qui **encaisse**. La boutique affichait le produit comme disponible, la caisse répondait « est épuisé. Retirez-le de votre panier », sans issue. **24 des 53 produits affichés comme achetables.**
  - **Cause 2 — prix fleuriste.** `/boutique/[id]` et `BoutiqueShop` mettaient toujours le **prix public** au panier, alors que `createOrder` applique le **prix de gros** dès que le cookie `fp_florist` est valide. `CheckoutClient` détectait l'écart de total et **abandonnait avant de débiter** (garde-fou correct, sur un écart fabriqué par le site lui-même). C'est exactement la « limite connue » notée en session 10, devenue bloquante depuis que la session 14 recalcule les prix côté serveur. **46 des 53 produits, pour quiconque a le cookie fleuriste** (30 jours — le testeur l'avait).
  - **Bilan avant correctif** : 29 produits sur 79 achetables par un client ordinaire, **7 sur 79** avec le cookie fleuriste.
  - **Correctifs** : `effectiveUnitPrice()` dans `pricing.ts` (règle de prix unique) ; `isSoldOut()` enfin utilisé par `createOrder` ; `quoteCart()` — la caisse demande son total au serveur au lieu de l'additionner depuis le `localStorage` ; un paiement refusé marque `payment_status = 'failed'` ; le `.json()` de la réponse de paiement est protégé (un 500 renvoie du HTML et figeait le bouton sur « Traitement… » sans message).
  - **Commandes fantômes** : les 2 commandes orphelines du 16 août supprimées via `scripts/cleanup-ghost-orders.mjs` (garde-fou : refuse toute commande portant une trace de paiement ou de courriel). Il reste la commande de test du 31 mai.

  **Vérifications faites (aucun paiement déclenché) :**
  - `node scripts/verify-purchase-flow.mjs` — **0 produit refusé** sur les 53 affichés comme achetables (24 avant) ; **24/24** prix affichés identiques aux prix facturés, en public comme en fleuriste, lus sur le rendu serveur réel.
  - `node scripts/verify-checkout-quote.mjs` — `quoteCart` **appelée pour de vrai** via le protocole Server Actions sur un build de production : prix public (12 → 13,80 $), prix de gros par cookie (10 → 11,50 $), livraison 9,99 $ et gratuité dès 100 $, arrondi non taxé, et acceptation d'un produit à stock 0 non suivi (Tournesol 20 $ → **23,00 $**, le chiffre de contrôle du terminal Square).
  - ❗ **Le débit Square reste non testé** — impossible sans un vrai achat (compte du client en production).
  - ❗ **Le rendu de l'écran de caisse n'a pas été vu** (extension Chrome non connectée). Les bonnes données arrivent, prouvé côté serveur ; l'affichage React de ces données reste à confirmer d'un coup d'œil.

### Square paiement (production)
- [x] SDK Square installé (`square`)
- [x] `src/lib/square.ts` — `SquareClient` + `SquareEnvironment`
- [x] `src/app/checkout/page.tsx` — Square Web Payments SDK
- [x] `src/app/api/square/payment/route.ts` — charge carte, validation montant, idempotency key = orderId
- [x] `src/app/api/square/webhook/route.ts` — HMAC SHA256, gère payment.updated/created/completed/failed + appelle `sendOrderEmails()` (filet de secours idempotent)
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
- [x] Migration `011_mange_moi_page.sql` — slug `mange-moi` ajouté au CHECK constraint de pages
- [x] Migration `012_subscriptions_bouquets_count.sql` — colonne bouquets_count INTEGER sur subscriptions
- [x] Migration `013_product_price_type.sql` — colonne price_type TEXT ('fixed'|'devis') sur products
- [x] Migration `014_newsletter_contact_phone.sql` — table newsletter_subscribers + colonne telephone sur contact_messages
- [x] Migration `015_orders_round_up.sql` — colonne round_up_amount NUMERIC(10,2) sur orders
- [x] Migration `016_round_up_cause_setting.sql` — setting `round_up_cause_name` dans site_settings (groupe boutique)
- [x] Migration `019_product_images.sql` — table `product_images` (id, product_id FK cascade, image_url, sort_order, created_at), RLS public read, écriture service_role
- [x] Migration `020_page_views.sql` — table `page_views` (id BIGSERIAL, path, referrer, created_at), pas de PII, 2 index (created_at, path), RLS activé sans policy publique (service_role uniquement)
- [x] Migration `021_orders_delivery.sql` — 4 colonnes sur `orders` : `delivery_method TEXT NOT NULL DEFAULT 'delivery' CHECK (IN ('pickup','delivery'))`, `customer_city`, `customer_province`, `customer_postal_code`
- [x] Migration `025_admin_notifications.sql` — table `admin_notification_reads` (user_id PK, last_seen_at) — RLS activée, service_role uniquement
- [x] Migration `024_orders_taxes_delivery.sql` — 4 colonnes sur `orders` (`subtotal`, `delivery_fee`, `gst_amount`, `qst_amount`) + 7 réglages `site_settings` (groupe `taxes_livraison`)
- [x] Migration `023_product_track_inventory.sql` — colonne `track_inventory BOOLEAN NOT NULL DEFAULT false` sur `products` + remplissage (`true` si `stock > 0`, `false` si `stock` NULL ou 0)
- [x] Migration `022_orders_email_tracking.sql` — 3 colonnes sur `orders` : `is_florist_order BOOLEAN NOT NULL DEFAULT false`, `emails_sent_at TIMESTAMPTZ` (verrou d'idempotence des courriels), `email_error TEXT` + index partiel `idx_orders_emails_pending`
- [x] Popup infolettre boutique — apparaît 2.5s après visite (localStorage `fp_newsletter_shown`), code promo BIENVENUE10
- [x] Formulaire contact — champ téléphone optionnel + case "s'inscrire à l'infolettre"
- [x] Bandeau cookie consent (Loi 25 Québec) — toutes les pages publiques, localStorage `fp_cookie_consent`
- [x] Carte Google Maps interactive dans la section Contact (remplace le placeholder "à venir")
- [x] Lien blog "Découvrir nos fleurs" → /boutique (était /)
- [x] Round-up pour la cause à la caisse — toggle optionnel arrondi au dollar sup., montant sauvegardé sur commande
- [x] Nom de la cause configurable : Admin → Contenu → Boutique & Caisse (setting `round_up_cause_name`)
- [x] Audit éditabilité : 5 titres de sections éditables via Admin → Contenu → Boutique & Caisse (migration 018)
  - `blog_section_title` — "Histoires de la ferme" (accueil)
  - `fleurs_titre` — "Fleurs coupées fraîches" (boutique)
  - `produits_titre` — "Nos créations" (boutique)
  - `produits_surtitle` — "Artisanat floral" (boutique)
  - Contact h2 → lit `page.title` (Admin → Pages → Contact)
- [x] Audit revalidation : settings.ts invalide maintenant /boutique /contact /la-ferme /fleuristes /mange-moi /checkout (changements CMS immédiats sur toutes les pages)

---

## 3. CE QUI RESTE À FAIRE 🔲

> **Périmètre.** Cette liste ne contient que du travail technique. Les demandes de
> clientèle (devis, mariages, réponses aux messages de contact) ne relèvent pas du
> développement : la cloche de notifications les remonte au propriétaire du site,
> qui en dispose comme il l'entend. Ne pas les recopier ici ni les faire remonter
> en session — le mécanisme est en place, c'est tout ce qui était demandé.

- [x] ~~Clés Supabase corrompues~~ — RÉGLÉ : clés ANON + SERVICE recollées proprement dans Vercel, contournement `extractJwt` retiré du code
- [x] ~~Sitemap + SEO~~ — FAIT : `app/sitemap.ts` (statiques + blog), `app/robots.ts`, metadataBase, openGraph/twitter, canonical par page
- [ ] **Contenu réel** — photos produits + articles blog (client le fait via admin)
- [x] ~~Taxes TPS/TVQ~~ — FAIT session 14 (migration 024, `src/lib/pricing.ts`)
- [x] ~~Frais de livraison jamais facturés~~ — FAIT session 14 (mêmes réglages partout, plus rien en dur)
- [x] ~~39 produits bloqués « Épuisé »~~ — FAIT session 14 (migration 023, `track_inventory`)
- [ ] **Numéros de TPS et TVQ à saisir par le client** — Admin → Contenu → Taxes et livraison. La cloche le lui rappelle automatiquement, aucune relance à faire.
- [ ] 🔴 **Pousser `1cea9af`** — le correctif du tunnel d'achat est commité mais pas poussé. **Tant que ce n'est pas fait, la production reste invendable.**
- [ ] **Confirmer l'écran de caisse à l'œil** — ajouter un article, aller à `/checkout`, vérifier que le total s'affiche et que le bouton s'active. S'arrêter là, sans payer. C'est le seul point du correctif de session 15 qui n'a pas été vu à l'écran.
- [x] ~~Impossible d'acheter (inventaire + prix fleuriste)~~ — FAIT session 15 (`1cea9af`)
- [ ] **Premier vrai achat à surveiller** — seul test de bout en bout impossible à simuler (Square est en production sur le compte du client). Vérifier que la notification admin arrive ; sinon `node scripts/verify-orders-pipeline.mjs` lit `orders.email_error`.
- [ ] **Gestion stock automatique** — le stock n'est jamais décrémenté à l'achat, c'est un compteur manuel (`track_inventory` rend au moins le blocage visible)
- [ ] `/checkout` n'est pas suivi par les analytics (hors du groupe `(public)`) — aucune visibilité sur les abandons de caisse
- [ ] Cosmétique : les prix s'affichent avec un point (`9.99 $`) et non une virgule. Cohérent dans tout le site, mais non conforme à la typographie française — un formateur unique réglerait le tout.

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
│   ├── 009_mange_moi.sql
│   ├── 010_florist_only.sql
│   ├── 011_mange_moi_page.sql
│   ├── 012_subscriptions_bouquets_count.sql
│   ├── 013_product_price_type.sql
│   ├── 014_newsletter_contact_phone.sql
│   ├── 015_orders_round_up.sql
│   ├── 016_round_up_cause_setting.sql
│   ├── 017_boutique_subtitle.sql
│   ├── 018_section_titles.sql
│   ├── 019_product_images.sql
│   ├── 020_page_views.sql
│   ├── 021_orders_delivery.sql
│   ├── 022_orders_email_tracking.sql
│   ├── 023_product_track_inventory.sql
│   ├── 024_orders_taxes_delivery.sql
│   └── 025_admin_notifications.sql
├── scripts/
│   ├── reset-admin.mjs
│   ├── verify-orders-pipeline.mjs  ← vérificateur LECTURE SEULE de la chaîne de commande
│   ├── verify-purchase-flow.mjs    ← LECTURE SEULE : règle d'inventaire + prix affiché == prix facturé
│   ├── verify-checkout-quote.mjs   ← LECTURE SEULE : appelle vraiment quoteCart (exige `next build` + `next start`)
│   └── cleanup-ghost-orders.mjs    ← supprime des commandes orphelines (garde-fou anti-paiement), IDs en dur
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
    │   ├── (public)/mange-moi/page.tsx         ← catalogue vitrine comestibles (sans achat)
│   ├── (public)/mange-moi/[id]/page.tsx   ← fiche détail comestible (SSR, generateMetadata, CTA → /contact)
    │   ├── (public)/boutique/[id]/page.tsx       ← fiche produit (SSR, generateMetadata)
    │   ├── (public)/boutique/[id]/AddToCartButton.tsx ← client component bouton panier
    │   ├── (public)/boutique/[id]/ProductGallery.tsx  ← galerie multi-photos (client, miniatures)
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
    │   │   ├── pages/route.ts
    │   │   └── track/route.ts        ← POST analytics (Zod, rate limit 120/min, service_role)
    │   └── admin/
    │       └── (protected)/
    │           ├── contenu/page.tsx   ← CMS global (site_settings)
    │           ├── mange-moi/page.tsx ← CRUD catalogue Mange Moi
    │           └── ...autres pages admin
    ├── components/
    │   ├── Analytics.tsx            ← Client Component silent, sendBeacon + fetch keepalive
    │   ├── CartDrawer.tsx           ← panier + bannière livraison dynamique (9,99$/gratuit 100$)
    │   ├── admin/
    │   │   ├── NotificationBell.tsx          ← cloche + panneau (À faire / Activité récente)
    │   │   ├── blog/RichTextEditor.tsx       ← TipTap WYSIWYG
    │   │   ├── produits/ProductForm.tsx      ← galerie multi-images (max 5, ImageUploader)
    │   │   ├── ImageUploader.tsx             ← + prop onUploadedUrl (callback multi-images)
    │   │   ├── contenu/ContenuClient.tsx
    │   │   └── mange-moi/MangeMoiClient.tsx  ← CRUD catalogue
    │   └── sections/
    │       ├── BoutiqueShop.tsx    ← boutique unifiée (sidebar catégories + grille) — session 12
    │       ├── Fleuristes.tsx      ← conservé, non utilisé sur /boutique depuis session 12
    │       ├── TransformedProducts.tsx ← conservé, non utilisé sur /boutique depuis session 12
    │       ├── FloristGate.tsx     ← formulaire code d'accès fleuristes
    │       ├── FloristCatalog.tsx  ← catalogue pro avec prix de gros
    │       └── (MangeMoi affiché directement dans /mange-moi/page.tsx)
    ├── context/CartContext.tsx  ← Zod validation au rehydrate localStorage
    ├── lib/
    │   ├── pricing.ts           ← computeTotals : taxes + livraison + arrondi (serveur ET caisse)
    │   ├── inventory.ts         ← isSoldOut / lowStockCount (track_inventory)
    │   ├── orderEmails.ts       ← sendOrderEmails : envoi idempotent des 2 courriels de commande
    │   ├── notifications.ts     ← getAdminNotifications : notifications dérivées, sans table
    │   ├── site.ts              ← SITE_URL canonique
    │   ├── supabase-server.ts   ← createClient + createPublicClient + createAdminClient + getSiteSettings + getMangeMoiItems
    │   ├── square.ts            ← SquareClient + SQUARE_LOCATION_ID
    │   ├── resend.ts            ← client Resend
    │   ├── ratelimit.ts         ← Upstash limiteurs
    │   ├── emails/
    │   │   ├── orderConfirmation.ts  ← confirmation client + ventilation fiscale (OrderBreakdown)
    │   │   └── orderNotification.ts  ← notification admin (bon de travail, badge FLEURISTE)
    │   └── actions/
    │       ├── auth.ts          ← loginAdmin avec rate limiting
    │       ├── notifications.ts ← markNotificationsSeen (horodatage de consultation)
    │       ├── checkout.ts      ← createOrder
    │       ├── contact.ts       ← sendContactMessage + notification email admin
    │       ├── settings.ts      ← updateSiteSettings (CMS)
    │       ├── auth-guard.ts    ← assertAdmin() : JWT + is_admin DB (partagé par toutes les actions)
    │       ├── florist.ts       ← verifyFloristCode + isFloristAuthenticated
    │       ├── mangeMoi.ts      ← CRUD mange_moi_items
    │       ├── messages.ts      ← markMessageRead + deleteMessage
    │       └── orders.ts        ← updateOrderStatus (statuts enum stricts)
    └── types/index.ts           ← Product.florist_price + MangeMoiItem + season: string | null + Order delivery fields
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

### ⚠️ Courriels de commande — un seul point d'entrée
`src/lib/orderEmails.ts` → `sendOrderEmails(orderId)` envoie **les deux** courriels (confirmation client + notification admin). Appelée par la route de paiement ET par le webhook Square.
- **Idempotence** : réservation atomique sur `orders.emails_sent_at` (`UPDATE … WHERE emails_sent_at IS NULL RETURNING`). Le premier arrivé envoie, l'autre ressort sans rien faire. C'est ce qui permet au webhook d'être un vrai filet de secours sans créer de doublons.
- **Ne jamais rappeler Resend directement depuis une route de commande** — passer par cette fonction, sinon on reperd le suivi et l'idempotence.
- Resend ne lève **jamais** d'exception : toujours lire le `{ error }` retourné. Les échecs atterrissent dans `orders.email_error`, visible via `node scripts/verify-orders-pipeline.mjs`.
- L'adresse admin vient de `site_settings.contact_email` (repli `info@floruspocus.com`).

### ⚠️ Inventaire — `track_inventory`, jamais `stock === 0` en dur
`src/lib/inventory.ts` est la source unique : `isSoldOut(p)` = `track_inventory && stock === 0`, et `lowStockCount(p)` pour l'avertissement « Plus que N en stock ». **Ne jamais retester `stock === 0` directement** — utiliser ces helpers (6 emplacements : `FloristCatalog`, `BoutiqueShop`, `Fleuristes`, `TransformedProducts`, `boutique/[id]`, `ProductsClient`).
- Pourquoi : `stock` encodait 3 états dans un champ nullable, dont deux quasi identiques à la saisie mais aux effets opposés (vide = illimité, `0` = **invendable**). Diagnostic de session 14 : 39 fiches de fleurs coupées saisies à 0 le 2026-06-08, jamais rouvertes ensuite → tout le catalogue de fleurs était invendable, sans aucun signal.
- Admin : interrupteur « Suivre les quantités / Toujours disponible » dans `ProductForm`. Désactivé (défaut), le champ Quantité disparaît et le produit reste vendable ; activé, `0` signifie vraiment « Épuisé ».
- `products.ts` force `stock = null` quand `track_inventory` est faux — pas de valeur fantôme qui ressurgit si on réactive le suivi.
- La liste admin affiche `∞` (non suivi), la quantité, ou un badge rouge `0 · Épuisé` pour rendre un blocage de vente immédiatement visible.
- Le stock n'est toujours **pas** décrémenté automatiquement à l'achat — c'est un compteur manuel.
- ⚠️ **Leçon de la session 15** : `isSoldOut` avait été branché sur les 6 points d'affichage mais pas sur `createOrder`. La boutique montrait les produits comme disponibles et la caisse les refusait — 24 produits invendables sans message cohérent. **Une règle métier doit être appliquée à l'encaissement AVANT l'affichage**, jamais l'inverse : un affichage faux se voit, un refus à la caisse se subit.

### Diagnostic sans accès Vercel
Le CLI Vercel n'est pas installé et les logs runtime ne sont pas accessibles. Ce qui reste vérifiable :
- `node scripts/verify-orders-pipeline.mjs` — migrations, commandes récentes, état d'envoi des courriels, `email_error`. Lecture seule.
- Supabase via `SUPABASE_SERVICE_ROLE_KEY` (lecture seule) pour l'état réel des données.
- API Square en lecture : `GET /v2/payments` (un paiement issu du site a toujours un `reference_id` ; ceux du terminal n'en ont pas), `GET /v2/webhooks/subscriptions`, `GET /v2/locations`.
- Déploiement confirmé en cherchant une chaîne neuve dans les bundles servis par la prod, et surtout via une page **rendue côté serveur** dont l'affichage dépend du nouveau code.
- Une **action serveur** peut être appelée directement (protocole Server Actions) pour vérifier une logique métier sans passer par le navigateur : POST sur la page, en-tête `Next-Action: <id>`, corps `[<args>]` en JSON. L'identifiant se lit dans les bundles construits (`createServerReference)("<id>"…,"<nom>"`). ⚠️ Uniquement sur `next build` + `next start` — en développement les identifiants diffèrent et la réponse est « Server action not found ». C'est ainsi que `quoteCart` a été prouvée en session 15.

### Notifications admin — dérivées, jamais stockées
`src/lib/notifications.ts` → `getAdminNotifications(userId)`. **Ne pas créer de table de notifications** : tout est recalculé à chaque chargement du layout admin depuis `orders`, `contact_messages`, `newsletter_subscribers` et `site_settings`. Conséquence voulue : rien à marquer comme résolu, rien à remplir a posteriori, aucune désynchronisation.
- Seul l'état « déjà vu » est persisté (`admin_notification_reads.last_seen_at`, un horodatage par admin).
- `kind: "action"` = à faire, compté dans la pastille tant que non réglé (numéros de taxes, courriels en échec, commandes à préparer, messages non lus). `kind: "event"` = activité, compté seulement si postérieur à `last_seen_at`.
- Ajouter une source = ajouter un `items.push(...)` dans ce fichier, rien d'autre.
- Le layout admin ne plante pas si la migration 025 manque : la requête échoue en silence et `lastSeenAt` vaut null.

### ⚠️ Taxes et livraison — un seul module de calcul
`src/lib/pricing.ts` : `computeTotals()` est appelé par `createOrder` (montant encaissé) **et** par `CheckoutClient` (affichage). **Ne jamais recalculer un total ailleurs** — sinon le montant affiché et le montant débité divergent.
- Ordre : sous-total → + livraison → taxes sur la somme → + arrondi pour la cause. Le don n'est jamais taxé, il s'ajoute en dernier.
- Livraison : gratuite au ramassage et dès le seuil (défaut 100 $), sinon `delivery_fee` (défaut 9,99 $).
- Réglages dans `site_settings`, groupe `taxes_livraison` : `taxes_enabled`, `gst_rate`, `qst_rate` (en **pourcentage** : « 5 », « 9.975 »), `gst_number`, `qst_number`, `delivery_fee`, `free_delivery_threshold`. Modifiables sans déploiement via Admin → Contenu.
- `CheckoutClient` envoie `round_up` (booléen) et non plus un montant : le serveur calcule l'arrondi lui-même, après taxes.
- Contrôle : 20 $ au ramassage → 23,00 $, soit exactement les montants du terminal Square.

### ⚠️ Prix affiché == prix facturé — la règle qui a rendu le site invendable
`effectiveUnitPrice(product, isFlorist)` dans `src/lib/pricing.ts` est la **seule** règle de prix du site. **Tout endroit qui affiche un prix ou met un produit au panier doit passer par elle.**
- Pourquoi : `createOrder` recalcule les prix depuis la base et `CheckoutClient` **abandonne la vente** si le total serveur diffère du total affiché (protection légitime : ne jamais débiter un montant que l'acheteur n'a pas vu). Un seul cent d'écart suffit donc à rendre un produit inachetable.
- Le piège concret (session 15) : `/boutique/[id]` affichait `product.price` alors que le serveur facturait `florist_price` à un fleuriste authentifié. Les cartes du catalogue fleuriste pointent vers cette page → 46 produits invendables, sans le moindre message d'erreur explicite.
- Points d'ajout au panier à garder synchronisés : `boutique/[id]/AddToCartButton`, `BoutiqueShop`, `FloristCatalog`. (`Fleuristes.tsx` et `TransformedProducts.tsx` ne sont plus utilisés depuis la session 12 — s'ils sont un jour remis en service, les brancher aussi.)
- `/boutique` et `/boutique/[id]` lisent le cookie fleuriste, donc sont **rendues dynamiquement** (`ƒ`). C'est voulu : une page statique ne peut pas afficher le bon prix.
- Contrôle : `node scripts/verify-purchase-flow.mjs`.

### ⚠️ Caisse — le total vient du serveur, jamais du panier
`quoteCart()` (`src/lib/actions/checkout.ts`) est appelée par `CheckoutClient` à chaque changement de panier ou de mode de réception. **Ne jamais recalculer un total à partir des prix du `localStorage`.**
- `quoteCart` et `createOrder` partagent `priceItems()` (tarification depuis la base) et `totalsFor()` (taxes + livraison). L'affichage et le montant encaissé traversent le même code : la divergence est structurellement impossible.
- Le garde-fou d'écart dans `CheckoutClient` est conservé, mais il ne peut plus se déclencher à tort — seulement si un prix bouge en base entre le devis et la commande.
- `quoteCart` renvoie `base` (sans arrondi) **et** `withRoundUp` : cocher l'arrondi ne redemande pas de devis.
- Le `cartId` du panier est renvoyé tel quel, jamais reconstruit — le reconstruire perdrait le suffixe du point de chute des abonnements (deux lignes distinctes fusionneraient sur la même clé React).
- Contrôle : `npm run build && npx next start -p 3001`, puis `node scripts/verify-checkout-quote.mjs`. ⚠️ Ne marche **pas** sur `npm run dev` : le serveur de développement régénère les identifiants d'actions serveur, et l'appel répond « Server action not found ».

### ⚠️ Prix — recalculés côté serveur, jamais lus du panier
`createOrder` (`src/lib/actions/checkout.ts`) ignore les prix envoyés par le navigateur : il recharge `products` / `subscriptions` depuis la base. Le panier ne sert qu'à savoir **quoi** a été commandé.
- Prix de gros (`florist_price`) appliqué uniquement si `isFloristAuthenticated()` est vrai côté serveur — le cookie `fp_florist` est la seule source d'autorité.
- Refus explicite : produit inactif/introuvable, `price_type = 'devis'`, `stock = 0`, prix ≤ 0.
- `createOrder` retourne `total` ; `CheckoutClient` compare avec le montant affiché et **abandonne** en cas d'écart plutôt que de débiter une somme non vue par l'acheteur.
- La route de paiement encaisse `orders.total_amount` (base), jamais `amountCAD` du client.

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

### Abonnements — modèle packs saisonniers (migration 012)
- `price` = prix global pour la saison (ex: 450$)
- `bouquets_count` = nombre de bouquets inclus dans le pack
- `format` (TEXT) = Petit / Moyen / Grand / XL (détermine `isPopular` si `"Moyen"`)
- Plus de `frequencies` — le modèle 1x/2x/4x mois est entièrement retiré
- "Annulation facile" retiré des features affichées sur les cartes

### Produits — type de prix (migration 013)
- `price_type TEXT ('fixed'|'devis')` — défaut `'fixed'`
- Mode `'devis'` : prix masqué, badge "Sur devis", bouton "Obtenir un prix" → `/contact?produit=NOM`
- Admin : sélecteur "Type de prix" dans ProductForm, cache le champ prix en mode devis
- Prix mis à 0 automatiquement côté serveur quand `price_type === 'devis'`

### Boutique — page détail produit
- Route `/boutique/[id]` — SSR, `generateMetadata` pour SEO
- Cartes boutique (Fleuristes + TransformedProducts) cliquables via overlay Link (`z-0`)
- Bouton "Ajouter" garde son `z-10` et reste indépendant du lien de carte
- `AddToCartButton.tsx` = Client Component séparé (nécessaire car page produit est Server Component)
- Section "Vous aimerez aussi" : 4 produits publics non-florist au bas de chaque fiche

### CMS — site_settings
- Table `site_settings` (key, value, label, grp)
- `getSiteSettings()` → retourne `Record<string, string>` — caché avec tag `site_settings`
- Groupes : `contact`, `reseaux_sociaux`, `footer`, `pourquoi_local`, `abonnements`, `ferme`, `fleuristes`, `boutique`
- Admin : `/admin/contenu`
- Groupe `boutique` : `boutique_subtitle`, `round_up_cause_name`, `blog_section_title`, `fleurs_titre`, `produits_titre`, `produits_surtitle`
- Revalidation (`settings.ts`) invalide : `/`, `/abonnements`, `/boutique`, `/contact`, `/la-ferme`, `/fleuristes`, `/mange-moi`, `/checkout` + tag `site_settings`

### Server Actions — protection
Toutes les actions d'écriture passent par `assertAdmin()` (`src/lib/actions/auth-guard.ts`) :
1. `createClient().auth.getUser()` → vérifie que le JWT est valide
2. `createAdminClient().from("users").select("is_admin")` → vérifie le flag en DB

Pattern de retour en cas d'échec : `{ error: "Non autorisé." }` ou `{ error: "Accès refusé." }`

### Cache invalidation — pattern standard
Chaque action utilise `revalidateTag(tag, "max")` + `revalidatePath()` via une fonction locale `invalidate()`.
Tags : `blog_posts`, `products`, `subscriptions`, `pages`, `events`, `site_settings`, `mange_moi`.

### Produits — galerie multi-images (migration 019)
- Table `product_images` (product_id FK cascade, image_url, sort_order SMALLINT)
- `ProductForm.tsx` : state `images: string[]`, max 5, hidden `<input name="images_json" />`, 1re image = principale (badge vert), X sur hover, bouton "Ajouter une photo" masqué quand max atteint
- `ImageUploader.tsx` : prop `onUploadedUrl?: (url: string) => void` ajoutée (backward compatible — tous les anciens usages intacts)
- `ProductGallery.tsx` : Client Component — grande image + rangée miniatures 64px, opacité 55% sur inactif
- Fallback : si `product.images` vide, page produit affiche l'ancien `image_url` (aucune migration de données nécessaire)
- Admin produits : join `product_images` via `.select("*, images:product_images(image_url, sort_order)")`, ordonné par `sort_order`

### Analytics de visites (migration 020)
- Table `page_views` (id BIGSERIAL, path TEXT, referrer TEXT, created_at) — aucune donnée personnelle (pas d'IP, pas d'UA)
- Conforme Loi 25 Québec : pas de consentement cookie requis
- `Analytics.tsx` : usePathname + useEffect + ref `lastPath` pour éviter double-fire SPA ; sendBeacon (fallback fetch keepalive)
- `/api/track` : Zod validation (path starts `/`, max 500), rate limit 120/min par IP, ignore `/admin/*`, insert via service_role
- Stats page (`/admin/stats`) : 3 COUNT queries (today/7j/30j), graphique 14j CSS (barre verte = aujourd'hui), top 10 pages 30j
- Rapports téléchargeables conservés mais `disabled` (Phase 3)

### Fleuristes — accès privé
- Cookie `fp_florist=1`, HttpOnly, Secure(prod), SameSite=lax, 30 jours
- Code stocké dans `site_settings.florist_access_code` (défaut: `fleuriste2026`)
- Changer le code : Admin → Contenu → section "Accès fleuristes"
- `florist_price` sur products : prix de gros affiché dans FloristCatalog (null = prix public)
- **Visibilité catalogue** : `fleuristes/page.tsx` filtre `p.florist_only || p.florist_price !== null` — un produit apparaît s'il est réservé fleuristes OU s'il a un prix de gros défini (session 10)
- **Fiches cliquables** : `FloristCatalog.tsx` — `ProductRow` (liste) et `ProductCard` (grille) ont un overlay `<Link href="/boutique/[id]" className="absolute inset-0 z-0">` ; le bouton "Ajouter" reste en `relative z-10` (même pattern que TransformedProducts)
- ✅ **Résolu session 15** (c'était la cause n°2 de l'impossibilité d'acheter) : `/boutique/[id]` lit maintenant `isFloristAuthenticated()` et affiche le prix de gros, barré du prix public. Voir « Prix affiché == prix facturé ».

### TipTap v3 — breaking change publication blog
Dans TipTap v2, l'éditeur déclenchait des re-renders React à chaque frappe → `editor.getHTML()` évalué au rendu retournait le contenu à jour.
En v3, TipTap ne déclenche plus ces re-renders → `value={editor.getHTML()}` dans le hidden input évaluait **toujours la valeur du mount** (chaîne vide pour un nouveau billet).
**Fix** : `useState(defaultValue)` + `onUpdate: ({ editor }) => setHtml(editor.getHTML())` + `immediatelyRender: false`. Le hidden input bind sur le state `html`, pas sur `editor.getHTML()` directement.

### Resend — emails silencieux
`resend.emails.send()` **ne throw jamais**. Il retourne `{ data, error }`. Avant le fix, l'erreur était ignorée — les emails échouaient en silence (aucune trace dans les logs Vercel).
Fix : `const { error: mailError } = await ...` + `if (mailError) console.error(...)`.
⚠️ Même pattern à appliquer partout où Resend est appelé.

### Caisse — Ramassage vs Livraison (migration 021)
- `delivery_method TEXT NOT NULL DEFAULT 'delivery' CHECK (IN ('pickup','delivery'))` sur `orders`
- Validation Zod : `.superRefine()` rend address/city/province/postal_code **obligatoires uniquement** si `delivery_method === 'delivery'`
- Code postal canadien : regex `/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/`
- `pickupAddress` passé en prop de `checkout/page.tsx` (Server) → `CheckoutClient` (Client)
- `fullAddress` en DB : soit "Ramassage à la ferme" soit l'adresse complète formatée

### Mange Moi — catalogue vitrine
- Table `mange_moi_items` (id, name, description, image_url, active, sort_order)
- RLS : lecture publique des items actifs uniquement
- `getMangeMoiItems()` → caché avec tag `mange_moi`
- Navbar/Footer/Hero : "Autocueillette" remplacé par "Mange Moi" → `/mange-moi`
- Autocueillette entièrement retirée (session 4) : pages, admin, action, API supprimés ; redirection 301 `/autocueillette` → `/mange-moi`. Table `autocueillette_events` conservée en DB (données historiques, plus utilisée par le code).

### Round-up pour la cause (caisse)
- Toggle optionnel : arrondi au dollar supérieur (ex: 48,73 $ → +0,27 $ → 49,00 $)
- N'apparaît pas si le total est déjà un dollar rond
- `round_up_amount` sauvegardé sur la commande, inclus dans `total_amount`
- Nom de la cause : setting `round_up_cause_name` (groupe `boutique`) dans site_settings
- Modifiable sans déploiement : Admin → Contenu → Boutique & Caisse
- Checkout refactorisé : `page.tsx` (Server, lit setting) + `CheckoutClient.tsx` (Client)

### Infolettre
- Table `newsletter_subscribers` (id, email UNIQUE, source, created_at)
- Sources possibles : `'contact'` (case cochée dans formulaire contact) | `'popup'` (popup boutique)
- Popup boutique : localStorage `fp_newsletter_shown`, délai 2.5s, code promo `BIENVENUE10`
- Action : `src/lib/actions/newsletter.ts` → `subscribeNewsletter` (FormData) + `subscribeNewsletterEmail` (programmatique)
- Doublons ignorés silencieusement (code Postgres `23505`)

### Cookie consent (Loi 25 Québec)
- Composant `CookieConsent.tsx` dans le layout public (toutes les pages)
- localStorage `fp_cookie_consent` = `'accepted'` | `'declined'`
- Liens vers `/politique-confidentialite`

### Carte Google Maps (Contact)
- iframe `https://www.google.com/maps?q=ADRESSE_ENCODÉE&output=embed`
- Adresse dynamique depuis `site_settings.contact_address`
- CSP mise à jour : `frame-src` + `connect-src` incluent `*.google.com` et `maps.googleapis.com`

### Produits — catégorie libre
- Champ `season` = sous-catégorie libre (TEXT) depuis migration 004
- Admin : champ texte libre avec datalist suggestions
- Boutique : filtres générés dynamiquement depuis les valeurs réelles en DB
- Rétrocompatibilité anciens slugs via `LEGACY_LABELS` dans Fleuristes.tsx, TransformedProducts.tsx et BoutiqueShop.tsx

### Boutique — layout unifié (session 12)
- `BoutiqueShop.tsx` reçoit **tous** les produits publics (`!florist_only`) — pas de split par `category`
- Sidebar gauche (desktop, w-44) : toggle grille/liste + filtre vertical par `season` + disclaimer livraison
- Mobile : barre scrollable horizontale (overflow-x-auto, whitespace-nowrap, scrollbarWidth none)
- Badge livraison dans le header : "9,99 $" / "Gratuite dès 100 $" — aussi dans CartDrawer (dynamique selon total)
- Produits "Sur devis" en grille mobile : `flex-col` (badge self-start + bouton pleine largeur) pour éviter déformation sur cartes étroites 2 colonnes
- `Fleuristes.tsx` et `TransformedProducts.tsx` : conservés mais plus appelés depuis `/boutique/page.tsx`

---

### Image Optimization Vercel — DÉSACTIVÉE (session 13)
`next.config.ts` → `images.unoptimized: true`. Vercel ne fait **plus aucune transformation
d'image** → ce poste reste à 0 (free tier = 5 000 transformations/mois, alerte reçue à 75 %).
- Pourquoi sans risque : les images sont déjà optimisées à l'upload (`api/upload/route.ts`,
  Sharp → WebP, max 1920px, qualité 80). Vercel les sert telles quelles depuis Supabase Storage.
- Coût d'une transformation = combinaison unique (image × largeur × format × qualité) ; avant le
  fix, `formats: ["avif","webp"]` (×2) + 8 `deviceSizes` multipliaient l'usage.
- Compromis : sur mobile l'image est servie en pleine taille (1920px) au lieu d'être redimensionnée
  (bande passante un peu plus élevée, LCP mobile légèrement moins bon) — négligeable ici.
- ⚠️ Si on veut réactiver l'optimisation un jour (ex: passage plan payant) : retirer `unoptimized`
  et remettre `formats: ["image/webp"]` + `minimumCacheTTL: 2678400` + `deviceSizes` réduits, pas
  `["avif","webp"]` par défaut.

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
