import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getMangeMoiItems, getPublishedPage } from "@/lib/supabase-server";
import type { MangeMoiItem } from "@/types";

export const metadata = {
  title: "Mange Moi",
  description: "Créations comestibles et approvisionnement local par Florus Pocus. Mise en relation avec un réseau de producteurs pour projets culinaires et alimentaires au Québec.",
  alternates: { canonical: "/mange-moi" },
};

function ItemCard({ item }: { item: MangeMoiItem }) {
  return (
    <article className="bg-white rounded-3xl border border-[#E0D5C8] overflow-hidden group hover:shadow-xl transition-shadow duration-300">
      <div className="aspect-[4/3] relative overflow-hidden" style={{ backgroundColor: "#F0F5EC" }}>
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 80 80" width="80" height="80" aria-hidden>
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <ellipse key={deg} cx="40" cy="40" rx="10" ry="22"
                  fill="#D4A574" opacity="0.3"
                  transform={`rotate(${deg} 40 40)`} />
              ))}
              <circle cx="40" cy="40" r="10" fill="#F4D4B0" opacity="0.6" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-heading font-bold text-xl mb-3" style={{ color: "#1A1A1A" }}>
          {item.name}
        </h3>
        {item.description && (
          <p className="text-sm leading-relaxed" style={{ color: "#666" }}>
            {item.description}
          </p>
        )}
      </div>
    </article>
  );
}

export default async function MangeMoiPage() {
  const [items, page] = await Promise.all([
    getMangeMoiItems() as Promise<MangeMoiItem[]>,
    getPublishedPage("mange-moi"),
  ]);

  const pageTitle = page?.title ?? "Mange Moi";
  const pageDesc  = page?.description ?? "Nos créations comestibles, faites à la main sur la ferme avec les fleurs et plantes de saison.";

  return (
    <main className="min-h-svh pt-24 pb-24" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium mb-10 hover:gap-3 transition-all"
          style={{ color: "#2D5016" }}
        >
          <ArrowLeft size={16} /> Retour à l&apos;accueil
        </Link>

        <div className="mb-14">
          {page?.featured_image_url && (
            <div className="relative w-full h-56 sm:h-72 rounded-3xl overflow-hidden mb-10">
              <Image
                src={page.featured_image_url}
                alt={pageTitle}
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 1280px"
                priority
              />
            </div>
          )}
          <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-3" style={{ color: "#D4A574" }}>
            De la ferme à votre assiette
          </p>
          <h1 className="font-display font-bold mb-4" style={{ fontSize: "clamp(2.8rem, 7vw, 6rem)", color: "#2D5016" }}>
            {pageTitle}
          </h1>
          <p className="text-base max-w-xl leading-relaxed" style={{ color: "#666" }}>
            {pageDesc}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-heading text-lg" style={{ color: "#999" }}>
              Notre catalogue arrive bientôt.
            </p>
            <p className="text-sm mt-2" style={{ color: "#bbb" }}>Revenez nous voir !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
