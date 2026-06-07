-- Titres de sections éditables depuis Admin → Contenu → Boutique & Caisse
INSERT INTO public.site_settings (key, value, label, grp) VALUES
  ('blog_section_title',   'Histoires de la ferme',    'Titre section blog (accueil)',              'boutique'),
  ('fleurs_titre',         'Fleurs coupées fraîches',  'Titre section fleurs (boutique)',           'boutique'),
  ('produits_titre',       'Nos créations',            'Titre section produits transformés',        'boutique'),
  ('produits_surtitle',    'Artisanat floral',         'Surtitle section produits transformés',     'boutique')
ON CONFLICT (key) DO NOTHING;
