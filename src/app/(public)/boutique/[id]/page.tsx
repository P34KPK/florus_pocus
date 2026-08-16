import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail } from "lucide-react";
import { getProduct, getActiveProducts } from "@/lib/supabase-server";
import { isSoldOut, lowStockCount } from "@/lib/inventory";
import { formatPrix, effectiveUnitPrice } from "@/lib/pricing";
import { isFloristAuthenticated } from "@/lib/actions/florist";
import type { Metadata } from "next";
import AddToCartButton from "./AddToCartButton";
import ProductGallery from "./ProductGallery";

interface Props {
  params: Promise<{ id: string }>;
}

const fetchProduct = cache(async (id: string) => getProduct(id));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProduct(id);
  if (!product) return { title: "Produit introuvable" };
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/boutique/${id}` },
    ...(product.image_url ? { openGraph: { images: [product.image_url] } } : {}),
  };
}

const LEGACY_LABELS: Record<string, string> = {
  "fleurs-fraiches":   "Fleurs Fraîches",
  "comestibles":       "Comestibles",
  "serre-inter-ligna": "Serre Inter-Ligna",
  "garde-robe":        "La Garde-Robe",
};

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const [product, allProducts, isFlorist] = await Promise.all([
    fetchProduct(id),
    getActiveProducts(),
    isFloristAuthenticated(),
  ]);

  if (!product) notFound();

  const isDevis    = product.price_type === "devis";
  const isEpuise   = isSoldOut(product);
  const seasonLabel = product.season ? (LEGACY_LABELS[product.season] ?? product.season) : null;

  // Cette fiche est partagée entre la boutique publique et les cartes du
  // catalogue fleuriste. Elle doit afficher — et mettre au panier — le prix que
  // la caisse facturera réellement, sans quoi la commande est refusée pour écart
  // de total.
  const unitPrice   = effectiveUnitPrice(product, isFlorist);
  const hasDiscount = isFlorist && unitPrice < Number(product.price);

  const related = (allProducts as typeof product[])
    .filter((p) => p.id !== id && !p.florist_only)
    .slice(0, 4);

  return (
    <main className="min-h-screen pt-20" style={{ backgroundColor: "#FAFAF8" }}>

      {/* Fil d'Ariane */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <Link href="/boutique"
          className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all"
          style={{ color: "#2D5016" }}>
          <ArrowLeft size={15} /> Retour à la boutique
        </Link>
      </div>

      {/* Fiche produit */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Galerie */}
          {product.images && product.images.length > 0 ? (
            <ProductGallery images={product.images} productName={product.name} />
          ) : (
            <div className="rounded-3xl overflow-hidden aspect-square relative"
              style={{ backgroundColor: "#F0F5EC" }}>
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden>
                    {[0, 72, 144, 216, 288].map((deg) => (
                      <ellipse key={deg} cx="60" cy="60" rx="14" ry="32"
                        fill="#D4A574" opacity="0.4"
                        transform={`rotate(${deg} 60 60)`} />
                    ))}
                    <circle cx="60" cy="60" r="14" fill="#F4D4B0" opacity="0.7" />
                  </svg>
                </div>
              )}
            </div>
          )}

          {/* Détails */}
          <div className="py-4">

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {seasonLabel && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ backgroundColor: "#F0F5EC", color: "#2D5016" }}>
                  {seasonLabel}
                </span>
              )}
              {isDevis && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ backgroundColor: "#F4D4B0", color: "#2D5016" }}>
                  Sur devis
                </span>
              )}
              {isEpuise && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-400">
                  Épuisé
                </span>
              )}
            </div>

            <h1 className="font-display font-bold leading-tight mb-4"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#1A1A1A" }}>
              {product.name}
            </h1>

            <p className="text-base leading-relaxed mb-8 whitespace-pre-line break-words" style={{ color: "#555", overflowWrap: "anywhere" }}>
              {product.description}
            </p>

            {/* Prix + action */}
            {isDevis ? (
              <div className="space-y-4">
                <p className="text-sm" style={{ color: "#888" }}>
                  Le prix de ce produit varie selon les quantités et la saison. Contactez-nous pour obtenir une soumission personnalisée.
                </p>
                <Link
                  href={`/contact?produit=${encodeURIComponent(product.name)}`}
                  className="inline-flex items-center gap-2 font-heading font-semibold px-7 py-3.5 rounded-xl text-sm transition-all hover:opacity-90"
                  style={{ backgroundColor: "#2D5016", color: "#fff" }}>
                  <Mail size={16} /> Obtenir un prix
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <div>
                  <p className="font-display font-bold"
                    style={{ fontSize: "clamp(2.2rem, 4vw, 3rem)", color: "#2D5016", lineHeight: 1 }}>
                    {formatPrix(unitPrice)} $
                  </p>
                  {hasDiscount && (
                    <p className="text-sm mt-1">
                      <span className="line-through opacity-40">{formatPrix(Number(product.price))} $</span>
                      <span className="ml-2 font-semibold" style={{ color: "#D4A574" }}>Prix fleuriste</span>
                    </p>
                  )}
                </div>
                {isEpuise
                  ? <span className="text-sm opacity-50">Produit épuisé</span>
                  : <AddToCartButton product={product} unitPrice={unitPrice} />
                }
              </div>
            )}

            {/* Stock faible */}
            {!isDevis && lowStockCount(product) !== null && (
              <p className="text-sm mt-4 font-medium" style={{ color: "#D4A574" }}>
                ⚠️ Plus que {product.stock} en stock
              </p>
            )}

          </div>
        </div>
      </section>

      {/* Produits suggérés */}
      {related.length > 0 && (
        <section className="border-t border-[#E0D5C8] py-16" style={{ backgroundColor: "#F0F5EC" }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display font-bold mb-10"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "#2D5016" }}>
              Vous aimerez aussi
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((p) => (
                <Link key={p.id} href={`/boutique/${p.id}`} className="group block">
                  <div className="rounded-2xl overflow-hidden aspect-square relative mb-3"
                    style={{ backgroundColor: "#FDF5EC" }}>
                    {p.image_url ? (
                      <Image src={p.image_url} alt={p.name} fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, 25vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg viewBox="0 0 60 60" width="48" height="48" aria-hidden>
                          {[0, 72, 144, 216, 288].map((deg) => (
                            <ellipse key={deg} cx="30" cy="30" rx="7" ry="16"
                              fill="#D4A574" opacity="0.4"
                              transform={`rotate(${deg} 30 30)`} />
                          ))}
                          <circle cx="30" cy="30" r="7" fill="#F4D4B0" opacity="0.7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="font-heading font-semibold text-sm leading-tight group-hover:text-[#2D5016] transition-colors">
                    {p.name}
                  </p>
                  <p className="text-sm mt-0.5 font-medium" style={{ color: "#2D5016" }}>
                    {p.price_type === "devis" ? "Sur devis" : `${formatPrix(effectiveUnitPrice(p, isFlorist))} $`}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
