-- Diagnostic des paiements refusés.
--
-- Quand Square rejette un paiement, la route de paiement ne renvoyait à
-- l'acheteur qu'un « Paiement refusé. Veuillez réessayer. » et journalisait la
-- vraie cause dans la console — donc dans des logs Vercel inaccessibles sur le
-- plan Hobby. Résultat : cinq tentatives du client le 2026-08-16 sans le moindre
-- moyen de savoir POURQUOI (carte refusée ? clé d'API invalide ? montant ?).
--
-- La cause est désormais écrite ici, lisible avec `verify-orders-pipeline.mjs`.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_error TEXT;

COMMENT ON COLUMN orders.payment_error IS
  'Dernière erreur renvoyée par Square (catégorie / code / détail). NULL si aucun échec.';

-- Retrouver rapidement les commandes qui ont échoué au paiement.
CREATE INDEX IF NOT EXISTS idx_orders_payment_error
  ON orders (created_at DESC)
  WHERE payment_error IS NOT NULL;
