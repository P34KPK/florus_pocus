-- 024_orders_taxes_delivery.sql
-- Taxes (TPS/TVQ) et frais de livraison sur les commandes web.
--
-- Contexte : le site n'a jamais facturé ni taxes ni livraison, alors que les
-- ventes au terminal Square les incluent (23,00 $ = 20 $ × 1,15). Le panier
-- annonçait « 9,99 $ / gratuite dès 100 $ » sans jamais l'ajouter au total.
--
-- Le détail est stocké sur chaque commande : indispensable pour la
-- comptabilité et les remises de taxes — un total global ne suffit pas.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS subtotal     NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gst_amount   NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS qst_amount   NUMERIC(10,2) NOT NULL DEFAULT 0;

COMMENT ON COLUMN orders.subtotal     IS 'Somme des articles avant livraison, taxes et arrondi.';
COMMENT ON COLUMN orders.delivery_fee IS 'Frais de livraison locale facturés (0 au ramassage ou au-delà du seuil de gratuité).';
COMMENT ON COLUMN orders.gst_amount   IS 'TPS facturée, calculée sur (sous-total + livraison).';
COMMENT ON COLUMN orders.qst_amount   IS 'TVQ facturée, calculée sur (sous-total + livraison).';

-- Commandes antérieures : aucune taxe ni livraison n'avait été facturée, le
-- sous-total valait donc le total moins l'arrondi pour la cause.
UPDATE orders
   SET subtotal = GREATEST(total_amount - COALESCE(round_up_amount, 0), 0)
 WHERE subtotal = 0;

-- ── Réglages éditables depuis Admin → Contenu ──────────────────────────────
-- Les taux sont saisis en POURCENTAGE (« 5 », « 9.975 ») : plus lisible pour
-- l'administrateur. Le code les convertit en fraction.
INSERT INTO site_settings (key, value, label, grp) VALUES
  ('taxes_enabled',           'true',    'Facturer les taxes (true / false)',                'taxes_livraison'),
  ('gst_rate',                '5',       'Taux de TPS (%)',                                  'taxes_livraison'),
  ('qst_rate',                '9.975',   'Taux de TVQ (%)',                                  'taxes_livraison'),
  ('gst_number',              '',        'Numéro de TPS (affiché sur les confirmations)',    'taxes_livraison'),
  ('qst_number',              '',        'Numéro de TVQ (affiché sur les confirmations)',    'taxes_livraison'),
  ('delivery_fee',            '9.99',    'Frais de livraison locale ($)',                    'taxes_livraison'),
  ('free_delivery_threshold', '100',     'Livraison gratuite à partir de ($)',               'taxes_livraison')
ON CONFLICT (key) DO NOTHING;
