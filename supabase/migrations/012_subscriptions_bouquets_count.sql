-- Migration 012 : modèle abonnements — prix global saison + nombre de bouquets
-- Remplace le modèle fréquence (1x/2x/4x mois) par un pack saisonnier.
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS bouquets_count INTEGER NOT NULL DEFAULT 0;
