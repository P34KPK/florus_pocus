import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Tag, X } from "lucide-react";
import { getPublishedBlogPosts } from "@/lib/supabase-server";
import type { BlogPost } from "@/types";

export const metadata = {
  title: "Blogue — L'univers horticole",
  description: "Ressources, découvertes et conseils de l'univers horticole par Florus Pocus. Nature, culture alimentaire, jardins et fleurs au Québec.",
  alternates: { canonical: "/blog" },
};

function PostCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  const date = post.published_date
    ? new Date(post.published_date).toLocaleDateString("fr-CA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className={`bg-white rounded-3xl border border-[#E0D5C8] overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow duration-300 ${featured ? "lg:flex-row" : ""}`}>
        <div className={`relative overflow-hidden flex-shrink-0 ${featured ? "lg:w-2/5 aspect-[4/3] lg:aspect-auto" : "aspect-[16/10]"}`}
          style={{ backgroundColor: "#1a3009" }}>
          {post.featured_image_url ? (
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              sizes={featured ? "(max-width: 1024px) 100vw, 40vw" : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <svg viewBox="0 0 600 375" className="w-full h-full" style={{ opacity: 0.12 }}>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <ellipse key={deg} cx="300" cy="188" rx="80" ry="160" fill="#D4A574"
                  transform={`rotate(${deg} 300 188)`} />
              ))}
              <circle cx="300" cy="188" r="45" fill="#F4D4B0" />
            </svg>
          )}
        </div>

        <div className="p-8 flex flex-col flex-1">
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium"
                  style={{ backgroundColor: "#F4D4B0", color: "#2D5016" }}>
                  <Tag size={10} /> {tag}
                </span>
              ))}
            </div>
          )}

          <h2 className={`font-display font-bold leading-tight mb-3 group-hover:text-[#2D5016] transition-colors ${featured ? "text-3xl lg:text-4xl" : "text-2xl"}`}
            style={{ color: "#1A1A1A" }}>
            {post.title}
          </h2>

          <p className="text-sm leading-relaxed mb-6 flex-1 line-clamp-3" style={{ color: "#666" }}>
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#E0D5C8]">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: "#2D5016" }}>
                {post.author.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: "#1A1A1A" }}>{post.author}</p>
                <time className="text-xs" style={{ color: "#999" }}>{date}</time>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all"
              style={{ color: "#2D5016" }}>
              Lire <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag: activeTag } = await searchParams;
  const posts = await getPublishedBlogPosts();
  const allPosts: BlogPost[] = posts as BlogPost[];

  // Extraire tous les tags uniques de tous les articles
  const allTags = Array.from(
    new Set(allPosts.flatMap((p) => p.tags))
  ).sort();

  // Filtrer par tag si sélectionné
  const articles = activeTag
    ? allPosts.filter((p) => p.tags.includes(activeTag))
    : allPosts;

  const [featured, ...rest] = articles;

  return (
    <main className="min-h-screen pt-24" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/#blogue"
          className="inline-flex items-center gap-2 text-sm font-medium mb-8 hover:gap-3 transition-all"
          style={{ color: "#2D5016" }}>
          <ArrowLeft size={16} /> Retour à l&apos;accueil
        </Link>

        <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: "#D4A574" }}>
          Actualités
        </p>
        <h1 className="font-display font-bold mb-4" style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", color: "#2D5016" }}>
          Histoires<br />de la ferme
        </h1>
        <p className="text-base max-w-xl mb-10" style={{ color: "#666" }}>
          Conseils, coulisses et actualités de notre floriculture écoresponsable au Québec.
        </p>

        {/* Filtre par tags */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            <Link
              href="/blog"
              className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-full border transition-colors font-medium"
              style={
                !activeTag
                  ? { backgroundColor: "#2D5016", color: "#fff", borderColor: "#2D5016" }
                  : { backgroundColor: "transparent", color: "#2D5016", borderColor: "#2D5016" }
              }
            >
              Tous
            </Link>
            {allTags.map((tag) => (
              <Link
                key={tag}
                href={activeTag === tag ? "/blog" : `/blog?tag=${encodeURIComponent(tag)}`}
                className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-full border transition-colors font-medium"
                style={
                  activeTag === tag
                    ? { backgroundColor: "#2D5016", color: "#fff", borderColor: "#2D5016" }
                    : { backgroundColor: "transparent", color: "#2D5016", borderColor: "#2D5016" }
                }
              >
                <Tag size={11} />
                {tag}
                {activeTag === tag && <X size={11} />}
              </Link>
            ))}
          </div>
        )}
      </div>

      {articles.length === 0 ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <p className="font-heading text-lg" style={{ color: "#999" }}>
            Aucun article trouvé{activeTag ? ` pour le tag « ${activeTag} »` : ""}.
          </p>
          {activeTag && (
            <Link href="/blog" className="text-sm mt-4 inline-block underline" style={{ color: "#2D5016" }}>
              Voir tous les articles
            </Link>
          )}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-8">
          {featured && <PostCard post={featured} featured={!activeTag} />}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
