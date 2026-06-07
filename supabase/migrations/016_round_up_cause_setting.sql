INSERT INTO public.site_settings (key, value, label, grp)
VALUES ('round_up_cause_name', 'la cause', 'Nom de la cause (arrondi à la caisse)', 'boutique')
ON CONFLICT (key) DO NOTHING;
