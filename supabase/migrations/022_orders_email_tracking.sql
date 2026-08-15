-- 022_orders_email_tracking.sql
-- Traçabilité des courriels de commande + marquage des commandes fleuristes.
--
-- Contexte : aucune notification n'était envoyée à l'administrateur lors d'une
-- commande, et les échecs d'envoi Resend étaient invisibles (Resend ne lève pas
-- d'exception, il retourne { error }). Ces colonnes rendent l'envoi idempotent
-- (une seule salve de courriels par commande, peu importe si c'est la route de
-- paiement ou le webhook Square qui la déclenche) et traçable en cas d'échec.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS is_florist_order BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS emails_sent_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_error      TEXT;

COMMENT ON COLUMN orders.is_florist_order IS
  'Commande passée depuis l''espace fleuristes (cookie fp_florist valide) — prix de gros appliqués.';
COMMENT ON COLUMN orders.emails_sent_at IS
  'Horodatage de la réservation d''envoi des courriels de commande. Sert de verrou d''idempotence entre la route de paiement et le webhook Square.';
COMMENT ON COLUMN orders.email_error IS
  'Dernière erreur retournée par Resend lors de l''envoi des courriels de cette commande (null si tout est passé).';

-- Retrouver rapidement les commandes payées dont les courriels n'ont pas été envoyés.
CREATE INDEX IF NOT EXISTS idx_orders_emails_pending
  ON orders (created_at DESC)
  WHERE emails_sent_at IS NULL;
