-- Migration 006 : abonnements — prix par bouquet + format (remplace prix mensuel + nombre de tiges)

-- 1. Renommer price_monthly → price
ALTER TABLE subscriptions RENAME COLUMN price_monthly TO price;

-- 2. Ajouter la colonne format (TEXT)
ALTER TABLE subscriptions ADD COLUMN format TEXT NOT NULL DEFAULT 'Moyen';

-- 3. Migrer les données existantes : convertir stems_count en format lisible
UPDATE subscriptions SET format =
  CASE
    WHEN stems_count <= 12 THEN 'Petit'
    WHEN stems_count <= 22 THEN 'Moyen'
    ELSE 'Grand'
  END;

-- 4. Supprimer l'ancienne colonne stems_count
ALTER TABLE subscriptions DROP COLUMN stems_count;
