-- Migration 011 : ajoute la page "mange-moi" à la table pages
-- Permet d'éditer le titre, la description et l'image de la page /mange-moi depuis l'admin.

-- 1. Remplacer le CHECK constraint pour inclure 'mange-moi'
ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_slug_check;
ALTER TABLE pages ADD CONSTRAINT pages_slug_check
  CHECK (slug IN ('hero', 'why-local', 'farm', 'contact', 'mange-moi'));

-- 2. Insérer la page (idempotent)
INSERT INTO pages (slug, title, description, meta_description, published) VALUES
  (
    'mange-moi',
    'Mange Moi',
    'Nos créations comestibles, faites à la main sur la ferme avec les fleurs et plantes de saison.',
    'Découvrez les créations comestibles artisanales de la ferme Florus Pocus.',
    true
  )
ON CONFLICT (slug) DO NOTHING;
