-- Statistiques de visites — aucune donnée personnelle (pas d'IP, pas de session)
CREATE TABLE IF NOT EXISTS public.page_views (
  id         BIGSERIAL PRIMARY KEY,
  path       TEXT NOT NULL,
  referrer   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_path_idx       ON public.page_views(path);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Lecture et écriture via service_role uniquement (API route + admin)
-- Aucune policy publique — sécurité maximale
