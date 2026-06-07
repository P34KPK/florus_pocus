"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ShoppingBag, CheckCircle, Loader2, Lock, Heart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/lib/actions/checkout";

declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => Promise<SquarePayments>;
    };
  }
}

interface SquarePayments { card: () => Promise<SquareCard> }
interface SquareCard {
  attach: (selector: string) => Promise<void>;
  tokenize: () => Promise<{ status: string; token?: string; errors?: { message: string }[] }>;
  destroy: () => Promise<void>;
}

const field = "block w-full border border-[#E0D5C8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2D5016] transition-colors bg-white";
const label = "block text-xs font-semibold text-[#1A1A1A] opacity-60 mb-1.5 uppercase tracking-wide";

const SQUARE_APP_ID   = process.env.NEXT_PUBLIC_SQUARE_APP_ID!;
const SQUARE_LOCATION = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!;

export default function CheckoutClient({ causeName }: { causeName: string }) {
  const { items, total, clearCart } = useCart();

  const [success,  setSuccess]  = useState(false);
  const [orderId,  setOrderId]  = useState<string | null>(null);
  const [error,    setError]    = useState<string | null>(null);
  const [pending,  setPending]  = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [roundUp,  setRoundUp]  = useState(false);

  const roundUpAmount = total % 1 === 0 ? 0 : Math.round((Math.ceil(total) - total) * 100) / 100;
  const finalTotal    = Math.round((total + (roundUp ? roundUpAmount : 0)) * 100) / 100;

  const cardRef = useRef<SquareCard | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    let destroyed = false;

    async function loadSquare() {
      if (!document.getElementById("square-sdk")) {
        const script = document.createElement("script");
        script.id  = "square-sdk";
        script.src = SQUARE_APP_ID.startsWith("sandbox-")
          ? "https://sandbox.web.squarecdn.com/v1/square.js"
          : "https://web.squarecdn.com/v1/square.js";
        script.async = true;
        document.head.appendChild(script);
        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Square SDK failed to load"));
        });
      } else {
        let tries = 0;
        while (!window.Square && tries < 20) {
          await new Promise((r) => setTimeout(r, 100));
          tries++;
        }
      }

      if (destroyed || !window.Square) return;

      try {
        const payments = await window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION);
        if (destroyed) return;
        const card = await payments.card();
        if (destroyed) return;
        await card.attach("#square-card-container");
        cardRef.current = card;
        setSdkReady(true);
      } catch (e) {
        console.error("[Square] init failed:", e);
        if (!destroyed) setError("Impossible de charger le formulaire de paiement. Rechargez la page.");
      }
    }

    loadSquare();
    return () => {
      destroyed = true;
      cardRef.current?.destroy();
      cardRef.current = null;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!cardRef.current) return;
    setError(null);
    setPending(true);

    let sourceId: string;
    try {
      const result = await cardRef.current.tokenize();
      if (result.status !== "OK" || !result.token) {
        setError(result.errors?.[0]?.message ?? "Carte refusée. Vérifiez vos informations.");
        setPending(false);
        return;
      }
      sourceId = result.token;
    } catch {
      setError("Erreur de tokenisation. Réessayez.");
      setPending(false);
      return;
    }

    const fd = new FormData(formRef.current!);
    fd.set("items", JSON.stringify(
      items.map((i) => ({
        referenceId: i.referenceId,
        name:        i.name,
        price:       i.price,
        quantity:    i.quantity,
        type:        i.type,
        metadata:    i.metadata,
      }))
    ));
    fd.set("round_up_amount", roundUp ? String(roundUpAmount) : "0");

    const orderResult = await createOrder({}, fd);
    if (!orderResult.success || !orderResult.orderId) {
      setError(orderResult.error ?? "Erreur lors de la commande.");
      setPending(false);
      return;
    }

    const payRes = await fetch("/api/square/payment", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ sourceId, orderId: orderResult.orderId, amountCAD: finalTotal }),
    });

    const payData = await payRes.json();
    if (!payRes.ok || !payData.success) {
      setError(payData.error ?? "Paiement refusé. Veuillez réessayer.");
      setPending(false);
      return;
    }

    clearCart();
    setOrderId(orderResult.orderId);
    setSuccess(true);
    setPending(false);
  };

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#FAFAF8" }}>
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "rgba(45,80,22,0.1)" }}>
            <CheckCircle size={40} style={{ color: "#2D5016" }} />
          </div>
          <h1 className="font-display font-bold text-3xl mb-3" style={{ color: "#2D5016" }}>Paiement réussi !</h1>
          <p className="text-sm opacity-60 mb-2">Merci pour votre achat. Vous recevrez une confirmation par courriel.</p>
          {orderId && <p className="text-xs opacity-40 mb-8 font-mono">#{orderId.slice(0, 8).toUpperCase()}</p>}
          <Link href="/"
            className="inline-flex items-center gap-2 font-heading font-semibold px-6 py-3 rounded-xl text-sm text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "#2D5016" }}>
            <ArrowLeft size={16} /> Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#FAFAF8" }}>
        <div className="text-center">
          <ShoppingBag size={48} className="opacity-20 mx-auto mb-4" />
          <h1 className="font-heading font-bold text-xl mb-2">Votre panier est vide</h1>
          <Link href="/boutique" className="text-sm underline opacity-50 hover:opacity-80 transition-opacity">
            Retourner à la boutique
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#FAFAF8" }}>
      <header className="border-b border-[#E0D5C8] bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl" style={{ color: "#2D5016" }}>Florus Pocus</Link>
          <span className="flex items-center gap-1.5 text-sm opacity-40 font-heading">
            <Lock size={13} /> Paiement sécurisé
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Formulaire */}
          <div className="lg:col-span-3">
            <h1 className="font-heading font-bold text-2xl mb-6" style={{ color: "#1A1A1A" }}>Vos informations</h1>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
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

              {/* Champ carte Square */}
              <div className="rounded-2xl p-5 border border-[#E0D5C8] bg-white">
                <label className={`${label} mb-3`}>Informations de paiement *</label>
                <div id="square-card-container" className="min-h-[90px]" style={{ minHeight: 90 }} />
                {!sdkReady && (
                  <div className="flex items-center gap-2 text-xs opacity-40 mt-2">
                    <Loader2 size={12} className="animate-spin" />
                    Chargement du formulaire sécurisé…
                  </div>
                )}
                <p className="text-xs opacity-40 mt-3 flex items-center gap-1">
                  <Lock size={10} />
                  Paiement sécurisé par Square — vos données ne transitent jamais par nos serveurs.
                </p>
              </div>

              {/* Arrondi pour la cause */}
              {roundUpAmount > 0 && (
                <label className="flex items-start gap-3 cursor-pointer rounded-2xl p-4 transition-colors"
                  style={{
                    backgroundColor: roundUp ? "rgba(45,80,22,0.06)" : "transparent",
                    border: `1px solid ${roundUp ? "rgba(45,80,22,0.2)" : "#E0D5C8"}`,
                  }}>
                  <input
                    type="checkbox"
                    checked={roundUp}
                    onChange={(e) => setRoundUp(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded flex-shrink-0 cursor-pointer accent-[#2D5016]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Heart size={13} style={{ color: "#D4A574" }} />
                      <span className="text-sm font-heading font-semibold" style={{ color: "#1A1A1A" }}>
                        Arrondir à {Math.ceil(total).toFixed(2)} $ pour {causeName}
                      </span>
                    </div>
                    <p className="text-xs opacity-50">
                      Ajouter {roundUpAmount.toFixed(2)} $ à votre total pour contribuer à la cause.
                    </p>
                  </div>
                </label>
              )}

              <button
                type="submit"
                disabled={pending || !sdkReady || items.length === 0}
                className="w-full font-heading font-semibold py-4 rounded-xl text-sm text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#2D5016" }}
              >
                {pending
                  ? <><Loader2 size={16} className="animate-spin" /> Traitement…</>
                  : <><Lock size={14} /> Payer {finalTotal.toFixed(2)} $</>
                }
              </button>
            </form>
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-2">
            <h2 className="font-heading font-bold text-lg mb-4" style={{ color: "#1A1A1A" }}>Récapitulatif</h2>
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
              {roundUp && roundUpAmount > 0 && (
                <div className="px-5 py-3 border-t border-[#E0D5C8] flex justify-between items-center text-sm">
                  <span className="flex items-center gap-1.5 opacity-60">
                    <Heart size={12} style={{ color: "#D4A574" }} />
                    Arrondi pour {causeName}
                  </span>
                  <span className="opacity-60">+{roundUpAmount.toFixed(2)} $</span>
                </div>
              )}
              <div className="px-5 py-4 border-t border-[#E0D5C8] flex justify-between items-center"
                style={{ backgroundColor: "#F0F5EC" }}>
                <span className="font-heading font-bold">Total</span>
                <span className="font-heading font-bold text-xl" style={{ color: "#2D5016" }}>
                  {finalTotal.toFixed(2)} $
                </span>
              </div>
            </div>

            <Link href="/boutique"
              className="flex items-center gap-1.5 text-xs opacity-40 hover:opacity-70 transition-opacity mt-4">
              <ArrowLeft size={13} /> Continuer les achats
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
