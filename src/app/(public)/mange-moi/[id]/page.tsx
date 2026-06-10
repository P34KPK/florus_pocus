import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getMangeMoiItem } from "@/lib/supabase-server";
import type { MangeMoiItem } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

const fetchItem = cache(async (id: string) => getMangeMoiItem(id) as Promise<MangeMoiItem | null>);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = await fetchItem(id);
  if (!item) return { title: "Création introuvable" };
  return {
    title: item.name,
    description: item.description?.slice(0, 160) || `${item.name} — création comestible Florus Pocus.`,
    alternates: { canonical: `/mange-moi/${id}` },
    ...(item.image_url ? { openGraph: { images: [item.image_url] } } : {}),
  };
}

export default async function MangeMoiItemPage({ params }: Props) {
  const { id } = await params;
  const item = await fetchItem(id);

  if (!item) notFound();

  return (
    <main className="min-h-svh pt-24 pb-24" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link
          href="/mange-moi"
          className="inline-flex items-center gap-2 text-sm font-medium mb-10 hover:gap-3 transition-all"
          style={{ color: "#2D5016" }}
        >
          <ArrowLeft size={16} /> Retour à Mange Moi
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Photo */}
          <div className="aspect-[4/3] relative overflow-hidden rounded-3xl border border-[#E0D5C8]"
            style={{ backgroundColor: "#F0F5EC" }}>
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 80 80" width="96" height="96" aria-hidden>
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

          {/* Détails */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-3" style={{ color: "#D4A574" }}>
              De la ferme à votre assiette
            </p>
            <h1 className="font-display font-bold mb-6" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", color: "#2D5016" }}>
              {item.name}
            </h1>
            {item.description && (
              <p className="text-base leading-relaxed whitespace-pre-line" style={{ color: "#444", overflowWrap: "anywhere" }}>
                {item.description}
              </p>
            )}

            <div className="mt-10 pt-8 border-t border-[#E0D5C8]">
              <p className="text-sm opacity-60 mb-4">
                Une création qui vous intéresse ? Écrivez-nous pour en savoir plus.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 font-heading font-semibold px-6 py-3 rounded-full text-white text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#2D5016" }}
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
