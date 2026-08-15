/**
 * Règles d'inventaire — source unique de vérité pour l'affichage « Épuisé ».
 *
 * Un produit n'est indisponible que si son inventaire est explicitement suivi
 * (`track_inventory`) ET que le stock est à zéro. Sans suivi, `stock` est ignoré :
 * c'est ce qui évite qu'un 0 saisi par inadvertance retire un produit de la vente.
 */

interface InventoryFields {
  track_inventory?: boolean | null;
  stock: number | null;
}

/** Le produit doit-il être affiché « Épuisé » et retiré de la vente ? */
export function isSoldOut(p: InventoryFields): boolean {
  return Boolean(p.track_inventory) && p.stock === 0;
}

/**
 * Quantité restante à afficher en avertissement (« Plus que N en stock »),
 * ou null s'il n'y a rien à signaler.
 */
export function lowStockCount(p: InventoryFields, threshold = 10): number | null {
  if (!p.track_inventory || p.stock === null) return null;
  return p.stock > 0 && p.stock < threshold ? p.stock : null;
}
