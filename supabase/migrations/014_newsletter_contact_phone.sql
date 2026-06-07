-- Ajout du champ téléphone (optionnel) sur les messages de contact
ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS telephone VARCHAR(50);

-- Table des abonnés à l'infolettre
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      VARCHAR(255) NOT NULL UNIQUE,
  source     VARCHAR(50)  NOT NULL DEFAULT 'contact',   -- 'contact' | 'popup'
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent lire la liste
CREATE POLICY "Admin can read newsletter subscribers"
  ON public.newsletter_subscribers FOR SELECT
  USING (
    (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true
  );
-- L'insertion se fait côté serveur via service_role_key — aucune policy publique requise
