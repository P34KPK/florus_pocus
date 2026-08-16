"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, Trash2, Plus, Minus, ShoppingBag, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { PricingConfig } from "@/lib/pricing";
import { formatPrix } from "@/lib/pricing";

export default function CartDrawer({ pricing }: { pricing: PricingConfig }) {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total } = useCart();

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeCart(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeCart]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={closeCart}
          aria-hidden
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] lg:w-[480px] z-50 flex flex-col shadow-2xl transition-transform duration-400 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ backgroundColor: "#FAFAF8" }}
        aria-label="Panier"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} style={{ color: "#2D5016" }} />
            <h2 className="font-heading font-bold text-lg">Mon Panier</h2>
          </div>
          <button onClick={closeCart} className="p-2 rounded-full hover:bg-accent/30 transition-colors" aria-label="Fermer">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <ShoppingBag size={48} className="opacity-20 mb-4" />
              <p className="font-heading font-semibold text-lg opacity-50">Votre panier est vide</p>
              <p className="text-sm opacity-40 mt-1">Ajoutez des fleurs pour commencer !</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.cartId} className="flex gap-4 bg-white rounded-xl p-4 shadow-sm border border-border">
                {/* Image */}
                <div className="relative w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden" style={{ backgroundColor: "#F4D4B0" }}>
                  {item.imageUrl
                    ? <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <svg viewBox="0 0 60 60" width="32" height="32" aria-hidden>
                          {[0,72,144,216,288].map((deg) => (
                            <ellipse key={deg} cx="30" cy="30" rx="7" ry="16" fill="#D4A574" opacity="0.6" transform={`rotate(${deg} 30 30)`} />
                          ))}
                          <circle cx="30" cy="30" r="7" fill="#F4D4B0" />
                        </svg>
                      </div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-sm leading-tight truncate">{item.name}</p>
                  {item.metadata?.dropoff_point_name && (
                    <p className="text-xs opacity-50 mt-0.5">{item.metadata.dropoff_point_name}</p>
                  )}
                  {item.metadata?.event_date && (
                    <p className="text-xs opacity-50 mt-0.5">
                      {new Date(item.metadata.event_date).toLocaleDateString("fr-CA", { month: "long", day: "numeric" })}
                    </p>
                  )}
                  <p className="text-sm font-semibold mt-1" style={{ color: "#2D5016" }}>
                    {formatPrix((item.price * item.quantity))} $
                  </p>
                </div>

                {/* Quantity + Remove */}
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => removeItem(item.cartId)} className="text-red-400 hover:text-red-600 transition-colors" aria-label="Retirer">
                    <Trash2 size={15} />
                  </button>
                  {item.type === "product" && (
                    <div className="flex items-center gap-2 mt-auto">
                      <button
                        onClick={() => item.quantity > 1 ? updateQuantity(item.cartId, item.quantity - 1) : removeItem(item.cartId)}
                        className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-accent/30 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                        className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-accent/30 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-heading font-semibold">Sous-total</span>
              <span className="font-heading font-bold text-xl" style={{ color: "#2D5016" }}>
                {formatPrix(total)} $
              </span>
            </div>
            <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: "#F4D4B0", color: "#2D5016" }}>
              <span className="flex items-center gap-1.5 font-semibold">
                <Truck size={12} />
                Livraison locale
              </span>
              <span className="font-semibold">
                {total >= pricing.freeDeliveryThreshold
                  ? "Gratuite ✓"
                  : `${formatPrix(pricing.deliveryFee)} $`}
              </span>
            </div>
            <p className="text-center text-xs opacity-40">
              {pricing.taxesEnabled ? "Taxes et livraison calculées à la caisse" : "Livraison calculée à la caisse"}
            </p>
            <a
              href="/checkout"
              className="block w-full text-center font-heading font-semibold py-3.5 px-6 rounded-xl text-white transition-all hover:opacity-90 hover:scale-[1.01]"
              style={{ backgroundColor: "#2D5016" }}
            >
              Passer la commande
            </a>
            <p className="text-center text-xs opacity-40">Paiement sécurisé via Square</p>
          </div>
        )}
      </aside>
    </>
  );
}
