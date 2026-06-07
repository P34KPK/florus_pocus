-- Arrondi pour la cause sur les commandes
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS round_up_amount NUMERIC(10,2) NOT NULL DEFAULT 0;
