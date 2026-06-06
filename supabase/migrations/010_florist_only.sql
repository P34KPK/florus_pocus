-- Marque les produits réservés exclusivement aux fleuristes membres.
-- Ces produits n'apparaissent PAS dans la boutique grand public.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS florist_only BOOLEAN NOT NULL DEFAULT false;
