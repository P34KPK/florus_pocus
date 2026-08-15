-- 025_admin_notifications.sql
-- Cloche de notifications de l'admin.
--
-- Aucune table de notifications : elles sont DÉRIVÉES des données existantes
-- (commandes, messages, abonnés, réglages incomplets). Pas de déclencheurs, pas
-- de remplissage initial, pas de désynchronisation possible — une notification
-- disparaît d'elle-même dès que la situation est réglée.
--
-- Seul l'état « déjà vu » a besoin d'être persisté, et c'est le rôle de cette
-- table : un horodatage par administrateur.

CREATE TABLE IF NOT EXISTS admin_notification_reads (
  user_id      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE admin_notification_reads IS
  'Dernière consultation de la cloche de notifications, par administrateur. Les notifications elles-mêmes sont dérivées à la volée.';

-- Accès exclusivement via service_role (les pages admin utilisent
-- createAdminClient, et le layout (protected) vérifie déjà is_admin).
ALTER TABLE admin_notification_reads ENABLE ROW LEVEL SECURITY;
