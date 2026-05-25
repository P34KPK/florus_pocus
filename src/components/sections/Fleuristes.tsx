"use client";

import { useState } from "react";
import Image from "next/image";
import { Grid, List, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { Product, ProductSeason } from "@/types";

interface FleuristesProps {
  products?: Product[];
}

const PLACEHOLDER_FLEURS: Product[] = [
  { id: "f1", name: "Rose Rouge", description: "Roses fraîchement coupées, parfum délicat.", category: "fleur", price: 8.5, stock: 50, image_url: null, season: "summer", active: true, created_at: "", updated_at: "" },
  { id: "f2", name: "Tulipe Rose", description: "Tulipes printanières, tiges longues et droites.", category: "fleur", price: 6, stock: 30, image_url: null, season: "spring", active: true, created_at: "", updated_at: "" },
  { id: "f3", name: "Tournesol", description: "Grands tournesols lumineux qui égaient n'importe quel espace.", category: "fleur", price: 5.5, stock: 40, image_url: null, season: "summer", active: true, created_at: "", updated_at: "" },
  { id: "f4", name: "Pivoine", description: "Pivoines luxuriantes au parfum envoûtant.", category: "fleur", price: 9, stock: 20, image_url: null, season: "spring", active: true, created_at: "", updated_at: "" },
  { id: "f5", name: "Zinnia Multicolore", description: "Zinnias vibrants dans toutes les couleurs de l'arc-en-ciel.", category: "fleur", price: 4.5, stock: 60, image_url: null, season: "summer", active: true, created_at: "", updated_at: "" },
  { id: "f6", name: "Dahlia Bordeaux", description: "Dahlias profonds aux pétales veloutés.", category: "fleur", price: 7.5, stock: 15, image_url: null, season: "fall", active: true, created_at: "", updated_at: "" },
  { id: "f7", name: "Aster Mauve", description: "Asters d'automne au bleu-mauve magnifique.", category: "fleur", price: 5, stock: 25, image_url: null, season: "fall", active: true, created_at: "", updated_at: "" },
  { id: "f8", name: "Lisianthus Blanc", description: "Lisianthus élégants, ressemblent aux roses.", category: "fleur", price: 8, stock: 18, image_url: null, season: "summer", active: true, created_at: "", updated_at: "" },
  { id: "f9", name: "Cosmos Rose", description: "Cosmos légers et aériens, parfaits pour les bouquets sauvages.", category: "fleur", price: 4, stock: 45, image_url: null, season: "summer", active: true, created_at: "", updated_at: "" },
  { id: "f10", name: "Statice Violet", description: "Statice séchable, idéal pour compositions durables.", category: "fleur", price: 5, stock: 35, image_url: null, season: "fall", active: true, created_at: "", updated_at: "" },
];

const SEASON_LABELS: Record<ProductSeason, string> = {
  spring: "Printemps", summer: "Été", fall: "Automne", winter: "Hiver",
};

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
      <div className="flex items-center gap-4 bg-white rounded-2xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden relative"
          style={{ backgroundColor: "#F0F5EC" }}>
          {product.image_url
            ? <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="64px" />
            : <div className="w-full h-full flex items-center justify-center"><FlowerPlaceholder size={36} /></div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="font-heading font-semibold">{product.name}</h4>
            {product.season && (
              <span className="text-xs px-2 py-0.5 rounded-full opacity-60" style={{ backgroundColor: "#F4D4B0" }}>
                {SEASON_LABELS[product.season]}
              </span>
            )}
          </div>
          <p className="text-sm opacity-55 truncate">{product.description}</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <p className="font-heading font-bold text-lg" style={{ color: "#2D5016" }}>{product.price.toFixed(2)} $</p>
          {product.stock === 0
            ? <span className="text-xs opacity-40">Épuisé</span>
            : <button onClick={handleAdd} className="font-heading font-semibold px-4 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "#2D5016" }}>
                {added ? "✓" : "Ajouter"}
              </button>
          }
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="aspect-square relative overflow-hidden" style={{ backgroundColor: "#F0F5EC" }}>
        {product.image_url
          ? <Image src={product.image_url} alt={product.name} fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" />
          : <div className="w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FlowerPlaceholder size={56} />
            </div>
        }
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-heading font-semibold leading-tight">{product.name}</h4>
          {product.season && (
            <span className="text-xs opacity-60 flex-shrink-0">{SEASON_LABELS[product.season]}</span>
          )}
        </div>
        <p className="text-sm opacity-55 mb-4 leading-relaxed line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <p className="font-heading font-bold text-xl" style={{ color: "#2D5016" }}>{product.price.toFixed(2)} $</p>
          {product.stock === 0
            ? <span className="text-xs opacity-40 bg-gray-100 px-3 py-1 rounded-full">Épuisé</span>
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

export default function Fleuristes({ products }: FleuristesProps) {
  const fleurs = (products && products.length > 0) ? products : PLACEHOLDER_FLEURS;
  const [view,   setView]   = useState<"grid" | "list">("grid");
  const [season, setSeason] = useState<ProductSeason | "all">("all");

  const seasons: (ProductSeason | "all")[] = ["all", "spring", "summer", "fall", "winter"];
  const filtered = season === "all" ? fleurs : fleurs.filter((p) => p.season === season);

  return (
    <section id="boutique-fleurs" className="section-padding relative" style={{ backgroundColor: "#FAFAF8", zIndex: 2 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: "#D4A574" }}>Boutique</p>
            <h2 className="font-heading font-bold text-4xl sm:text-5xl leading-tight" style={{ color: "#2D5016" }}>
              Fleurs coupées<br />fraîches
            </h2>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Season filter */}
            <div className="flex bg-white border border-border rounded-xl overflow-hidden shadow-sm">
              {seasons.map((s) => (
                <button key={s} onClick={() => setSeason(s)}
                  className="px-3 py-2 text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: season === s ? "#2D5016" : "transparent",
                    color: season === s ? "#fff" : "#1A1A1A",
                  }}>
                  {s === "all" ? "Tous" : SEASON_LABELS[s as ProductSeason]}
                </button>
              ))}
            </div>

            {/* View toggle */}
            <div className="flex bg-white border border-border rounded-xl overflow-hidden shadow-sm">
              <button onClick={() => setView("grid")} className="p-2 transition-colors"
                style={{ backgroundColor: view === "grid" ? "#2D5016" : "transparent", color: view === "grid" ? "#fff" : "#1A1A1A" }}>
                <Grid size={16} />
              </button>
              <button onClick={() => setView("list")} className="p-2 transition-colors"
                style={{ backgroundColor: view === "list" ? "#2D5016" : "transparent", color: view === "list" ? "#fff" : "#1A1A1A" }}>
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className={view === "grid"
          ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5"
          : "space-y-3"
        }>
          {filtered.map((p) => <ProductCard key={p.id} product={p} view={view} />)}
        </div>
      </div>
    </section>
  );
}
