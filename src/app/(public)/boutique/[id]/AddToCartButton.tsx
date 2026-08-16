"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";

export default function AddToCartButton({
  product,
  unitPrice,
}: {
  product: Product;
  /**
   * Prix réellement applicable à cet acheteur (prix de gros si fleuriste
   * authentifié). Calculé côté serveur : mettre `product.price` au panier alors
   * que la caisse facture le prix de gros faisait échouer la commande.
   */
  unitPrice: number;
}) {
  const { addProduct, openCart } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addProduct({ id: product.id, name: product.name, price: unitPrice, image_url: product.image_url });
    setAdded(true);
    setTimeout(() => { setAdded(false); openCart(); }, 1500);
  }

  return (
    <button
      onClick={handleAdd}
      className="flex items-center gap-2 font-heading font-semibold px-7 py-3.5 rounded-xl text-sm transition-all hover:opacity-90 hover:scale-105"
      style={{ backgroundColor: "#2D5016", color: "#fff" }}
    >
      {added ? <><Check size={16} /> Ajouté !</> : <><ShoppingBag size={16} /> Ajouter au panier</>}
    </button>
  );
}
