-- ═══════════════════════════════════════════════════════
-- FlorusPocus — Migration initiale
-- Coller dans Supabase SQL Editor et exécuter
-- ═══════════════════════════════════════════════════════

-- ── Enums ─────────────────────────────────────────────
CREATE TYPE product_category    AS ENUM ('fleur', 'transforme');
CREATE TYPE product_season      AS ENUM ('spring', 'summer', 'fall', 'winter');
CREATE TYPE subscription_freq   AS ENUM ('1x_month', '2x_month', '4x_month');
CREATE TYPE order_status        AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status      AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE order_item_type     AS ENUM ('product', 'subscription', 'autocueillette');

-- ── USERS ──────────────────────────────────────────────
CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       VARCHAR(255) NOT NULL UNIQUE,
  is_admin    BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

CREATE POLICY "Admins can update any user"
  ON public.users FOR UPDATE
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

CREATE POLICY "Admins can delete users"
  ON public.users FOR DELETE
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

CREATE INDEX idx_users_id ON public.users(id);

-- Auto-create user row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── PAGES ──────────────────────────────────────────────
CREATE TABLE public.pages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                VARCHAR(50) NOT NULL UNIQUE CHECK (slug IN ('hero', 'why-local', 'farm', 'contact')),
  title               VARCHAR(255) NOT NULL,
  description         TEXT NOT NULL DEFAULT '',
  featured_image_url  VARCHAR(500),
  meta_description    VARCHAR(160),
  published           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published pages"
  ON public.pages FOR SELECT USING (published = true);

CREATE POLICY "Only admins can insert pages"
  ON public.pages FOR INSERT
  WITH CHECK ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

CREATE POLICY "Only admins can update pages"
  ON public.pages FOR UPDATE
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

CREATE POLICY "Only admins can delete pages"
  ON public.pages FOR DELETE
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

CREATE INDEX idx_pages_published ON public.pages(published);

-- Seed pages
INSERT INTO public.pages (slug, title, description, meta_description) VALUES
  ('hero',      'Cultiver la Vie', 'Des fleurs fraîches de la ferme à votre porte. Abonnements, autocueillette et bouquets artisanaux cultivés avec amour au cœur du Québec.', 'Fleurs fraîches cultivées à la ferme au Québec. Abonnements et autocueillette disponibles.'),
  ('why-local', 'Pourquoi choisir local ?', 'Parce que les fleurs qui voyagent moins sont plus fraîches, plus belles et respectent notre belle planète. Chez Florus Pocus, chaque bouquet raconte l''histoire de notre terre québécoise.', 'Fleurs locales du Québec, sans pesticides, cultivées dans le respect de l''environnement.'),
  ('farm',      'La Ferme', 'Nichée au cœur du Québec, Florus Pocus est née d''une passion pour les fleurs et d''un désir de reconnecter les gens avec la nature. Nous cultivons plus de 80 variétés de fleurs sans pesticides.', 'Découvrez notre ferme florale artisanale au Québec.'),
  ('contact',   'Contactez-nous', 'Nous serions ravis de vous entendre ! Que ce soit pour une question, une commande spéciale ou simplement pour partager votre amour des fleurs.', 'Contactez Florus Pocus — ferme florale artisanale au Québec.');

-- ── PRODUCTS ───────────────────────────────────────────
CREATE TABLE public.products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category    product_category NOT NULL,
  price       DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  stock       INTEGER CHECK (stock >= 0),
  image_url   VARCHAR(500),
  season      product_season,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active products"
  ON public.products FOR SELECT USING (active = true);

CREATE POLICY "Only admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

CREATE POLICY "Only admins can update products"
  ON public.products FOR UPDATE
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

CREATE POLICY "Only admins can delete products"
  ON public.products FOR DELETE
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

CREATE INDEX idx_products_active   ON public.products(active);
CREATE INDEX idx_products_category ON public.products(category);

-- Seed products
INSERT INTO public.products (name, description, category, price, stock, season) VALUES
  ('Rose Rouge',         'Roses fraîchement coupées, parfum délicat.',                        'fleur',    8.50,  50, 'summer'),
  ('Tulipe Rose',        'Tulipes printanières, tiges longues et droites.',                   'fleur',    6.00,  30, 'spring'),
  ('Tournesol',          'Grands tournesols lumineux qui égaient n''importe quel espace.',    'fleur',    5.50,  40, 'summer'),
  ('Pivoine',            'Pivoines luxuriantes au parfum envoûtant.',                         'fleur',    9.00,  20, 'spring'),
  ('Zinnia Multicolore', 'Zinnias vibrants dans toutes les couleurs de l''arc-en-ciel.',      'fleur',    4.50,  60, 'summer'),
  ('Dahlia Bordeaux',    'Dahlias profonds aux pétales veloutés.',                            'fleur',    7.50,  15, 'fall'),
  ('Aster Mauve',        'Asters d''automne au bleu-mauve magnifique.',                       'fleur',    5.00,  25, 'fall'),
  ('Lisianthus Blanc',   'Lisianthus élégants, ressemblent aux roses.',                       'fleur',    8.00,  18, 'summer'),
  ('Cosmos Rose',        'Cosmos légers et aériens, parfaits pour les bouquets sauvages.',    'fleur',    4.00,  45, 'summer'),
  ('Statice Violet',     'Statice séchable, idéal pour compositions durables.',               'fleur',    5.00,  35, 'fall'),
  ('Gelée de Roses',     'Gelée artisanale aux pétales de roses fraîches.',                  'transforme', 12.00, 24, NULL),
  ('Sirop de Lavande',   'Sirop naturel de lavande québécoise.',                             'transforme', 14.00, 18, NULL),
  ('Bouquet Séché',      'Bouquet de fleurs séchées naturellement.',                         'transforme', 28.00, 10, NULL),
  ('Vinaigre de Fleurs', 'Vinaigre de cidre infusé aux fleurs sauvages.',                   'transforme', 11.00, 20, NULL),
  ('Tisane de la Ferme', 'Mélange de plantes séchées de notre jardin.',                     'transforme',  9.00, 30, NULL);

-- ── SUBSCRIPTIONS ──────────────────────────────────────
CREATE TABLE public.subscriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  price_monthly DECIMAL(10, 2) NOT NULL CHECK (price_monthly >= 0),
  stems_count   INTEGER NOT NULL CHECK (stems_count > 0),
  frequencies   JSONB NOT NULL DEFAULT '["1x_month"]',
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active subscriptions"
  ON public.subscriptions FOR SELECT USING (active = true);

CREATE POLICY "Only admins can insert subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

CREATE POLICY "Only admins can update subscriptions"
  ON public.subscriptions FOR UPDATE
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

CREATE POLICY "Only admins can delete subscriptions"
  ON public.subscriptions FOR DELETE
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

CREATE INDEX idx_subscriptions_active ON public.subscriptions(active);

-- Seed subscriptions
INSERT INTO public.subscriptions (name, description, price_monthly, stems_count, frequencies) VALUES
  ('Petit Bouquet',   'Un bouquet délicat de fleurs de saison pour égayer votre espace.',          39.00, 10, '["1x_month","2x_month"]'),
  ('Bouquet Moyen',   'Un généreux bouquet qui transforme chaque pièce en jardin fleuri.',         65.00, 20, '["1x_month","2x_month","4x_month"]'),
  ('Bouquet Complet', 'L''expérience florale ultime — un bouquet spectaculaire chaque livraison.', 95.00, 30, '["1x_month","2x_month","4x_month"]');

-- ── SUBSCRIPTION DROPOFF POINTS ────────────────────────
CREATE TABLE public.subscription_dropoff_points (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  address         VARCHAR(500) NOT NULL,
  days_available  JSONB NOT NULL DEFAULT '[1,3,5]',
  hours_start     TIME NOT NULL DEFAULT '09:00',
  hours_end       TIME NOT NULL DEFAULT '17:00',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_dropoff_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view dropoff points"
  ON public.subscription_dropoff_points FOR SELECT USING (true);

CREATE POLICY "Only admins can insert dropoff points"
  ON public.subscription_dropoff_points FOR INSERT
  WITH CHECK ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

CREATE POLICY "Only admins can update dropoff points"
  ON public.subscription_dropoff_points FOR UPDATE
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

CREATE POLICY "Only admins can delete dropoff points"
  ON public.subscription_dropoff_points FOR DELETE
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

-- ── AUTOCUEILLETTE EVENTS ──────────────────────────────
CREATE TABLE public.autocueillette_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_date       DATE NOT NULL UNIQUE,
  capacity         INTEGER NOT NULL CHECK (capacity > 0),
  tickets_sold     INTEGER NOT NULL DEFAULT 0 CHECK (tickets_sold >= 0),
  price_per_ticket DECIMAL(10, 2) NOT NULL CHECK (price_per_ticket >= 0),
  description      TEXT,
  active           BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tickets_not_exceed_capacity CHECK (tickets_sold <= capacity)
);

ALTER TABLE public.autocueillette_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active events"
  ON public.autocueillette_events FOR SELECT USING (active = true);

CREATE POLICY "Only admins can insert events"
  ON public.autocueillette_events FOR INSERT
  WITH CHECK ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

CREATE POLICY "Only admins can update events"
  ON public.autocueillette_events FOR UPDATE
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

CREATE POLICY "Only admins can delete events"
  ON public.autocueillette_events FOR DELETE
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

CREATE INDEX idx_autocueillette_date ON public.autocueillette_events(event_date);

-- Seed events (next 10 dates from now)
INSERT INTO public.autocueillette_events (event_date, capacity, tickets_sold, price_per_ticket, description) VALUES
  (CURRENT_DATE + 2,  20, 8,  25.00, 'Venez cueillir vos fleurs préférées dans notre champ !'),
  (CURRENT_DATE + 5,  20, 12, 25.00, 'Journée autocueillette — roses et tournesols en vedette.'),
  (CURRENT_DATE + 9,  20, 20, 25.00, 'Venez cueillir vos fleurs préférées dans notre champ !'),
  (CURRENT_DATE + 12, 20, 3,  25.00, 'Journée autocueillette spéciale pivoines.'),
  (CURRENT_DATE + 16, 20, 15, 25.00, 'Venez cueillir vos fleurs préférées dans notre champ !'),
  (CURRENT_DATE + 19, 20, 5,  25.00, 'Journée autocueillette familiale.'),
  (CURRENT_DATE + 23, 20, 0,  25.00, 'Venez cueillir vos fleurs préférées dans notre champ !'),
  (CURRENT_DATE + 26, 20, 11, 25.00, 'Dahlias et asters à cueillir.'),
  (CURRENT_DATE + 30, 20, 7,  25.00, 'Venez cueillir vos fleurs préférées dans notre champ !'),
  (CURRENT_DATE + 33, 20, 2,  28.00, 'Journée spéciale — nouvelle collection automne.');

-- ── BLOG POSTS ─────────────────────────────────────────
CREATE TABLE public.blog_posts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title               VARCHAR(255) NOT NULL,
  slug                VARCHAR(255) NOT NULL UNIQUE,
  content             TEXT NOT NULL DEFAULT '',
  featured_image_url  VARCHAR(500),
  excerpt             VARCHAR(160) NOT NULL DEFAULT '',
  tags                JSONB NOT NULL DEFAULT '[]',
  author              VARCHAR(255) NOT NULL,
  published           BOOLEAN NOT NULL DEFAULT false,
  published_date      TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published posts"
  ON public.blog_posts FOR SELECT USING (published = true);

CREATE POLICY "Only admins can insert posts"
  ON public.blog_posts FOR INSERT
  WITH CHECK ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

CREATE POLICY "Only admins can update posts"
  ON public.blog_posts FOR UPDATE
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

CREATE POLICY "Only admins can delete posts"
  ON public.blog_posts FOR DELETE
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

CREATE INDEX idx_blog_published ON public.blog_posts(published);

-- Seed blog posts
INSERT INTO public.blog_posts (title, slug, excerpt, tags, author, published, published_date, content) VALUES
  ('Pourquoi les fleurs locales changent tout', 'pourquoi-fleurs-locales', 'Les fleurs importées parcourent des milliers de kilomètres avant d''arriver chez vous. Découvrez pourquoi les fleurs locales sont meilleures.', '["local","environnement"]', 'admin@floruspocus.ca', true, now() - interval '16 days', 'Contenu complet à rédiger.'),
  ('Comment prendre soin de vos bouquets',      'prendre-soin-bouquets',   'Avec quelques gestes simples, vos bouquets peuvent durer une à deux semaines de plus. Nos conseils pro.',                                       '["conseils","bouquets"]',  'admin@floruspocus.ca', true, now() - interval '32 days', 'Contenu complet à rédiger.'),
  ('Dans les coulisses d''une ferme florale',   'coulisses-ferme-florale', 'Une journée avec nous à la ferme — de l''aube aux premières cueillettes, jusqu''à la préparation des commandes.',                              '["ferme","vie"]',          'admin@floruspocus.ca', true, now() - interval '45 days', 'Contenu complet à rédiger.'),
  ('Les meilleures fleurs de l''automne',       'fleurs-automne-quebec',   'L''automne au Québec est une saison magique pour les fleurs. Dahlias, asters, et statices — nos coups de cœur.',                              '["automne","saison"]',     'admin@floruspocus.ca', true, now() - interval '57 days', 'Contenu complet à rédiger.'),
  ('Notre approche sans pesticides',            'approche-sans-pesticides', 'Cultiver des fleurs sans pesticides, c''est un défi quotidien et une conviction profonde. Voici comment nous le faisons.',                     '["agriculture","bio"]',    'admin@floruspocus.ca', false, NULL, 'Contenu complet à rédiger.');

-- ── ORDERS ─────────────────────────────────────────────
CREATE TABLE public.orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email        VARCHAR(255) NOT NULL,
  customer_name         VARCHAR(255) NOT NULL,
  customer_phone        VARCHAR(20),
  customer_address      VARCHAR(500) NOT NULL,
  total_amount          DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  status                order_status NOT NULL DEFAULT 'pending',
  payment_status        payment_status NOT NULL DEFAULT 'pending',
  square_transaction_id VARCHAR(255),
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own orders"
  ON public.orders FOR SELECT
  USING (auth.email() = customer_email OR (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

CREATE POLICY "Customers can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.email() = customer_email);

CREATE POLICY "Only admins can update orders"
  ON public.orders FOR UPDATE
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

CREATE POLICY "Only admins can delete orders"
  ON public.orders FOR DELETE
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

CREATE INDEX idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX idx_orders_status         ON public.orders(status);

-- ── ORDER ITEMS ────────────────────────────────────────
CREATE TABLE public.order_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id     UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_type   order_item_type NOT NULL,
  quantity       INTEGER NOT NULL CHECK (quantity > 0),
  price_per_unit DECIMAL(10, 2) NOT NULL CHECK (price_per_unit >= 0),
  metadata       JSONB NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own order items"
  ON public.order_items FOR SELECT
  USING (
    order_id IN (SELECT id FROM public.orders WHERE customer_email = auth.email())
    OR (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true
  );

CREATE POLICY "No direct insert on order_items"
  ON public.order_items FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Only admins can update order_items"
  ON public.order_items FOR UPDATE
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

CREATE POLICY "Only admins can delete order_items"
  ON public.order_items FOR DELETE
  USING ((SELECT is_admin FROM public.users WHERE id = auth.uid()) = true);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

-- ── Updated_at triggers ────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_users_updated_at         BEFORE UPDATE ON public.users         FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_pages_updated_at         BEFORE UPDATE ON public.pages         FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_products_updated_at      BEFORE UPDATE ON public.products      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_dropoff_updated_at       BEFORE UPDATE ON public.subscription_dropoff_points FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_events_updated_at        BEFORE UPDATE ON public.autocueillette_events       FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_blog_updated_at          BEFORE UPDATE ON public.blog_posts    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_orders_updated_at        BEFORE UPDATE ON public.orders        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
