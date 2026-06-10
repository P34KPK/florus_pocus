-- Migration 021 — Mode de livraison + adresse structurée sur les commandes
-- Les fleurs fraîches ne se livrent pas par la poste : on offre Ramassage à la ferme
-- OU Livraison locale. L'adresse est éclatée en rue / ville / province / code postal.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_method      TEXT NOT NULL DEFAULT 'delivery'
    CHECK (delivery_method IN ('pickup', 'delivery')),
  ADD COLUMN IF NOT EXISTS customer_city        VARCHAR(255),
  ADD COLUMN IF NOT EXISTS customer_province    VARCHAR(100),
  ADD COLUMN IF NOT EXISTS customer_postal_code VARCHAR(20);

-- Note : customer_address (VARCHAR(500) NOT NULL) reste utilisée :
--   - Livraison  -> rue / numéro civique
--   - Ramassage  -> libellé "Ramassage à la ferme"
-- Les nouvelles colonnes restent NULL pour les commandes en ramassage.

COMMENT ON COLUMN public.orders.delivery_method IS 'pickup = ramassage à la ferme | delivery = livraison locale';
