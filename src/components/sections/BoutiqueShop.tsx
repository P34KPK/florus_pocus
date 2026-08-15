"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Grid, List, ShoppingBag, Mail, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";
import { isSoldOut, lowStockCount } from "@/lib/inventory";

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
          fill="#D4A574" opacity="0.5"
          transform={`rotate(${deg} 30 30)`} />
      ))}
      <circle cx="30" cy="30" r="7" fill="#F4D4B0" opacity="0.8" />
    </svg>
  );
}

function ProductCard({ product, view }: { product: Product; view: "grid" | "list" }) {
  const { addProduct, openCart } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addProduct({ id: product.id, name: product.name, price: product.price, image_url: product.image_url });
    setAdded(true);
    setTimeout(() => { setAdded(false); openCart(); }, 1500);
  }

  if (view === "list") {
    return (
      <div className="relative bg-white rounded-2xl border border-border p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
        <Link href={`/boutique/${product.id}`} className="absolute inset-0 z-0 rounded-2xl" aria-label={product.name} />
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex-shrink-0 overflow-hidden relative" style={{ backgroundColor: "#F0F5EC" }}>
            {product.image_url
              ? <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="64px" />
              : <div className="w-full h-full flex items-center justify-center"><FlowerPlaceholder size={32} /></div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-heading font-semibold text-sm sm:text-base leading-tight">{product.name}</h4>
            <p className="text-xs sm:text-sm opacity-55 truncate mt-0.5">{product.description}</p>
            {/* Prix + bouton inline sur mobile */}
            <div className="relative z-10 flex items-center gap-2 mt-2">
              {product.price_type === "devis" ? (
                <>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F4D4B0", color: "#2D5016" }}>Sur devis</span>
                  <Link href={`/contact?produit=${encodeURIComponent(product.name)}`}
                    className="flex items-center gap-1 font-heading font-semibold px-3 py-1.5 rounded-xl text-xs transition-all hover:opacity-90"
                    style={{ backgroundColor: "#2D5016", color: "#fff" }}>
                    <Mail size={11} /> Prix
                  </Link>
                </>
              ) : (
                <>
                  <p className="font-heading font-bold text-base sm:text-lg" style={{ color: "#2D5016" }}>{product.price.toFixed(2)} $</p>
                  {isSoldOut(product)
                    ? <span className="text-xs opacity-40">Épuisé</span>
                    : <button onClick={handleAdd}
                        className="font-heading font-semibold px-3 py-1.5 rounded-xl text-xs text-white transition-all hover:opacity-90"
                        style={{ backgroundColor: "#2D5016" }}>
                        {added ? "✓" : "Ajouter"}
                      </button>
                  }
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-3xl border border-border shadow-sm overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
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
      </div>
      <div className="p-5">
        <h4 className="font-heading font-semibold leading-tight mb-1">{product.name}</h4>
        <p className="text-sm opacity-55 mb-4 leading-relaxed line-clamp-2">{product.description}</p>
        <div className="relative z-10 flex items-center justify-between">
          {product.price_type === "devis" ? (
            <div className="flex flex-col gap-2 w-full">
              <span className="self-start text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: "#F4D4B0", color: "#2D5016" }}>Sur devis</span>
              <Link href={`/contact?produit=${encodeURIComponent(product.name)}`}
                className="flex items-center justify-center gap-1.5 font-heading font-semibold px-3 py-2 rounded-xl text-xs sm:text-sm transition-all hover:opacity-90 whitespace-nowrap"
                style={{ backgroundColor: "#2D5016", color: "#fff" }}>
                <Mail size={12} /> Obtenir un prix
              </Link>
            </div>
          ) : (
            <>
              <p className="font-heading font-bold text-xl" style={{ color: "#2D5016" }}>{product.price.toFixed(2)} $</p>
              {isSoldOut(product)
                ? <span className="text-xs opacity-40 bg-gray-100 px-3 py-1 rounded-full">Épuisé</span>
                : <button onClick={handleAdd}
                    className="relative z-10 flex items-center gap-1.5 font-heading font-semibold px-4 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90 hover:scale-105"
                    style={{ backgroundColor: "#2D5016" }}>
                    <ShoppingBag size={14} />
                    {added ? "Ajouté !" : "Ajouter"}
                  </button>
              }
            </>
          )}
        </div>
        {lowStockCount(product) !== null && (
          <p className="text-xs mt-2 font-medium" style={{ color: "#D4A574" }}>
            ⚠️ Plus que {product.stock} en stock
          </p>
        )}
      </div>
    </div>
  );
}

interface BoutiqueShopProps {
  products: Product[];
  title?: string;
  surtitle?: string;
  subtitle?: string;
}

export default function BoutiqueShop({ products, title, surtitle, subtitle }: BoutiqueShopProps) {
  const [view, setView]         = useState<"grid" | "list">("grid");
  const [category, setCategory] = useState<string>("all");

  const categories = Array.from(
    new Set(products.map((p) => p.season).filter(Boolean) as string[])
  );

  const filtered = category === "all" ? products : products.filter((p) => p.season === category);

  return (
    <section className="section-padding relative" style={{ backgroundColor: "#FAFAF8", zIndex: 2 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: "#D4A574" }}>
            {surtitle || "Boutique"}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="font-heading font-bold text-4xl sm:text-5xl leading-tight" style={{ color: "#2D5016" }}>
                {title || "Nos produits"}
              </h2>
              {subtitle && <p className="mt-3 max-w-xl text-base opacity-65">{subtitle}</p>}
            </div>
            {/* Shipping badge — compact sur mobile, plus large sur desktop */}
            <div className="flex items-center gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-border bg-white shadow-sm self-start sm:self-auto flex-shrink-0">
              <Truck size={13} style={{ color: "#2D5016", flexShrink: 0 }} />
              <span className="opacity-70">
                Livraison locale · <strong>9,99 $</strong> · Gratuite dès <strong>100 $</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Mobile filters — barre scrollable horizontale, une seule ligne */}
        <div className="md:hidden mb-5 -mx-4 px-4">
          <div
            className="flex items-center gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
          >
            {/* Category pills */}
            <button onClick={() => setCategory("all")}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all border border-border"
              style={{ backgroundColor: category === "all" ? "#2D5016" : "#fff", color: category === "all" ? "#fff" : "#1A1A1A" }}>
              Tous
            </button>
            {categories.map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all border border-border"
                style={{ backgroundColor: category === c ? "#2D5016" : "#fff", color: category === c ? "#fff" : "#1A1A1A" }}>
                {catLabel(c)}
              </button>
            ))}
            {/* Séparateur */}
            <div className="flex-shrink-0 w-px h-6 bg-border mx-1" />
            {/* View toggle */}
            <div className="flex-shrink-0 flex bg-white border border-border rounded-xl overflow-hidden shadow-sm">
              <button onClick={() => setView("grid")} className="p-2 transition-colors" aria-label="Grille"
                style={{ backgroundColor: view === "grid" ? "#2D5016" : "transparent", color: view === "grid" ? "#fff" : "#1A1A1A" }}>
                <Grid size={16} />
              </button>
              <button onClick={() => setView("list")} className="p-2 transition-colors" aria-label="Liste"
                style={{ backgroundColor: view === "list" ? "#2D5016" : "transparent", color: view === "list" ? "#fff" : "#1A1A1A" }}>
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop: sidebar + grid */}
        <div className="flex gap-10 lg:gap-14">

          {/* Sidebar */}
          <aside className="w-44 flex-shrink-0 hidden md:flex flex-col">
            <div className="flex items-center gap-1 mb-6 bg-white border border-border rounded-xl overflow-hidden shadow-sm w-fit">
              <button onClick={() => setView("grid")} className="p-2 transition-colors" aria-label="Grille"
                style={{ backgroundColor: view === "grid" ? "#2D5016" : "transparent", color: view === "grid" ? "#fff" : "#1A1A1A" }}>
                <Grid size={16} />
              </button>
              <button onClick={() => setView("list")} className="p-2 transition-colors" aria-label="Liste"
                style={{ backgroundColor: view === "list" ? "#2D5016" : "transparent", color: view === "list" ? "#fff" : "#1A1A1A" }}>
                <List size={16} />
              </button>
            </div>

            {categories.length > 0 && (
              <nav>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-3 opacity-40">Catégories</p>
                <ul className="space-y-0.5">
                  <li>
                    <button onClick={() => setCategory("all")}
                      className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                      style={{ backgroundColor: category === "all" ? "#2D5016" : "transparent", color: category === "all" ? "#fff" : "#1A1A1A" }}>
                      Tous
                    </button>
                  </li>
                  {categories.map((c) => (
                    <li key={c}>
                      <button onClick={() => setCategory(c)}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{ backgroundColor: category === c ? "#2D5016" : "transparent", color: category === c ? "#fff" : "#1A1A1A" }}>
                        {catLabel(c)}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <p className="mt-8 text-xs opacity-35 leading-relaxed">
              Livraison locale seulement — les fleurs fraîches ne sont pas expédiées par la poste.
            </p>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            <div className={view === "grid"
              ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5"
              : "space-y-3"
            }>
              {filtered.map((p) => <ProductCard key={p.id} product={p} view={view} />)}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
