-- 023_product_track_inventory.sql
-- Suivi d'inventaire explicite, par produit.
--
-- Contexte : la colonne `stock` (INTEGER nullable) encodait trois états dans un
-- seul champ, dont deux presque identiques à la saisie mais aux effets opposés :
--   vide (NULL) → vendable, illimité
--   0           → INVENDABLE ("Épuisé", aucun bouton d'ajout)
--   N > 0       → vendable, avec compteur
-- Résultat observé en production : 39 fiches de fleurs coupées saisies le
-- 2026-06-08 avec 0, jamais rouvertes ensuite, donc tout le catalogue de fleurs
-- était invendable sans que personne ne s'en aperçoive.
--
-- `track_inventory` rend le choix conscient : tant qu'il est à false, le stock
-- n'est pas suivi et le produit reste vendable quoi qu'il arrive.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN products.track_inventory IS
  'true = le stock est suivi et stock=0 signifie "Épuisé". false = produit toujours vendable, la colonne stock est ignorée.';

-- Remplissage : seuls les produits ayant une quantité réelle saisie sont
-- considérés comme suivis. Les NULL (illimité) et les 0 périmés repassent en
-- "non suivi", ce qui remet le catalogue de fleurs en vente.
UPDATE products
   SET track_inventory = true
 WHERE stock IS NOT NULL
   AND stock > 0;

UPDATE products
   SET track_inventory = false
 WHERE stock IS NULL
    OR stock = 0;
