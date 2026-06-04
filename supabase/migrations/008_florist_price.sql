-- Migration 008 : prix fleuriste sur les produits + code accès fleuristes

-- Prix de gros pour les fleuristes (optionnel par produit)
ALTER TABLE products ADD COLUMN florist_price NUMERIC(10,2) NULL;

-- Code d'accès à la section fleuristes
INSERT INTO site_settings (key, label, grp, value)
VALUES ('florist_access_code', 'Code d''accès fleuristes', 'fleuristes', 'fleuriste2026');
