import { createAdminClient } from "@/lib/supabase-server";

/**
 * Décrémente le stock des produits d'une commande payée.
 *
 * Point d'entrée unique, appelé par la route de paiement ET par le webhook
 * Square. Toute la logique délicate (idempotence, concurrence, produits non
 * suivis) vit dans la fonction Postgres `apply_order_stock` — voir la migration
 * 027 : la faire ici, en lisant puis en écrivant depuis Node, exposerait à ce que
 * deux ventes simultanées lisent la même valeur de départ.
 *
 * ⚠️ Ne lève JAMAIS. Elle est appelée après un encaissement réussi : un problème
 * de stock ne doit pas faire échouer une réponse de paiement, ni laisser croire à
 * l'acheteur que sa carte n'a pas été débitée.
 */
export async function applyOrderStock(orderId: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("apply_order_stock", { p_order_id: orderId });

    if (error) {
      // Cas typique : migration 027 pas encore exécutée. Le paiement reste
      // valide, seul le compteur de stock n'a pas bougé.
      console.error("[stock] apply_order_stock:", error.message, "orderId:", orderId);
      return;
    }

    if (data === false) {
      // Déjà appliquée par l'autre chemin (route de paiement ou webhook).
      return;
    }

    console.log("[stock] décrémenté pour la commande", orderId);
  } catch (err) {
    console.error("[stock] exception:", err instanceof Error ? err.message : err, "orderId:", orderId);
  }
}
