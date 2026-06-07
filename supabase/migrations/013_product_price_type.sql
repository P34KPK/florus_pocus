-- Migration 013 : type de prix produit — fixed (défaut) ou devis (sur soumission)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS price_type TEXT NOT NULL DEFAULT 'fixed'
    CHECK (price_type IN ('fixed', 'devis'));
