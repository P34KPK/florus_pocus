INSERT INTO public.site_settings (key, value, label, grp)
VALUES (
  'boutique_subtitle',
  'De la fleur au produit fini — gelées, sirops, bouquets séchés et plus encore, faits à la main sur la ferme.',
  'Sous-titre de la section boutique',
  'boutique'
)
ON CONFLICT (key) DO NOTHING;
