-- Conversion de la colonne season : ENUM product_season → TEXT
-- Permet des catégories flexibles définies côté application
ALTER TABLE public.products ALTER COLUMN season TYPE TEXT USING season::TEXT;

DROP TYPE IF EXISTS product_season;
