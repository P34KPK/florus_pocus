-- Table contact_messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  message    TEXT NOT NULL,
  read       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Aucun accès public en lecture
-- Seuls les admins peuvent lire
CREATE POLICY "Admin can read contact messages"
  ON public.contact_messages FOR SELECT
  USING (
    (SELECT is_admin FROM public.users WHERE id = auth.uid()) = true
  );

-- N'importe qui peut envoyer un message (INSERT anonyme via service role)
-- L'insertion se fait côté serveur avec service role key, donc pas de policy publique requise
