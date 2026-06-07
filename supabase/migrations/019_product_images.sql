-- Galerie d'images par produit (max 5)
CREATE TABLE IF NOT EXISTS public.product_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_images_product_id_idx ON public.product_images(product_id);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Lecture publique (même règle que les produits actifs — filtrage fait côté app)
CREATE POLICY "Public can read product images"
  ON public.product_images FOR SELECT
  USING (true);

-- Écriture via service_role uniquement (Server Actions)
