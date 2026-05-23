"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/lib/actions/checkout";
import type { Metadata } from "next";

const field = "block w-full border border-[#E0D5C8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2D5016] transition-colors bg-white";
const label = "block text-xs font-semibold text-[#1A1A1A] opacity-60 mb-1.5 uppercase tracking-wide";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [state, formAction, pending] = useActionState(createOrder, {});
  const itemsRef = useRef<HTMLInputElement>(null);
  const router   = useRouter();

  useEffect(() => {
    if (itemsRef.current) {
      itemsRef.current.value = JSON.stringify(
        items.map((i) => ({
          referenceId: i.referenceId,
          name:        i.name,
          price:       i.price,
          quantity:    i.quantity,
          type:        i.type,
          metadata:    i.metadata,
        }))
      );
    }
  }, [items]);

  useEffect(() => {
    if (state.success) clearCart();
  }, [state.success, clearCart]);

  if (state.success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "#FAFAF8" }}>
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "rgba(45,80,22,0.1)" }}>
            <CheckCircle size={40} style={{ color: "#2D5016" }} />
          </div>
          <h1 className="font-display font-bold text-3xl mb-3" style={{ color: "#2D5016" }}>
            Commande reçue !
          </h1>
          <p className="text-sm opacity-60 mb-2">
            Merci pour votre commande. Nous vous contacterons dans les 24 heures pour confirmer
            et coordonner le paiement.
          </p>
          <p className="text-xs opacity-40 mb-8 font-mono">#{state.orderId?.slice(0, 8).toUpperCase()}</p>
          <Link href="/"
            className="inline-flex items-center gap-2 font-heading font-semibold px-6 py-3 rounded-xl text-sm text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "#2D5016" }}>
            <ArrowLeft size={16} /> Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    );
  }

  if (items.length === 0 && !state.success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "#FAFAF8" }}>
        <div className="text-center">
          <ShoppingBag size={48} className="opacity-20 mx-auto mb-4" />
          <h1 className="font-heading font-bold text-xl mb-2">Votre panier est vide</h1>
          <Link href="/#boutique-fleurs"
            className="text-sm underline opacity-50 hover:opacity-80 transition-opacity">
            Retourner à la boutique
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#FAFAF8" }}>
      {/* Header */}
      <header className="border-b border-[#E0D5C8] bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl" style={{ color: "#2D5016" }}>
            Florus Pocus
          </Link>
          <span className="text-sm opacity-40 font-heading">Paiement sécurisé</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Formulaire client */}
          <div className="lg:col-span-3">
            <h1 className="font-heading font-bold text-2xl mb-6" style={{ color: "#1A1A1A" }}>
              Vos informations
            </h1>

            <form action={formAction} className="space-y-4">
              <input ref={itemsRef} type="hidden" name="items" defaultValue="" />

              {state.error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {state.error}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={label}>Nom complet *</label>
                  <input name="name" required className={field} placeholder="Marie Tremblay" />
                </div>
                <div>
                  <label className={label}>Téléphone</label>
                  <input name="phone" type="tel" className={field} placeholder="+1 (418) 555-0000" />
                </div>
              </div>

              <div>
                <label className={label}>Adresse courriel *</label>
                <input name="email" type="email" required className={field} placeholder="marie@exemple.com" />
              </div>

              <div>
                <label className={label}>Adresse de livraison *</label>
                <input name="address" required className={field} placeholder="123 Rue Principale, Pont-Rouge, QC" />
              </div>

              <div>
                <label className={label}>Notes (optionnel)</label>
                <textarea name="notes" rows={3} className={`${field} resize-none`}
                  placeholder="Instructions spéciales, allergies, etc." />
              </div>

              {/* Notice Square */}
              <div className="rounded-2xl p-4 text-sm"
                style={{ backgroundColor: "rgba(45,80,22,0.06)", border: "1px solid rgba(45,80,22,0.12)" }}>
                <p className="font-semibold mb-1" style={{ color: "#2D5016" }}>Paiement à venir</p>
                <p className="opacity-60 text-xs leading-relaxed">
                  L&apos;intégration Square est en cours. Après votre commande, nous vous contacterons
                  dans les 24h pour finaliser le paiement de façon sécurisée.
                </p>
              </div>

              <button type="submit" disabled={pending || items.length === 0}
                className="w-full font-heading font-semibold py-4 rounded-xl text-sm text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#2D5016" }}>
                {pending
                  ? <><Loader2 size={16} className="animate-spin" /> Traitement…</>
                  : "Confirmer la commande"
                }
              </button>
            </form>
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-2">
            <h2 className="font-heading font-bold text-lg mb-4" style={{ color: "#1A1A1A" }}>
              Récapitulatif
            </h2>
            <div className="bg-white rounded-2xl border border-[#E0D5C8] shadow-sm overflow-hidden">
              <ul className="divide-y divide-[#E0D5C8]">
                {items.map((item) => (
                  <li key={item.cartId} className="flex justify-between items-start gap-3 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-semibold text-sm leading-tight">{item.name}</p>
                      {item.metadata?.dropoff_point_name && (
                        <p className="text-xs opacity-40 mt-0.5">{item.metadata.dropoff_point_name}</p>
                      )}
                      <p className="text-xs opacity-40 mt-0.5">Qté : {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-sm flex-shrink-0" style={{ color: "#2D5016" }}>
                      {(item.price * item.quantity).toFixed(2)} $
                    </p>
                  </li>
                ))}
              </ul>
              <div className="px-5 py-4 border-t border-[#E0D5C8] flex justify-between items-center"
                style={{ backgroundColor: "#F0F5EC" }}>
                <span className="font-heading font-bold">Total</span>
                <span className="font-heading font-bold text-xl" style={{ color: "#2D5016" }}>
                  {total.toFixed(2)} $
                </span>
              </div>
            </div>

            <Link href="/" className="flex items-center gap-1.5 text-xs opacity-40 hover:opacity-70 transition-opacity mt-4">
              <ArrowLeft size={13} /> Continuer les achats
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
