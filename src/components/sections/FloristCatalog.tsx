"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Grid, List, ShoppingBag, Tag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";
import { isSoldOut } from "@/lib/inventory";
import { formatPrix } from "@/lib/pricing";

const LEGACY_LABELS: Record<string, string> = {
  "fleurs-fraiches":   "Fleurs Fraîches",
  "comestibles":       "Comestibles",
  "serre-inter-ligna": "Serre Inter-Ligna",
  "garde-robe":        "La Garde-Robe",
};
function catLabel(season: string): string {
  return LEGACY_LABELS[season] ?? season;
}

function FlowerPlaceholder({ size = 56 }: { size?: number }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden>
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse key={deg} cx="30" cy="30" rx="7" ry="16"
          fill="#D4A574" opacity="0.5" transform={`rotate(${deg} 30 30)`} />
      ))}
      <circle cx="30" cy="30" r="7" fill="#F4D4B0" opacity="0.8" />
    </svg>
  );
}

function ProductRow({ product }: { product: Product }) {
  const { addProduct, openCart } = useCart();
  const [added, setAdded] = useState(false);
  const displayPrice = product.florist_price ?? product.price;
  const hasDiscount  = product.florist_price !== null && product.florist_price < product.price;

  function handleAdd() {
    addProduct({ id: product.id, name: product.name, price: displayPrice, image_url: product.image_url });
    setAdded(true);
    setTimeout(() => { setAdded(false); openCart(); }, 1500);
  }

  return (
    <div className="relative flex items-center gap-4 bg-white rounded-2xl border border-[#E0D5C8] p-4 hover:shadow-md transition-shadow">
      <Link href={`/boutique/${product.id}`} className="absolute inset-0 z-0 rounded-2xl" aria-label={product.name} />
      <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden relative" style={{ backgroundColor: "#F0F5EC" }}>
        {product.image_url
          ? <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="64px" />
          : <div className="w-full h-full flex items-center justify-center"><FlowerPlaceholder size={36} /></div>
        }
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="font-heading font-semibold truncate">{product.name}</h4>
          {product.season && (
            <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#F4D4B0", color: "#2D5016" }}>
              {catLabel(product.season)}
            </span>
          )}
        </div>
        <p className="text-sm truncate" style={{ color: "#666" }}>{product.description}</p>
      </div>

      <div className="relative z-10 flex items-center gap-4 flex-shrink-0">
        <div className="text-right">
          <p className="font-heading font-bold text-lg" style={{ color: "#2D5016" }}>
            {formatPrix(displayPrice)} $
          </p>
          {hasDiscount && (
            <p className="text-xs line-through" style={{ color: "#bbb" }}>
              {formatPrix(product.price)} $
            </p>
          )}
        </div>
        {isSoldOut(product)
          ? <span className="text-xs px-3 py-2 rounded-xl bg-gray-100 text-gray-400">Épuisé</span>
          : <button onClick={handleAdd}
              className="font-heading font-semibold px-4 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "#2D5016" }}>
              {added ? "✓" : "Ajouter"}
            </button>
        }
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { addProduct, openCart } = useCart();
  const [added, setAdded] = useState(false);
  const displayPrice = product.florist_price ?? product.price;
  const hasDiscount  = product.florist_price !== null && product.florist_price < product.price;

  function handleAdd() {
    addProduct({ id: product.id, name: product.name, price: displayPrice, image_url: product.image_url });
    setAdded(true);
    setTimeout(() => { setAdded(false); openCart(); }, 1500);
  }

  return (
    <div className="relative bg-white rounded-3xl border border-[#E0D5C8] shadow-sm overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <Link href={`/boutique/${product.id}`} className="absolute inset-0 z-0 rounded-3xl" aria-label={product.name} />
      <div className="aspect-square relative overflow-hidden" style={{ backgroundColor: "#F0F5EC" }}>
        {product.image_url
          ? <Image src={product.image_url} alt={product.name} fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
          : <div className="w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FlowerPlaceholder size={56} />
            </div>
        }
        {hasDiscount && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: "#2D5016" }}>
            Prix pro
          </div>
        )}
      </div>
      <div className="p-5">
        <h4 className="font-heading font-semibold leading-tight mb-1">{product.name}</h4>
        <p className="text-sm mb-4 line-clamp-2" style={{ color: "#666" }}>{product.description}</p>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="font-heading font-bold text-xl" style={{ color: "#2D5016" }}>{formatPrix(displayPrice)} $</p>
            {hasDiscount && (
              <p className="text-xs line-through" style={{ color: "#bbb" }}>{formatPrix(product.price)} $</p>
            )}
          </div>
          {isSoldOut(product)
            ? <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-400">Épuisé</span>
            : <button onClick={handleAdd}
                className="flex items-center gap-1.5 font-heading font-semibold px-4 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90 hover:scale-105"
                style={{ backgroundColor: "#2D5016" }}>
                <ShoppingBag size={14} />
                {added ? "Ajouté !" : "Ajouter"}
              </button>
          }
        </div>
      </div>
    </div>
  );
}

interface Props { products: Product[] }

export default function FloristCatalog({ products }: Props) {
  const [view,     setView]     = useState<"grid" | "list">("list");
  const [category, setCategory] = useState("all");

  const categories = Array.from(new Set(products.map((p) => p.season).filter(Boolean) as string[]));
  const filtered   = category === "all" ? products : products.filter((p) => p.season === category);
  const withDiscount = products.filter((p) => p.florist_price !== null).length;

  return (
    <main className="min-h-screen pt-24 pb-24" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-3" style={{ color: "#D4A574" }}>
            Espace professionnel
          </p>
          <h1 className="font-display font-bold mb-3" style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", color: "#2D5016" }}>
            Catalogue fleuristes
          </h1>
          <p className="text-base" style={{ color: "#666" }}>
            Bienvenue dans votre espace partenaire. Les prix de gros s&apos;affichent automatiquement.
          </p>
          {withDiscount > 0 && (
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ backgroundColor: "#F0F5EC", color: "#2D5016" }}>
              <Tag size={14} />
              {withDiscount} produit{withDiscount > 1 ? "s" : ""} avec prix de gros
            </div>
          )}
        </div>

        {/* Contrôles */}
        <div className="flex items-center gap-3 flex-wrap mb-8">
          {categories.length > 0 && (
            <div className="flex bg-white border border-[#E0D5C8] rounded-xl overflow-hidden shadow-sm">
              <button onClick={() => setCategory("all")}
                className="px-3 py-2 text-xs font-semibold transition-all"
                style={{ backgroundColor: category === "all" ? "#2D5016" : "transparent", color: category === "all" ? "#fff" : "#1A1A1A" }}>
                Tous
              </button>
              {categories.map((c) => (
                <button key={c} onClick={() => setCategory(c)}
                  className="px-3 py-2 text-xs font-semibold transition-all"
                  style={{ backgroundColor: category === c ? "#2D5016" : "transparent", color: category === c ? "#fff" : "#1A1A1A" }}>
                  {catLabel(c)}
                </button>
              ))}
            </div>
          )}

          <div className="flex bg-white border border-[#E0D5C8] rounded-xl overflow-hidden shadow-sm ml-auto">
            <button onClick={() => setView("list")} className="p-2 transition-colors"
              style={{ backgroundColor: view === "list" ? "#2D5016" : "transparent", color: view === "list" ? "#fff" : "#1A1A1A" }}>
              <List size={16} />
            </button>
            <button onClick={() => setView("grid")} className="p-2 transition-colors"
              style={{ backgroundColor: view === "grid" ? "#2D5016" : "transparent", color: view === "grid" ? "#fff" : "#1A1A1A" }}>
              <Grid size={16} />
            </button>
          </div>
        </div>

        {/* Produits */}
        {filtered.length === 0 ? (
          <p className="text-center py-16" style={{ color: "#999" }}>Aucun produit disponible.</p>
        ) : view === "list" ? (
          <div className="space-y-3">
            {filtered.map((p) => <ProductRow key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </main>
  );
}
