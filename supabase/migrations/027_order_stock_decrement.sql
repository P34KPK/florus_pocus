-- Décrémentation automatique du stock à l'achat.
--
-- Jusqu'ici `products.stock` était un compteur purement manuel : rien ne le
-- diminuait à la vente. Sur les produits dont l'inventaire est suivi, deux
-- acheteurs pouvaient donc prendre la dernière pièce du même produit.
--
-- Trois exigences, toutes traitées ici plutôt que dans le code applicatif :
--   1. Ne décrémenter qu'une seule fois par commande. La route de paiement ET le
--      webhook Square confirment la même commande : `stock_applied_at` sert de
--      réservation atomique, exactement comme `emails_sent_at` pour les courriels.
--   2. Résister aux commandes simultanées. Le calcul `stock - quantité` se fait
--      dans une seule instruction SQL : Postgres verrouille la ligne, donc deux
--      ventes concurrentes ne peuvent pas lire la même valeur de départ.
--   3. Ne toucher qu'aux produits réellement suivis (`track_inventory`). Sans
--      suivi, `stock` n'a pas de sens et doit rester intact.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS stock_applied_at TIMESTAMPTZ;

COMMENT ON COLUMN orders.stock_applied_at IS
  'Horodatage de la décrémentation du stock. Verrou d''idempotence : NULL = pas encore appliquée.';

CREATE OR REPLACE FUNCTION apply_order_stock(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Réservation atomique. Le premier appelant passe, les suivants ressortent
  -- sans rien faire : c'est ce qui permet au webhook d'être un filet de secours
  -- sans jamais décompter deux fois.
  UPDATE orders
     SET stock_applied_at = now()
   WHERE id = p_order_id
     AND stock_applied_at IS NULL;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Les quantités sont regroupées par produit : une commande peut contenir
  -- plusieurs lignes du même article.
  UPDATE products p
     SET stock      = GREATEST(p.stock - agg.quantite, 0),
         updated_at = now()
    FROM (
      SELECT product_id, SUM(quantity)::INT AS quantite
        FROM order_items
       WHERE order_id     = p_order_id
         AND product_type = 'product'
         AND product_id IS NOT NULL
       GROUP BY product_id
    ) AS agg
   WHERE p.id              = agg.product_id
     AND p.track_inventory = TRUE
     AND p.stock IS NOT NULL;

  RETURN true;
END;
$$;

COMMENT ON FUNCTION apply_order_stock(UUID) IS
  'Décrémente le stock des produits suivis d''une commande. Idempotente via orders.stock_applied_at. Retourne true si appliquée, false si déjà faite.';

-- Personne d'autre que le backend ne doit pouvoir modifier les stocks.
REVOKE ALL ON FUNCTION apply_order_stock(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION apply_order_stock(UUID) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION apply_order_stock(UUID) TO service_role;
