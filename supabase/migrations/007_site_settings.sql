-- Migration 007 : table site_settings — textes éditables depuis l'admin

CREATE TABLE site_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  label TEXT NOT NULL,
  grp   TEXT NOT NULL  -- "group" est un mot réservé SQL
);

-- Lecture publique, écriture via service_role uniquement
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON site_settings FOR SELECT USING (true);

-- Seed — valeurs initiales
INSERT INTO site_settings (key, label, grp, value) VALUES
  -- Contact
  ('contact_address',  'Adresse',           'contact', '123 Chemin de la Ferme, Pont-Rouge, QC G3H 1A1'),
  ('contact_phone',    'Téléphone',         'contact', '+1 (418) 555-1234'),
  ('contact_email',    'Courriel',          'contact', 'info@floruspocus.com'),
  ('contact_hours',    'Heures d''ouverture','contact', 'Lun-Ven 9h-17h · Sam 9h-14h'),

  -- Réseaux sociaux
  ('social_instagram', 'Instagram (URL)', 'reseaux_sociaux', 'https://www.instagram.com/florus_pocus'),
  ('social_linkedin',  'LinkedIn (URL)',  'reseaux_sociaux', 'https://www.linkedin.com/company/floruspocus/'),

  -- Footer
  ('footer_tagline',  'Accroche — ligne 1', 'footer', 'Cultiver la vie, une fleur à la fois.'),
  ('footer_tagline2', 'Accroche — ligne 2', 'footer', 'Floriculture écoresponsable au Québec.'),

  -- Section "Pourquoi local" — 4 cartes de raisons
  ('whylocal_reason1_title', 'Raison 1 — Titre',       'pourquoi_local', 'Cultivées sans pesticides'),
  ('whylocal_reason1_desc',  'Raison 1 — Description', 'pourquoi_local', 'Chaque fleur est cultivée en harmonie avec la nature, sans produits chimiques nocifs.'),
  ('whylocal_reason2_title', 'Raison 2 — Titre',       'pourquoi_local', 'Livraison locale'),
  ('whylocal_reason2_desc',  'Raison 2 — Description', 'pourquoi_local', 'De la ferme à votre porte, fraîches et épanouies, directement dans votre région.'),
  ('whylocal_reason3_title', 'Raison 3 — Titre',       'pourquoi_local', 'Saisons respectées'),
  ('whylocal_reason3_desc',  'Raison 3 — Description', 'pourquoi_local', 'Nos fleurs suivent le rythme naturel des saisons québécoises pour une qualité maximale.'),
  ('whylocal_reason4_title', 'Raison 4 — Titre',       'pourquoi_local', 'Soutenir l''économie locale'),
  ('whylocal_reason4_desc',  'Raison 4 — Description', 'pourquoi_local', 'En choisissant Florus Pocus, vous investissez dans votre communauté et l''agriculture locale.'),

  -- Section abonnements
  ('abonnements_title',    'Section abonnements — Titre',      'abonnements', 'Des fleurs de saison, chaque mois'),
  ('abonnements_subtitle', 'Section abonnements — Sous-titre', 'abonnements', 'Choisissez votre abonnement, votre fréquence de livraison et votre point de chute préféré.');
