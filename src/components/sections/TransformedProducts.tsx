"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";

const LEGACY_LABELS: Record<string, string> = {
  "fleurs-fraiches":   "Fleurs Fraîches",
  "comestibles":       "Comestibles",
  "serre-inter-ligna": "Serre Inter-Ligna",
  "garde-robe":        "La Garde-Robe",
};
function catLabel(season: string): string {
  return LEGACY_LABELS[season] ?? season;
}

interface TransformedProductsProps {
  products?: Product[];
}

const PLACEHOLDER_TRANSFORMES: Product[] = [
  { id: "t1", name: "Gelée de Roses",       description: "Gelée artisanale aux pétales de roses fraîches. Parfaite sur toast ou fromage.", category: "transforme", price: 12, florist_price: null, florist_only: false, stock: 24, image_url: null, season: null, active: true, created_at: "", updated_at: "" },
  { id: "t2", name: "Sirop de Lavande",     description: "Sirop naturel de lavande québécoise. Idéal pour cocktails, limonades et desserts.", category: "transforme", price: 14, florist_price: null, florist_only: false, stock: 18, image_url: null, season: null, active: true, created_at: "", updated_at: "" },
  { id: "t3", name: "Bouquet Séché Naturel",description: "Bouquet de fleurs séchées naturellement, pour une décoration durable.", category: "transforme", price: 28, florist_price: null, florist_only: false, stock: 10, image_url: null, season: null, active: true, created_at: "", updated_at: "" },
  { id: "t4", name: "Vinaigre de Fleurs",   description: "Vinaigre de cidre infusé aux fleurs sauvages. Pour salades et marinades.", category: "transforme", price: 11, florist_price: null, florist_only: false, stock: 20, image_url: null, season: null, active: true, created_at: "", updated_at: "" },
  { id: "t5", name: "Tisane de la Ferme",   description: "Mélange de plantes séchées de notre jardin pour une tisane apaisante.", category: "transforme", price: 9, florist_price: null, florist_only: false, stock: 30, image_url: null, season: null, active: true, created_at: "", updated_at: "" },
];

function TransformedCard({ product }: { product: Product }) {
  const { addProduct, openCart } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addProduct({ id: product.id, name: product.name, price: product.price, image_url: product.image_url });
    setAdded(true);
    setTimeout(() => { setAdded(false); openCart(); }, 1500);
  }

  return (
    <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="aspect-[4/3] relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #FDF5EC 0%, #F4D4B0 100%)" }}>
        {product.image_url
          ? <Image src={product.image_url} alt={product.name} fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 33vw" />
          : <div className="w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg viewBox="0 0 60 60" width="64" height="64" aria-hidden>
                {[0, 72, 144, 216, 288].map((deg) => (
                  <ellipse key={deg} cx="30" cy="30" rx="7" ry="16"
                    fill="#D4A574" opacity="0.45"
                    transform={`rotate(${deg} 30 30)`} />
                ))}
                <circle cx="30" cy="30" r="7" fill="#F4D4B0" opacity="0.7" />
              </svg>
            </div>
        }
      </div>
      <div className="p-6">
        <h4 className="font-heading font-bold text-lg mb-2">{product.name}</h4>
        <p className="text-sm opacity-60 leading-relaxed mb-4">{product.description}</p>
        <div className="flex items-center justify-between">
          <p className="font-heading font-bold text-2xl" style={{ color: "#2D5016" }}>{product.price.toFixed(2)} $</p>
          {product.stock === 0
            ? <span className="text-xs opacity-40 bg-gray-100 px-3 py-1 rounded-full">Épuisé</span>
            : <button onClick={handleAdd}
                className="flex items-center gap-2 font-heading font-semibold px-5 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90 hover:scale-105"
                style={{ backgroundColor: "#D4A574", color: "#1A1A1A" }}>
                <ShoppingBag size={14} />
                {added ? "Ajouté !" : "Ajouter"}
              </button>
          }
        </div>
        {product.stock && product.stock < 10 && product.stock > 0 && (
          <p className="text-xs mt-2 font-medium" style={{ color: "#D4A574" }}>
            ⚠️ Plus que {product.stock} en stock
          </p>
        )}
      </div>
    </div>
  );
}

export default function TransformedProducts({ products }: TransformedProductsProps) {
  const items = (products && products.length > 0) ? products : PLACEHOLDER_TRANSFORMES;
  const [category, setCategory] = useState<string>("all");

  const categories = Array.from(
    new Set(items.map((p) => p.season).filter(Boolean) as string[])
  );

  const filtered = category === "all" ? items : items.filter((p) => p.season === category);

  return (
    <section id="produits-transformes" className="section-padding relative" style={{ backgroundColor: "#FDF5EC", zIndex: 2 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: "#2D5016" }}>
              Artisanat floral
            </p>
            <h2 className="font-heading font-bold text-4xl sm:text-5xl leading-tight" style={{ color: "#2D5016" }}>
              Nos créations
            </h2>
            <p className="mt-4 max-w-xl text-base opacity-65">
              De la fleur au produit fini — gelées, sirops, bouquets séchés et plus encore, faits à la main sur la ferme.
            </p>
          </div>

          {categories.length > 0 && (
            <div className="flex bg-white border border-border rounded-xl overflow-hidden shadow-sm flex-shrink-0">
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {filtered.map((p) => <TransformedCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}
