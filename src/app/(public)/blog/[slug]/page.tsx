import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, User, Tag } from "lucide-react";
import Image from "next/image";
import sanitizeHtml from "sanitize-html";
import { getBlogPost, getPublishedBlogPosts } from "@/lib/supabase-server";
import type { Metadata } from "next";

const ALLOWED_HTML: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "figure", "figcaption", "h1", "h2", "h3", "h4", "s"]),
  allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ["src", "alt", "title", "width", "height"], a: ["href", "target", "rel"], "*": ["class", "style"] },
};

interface Props {
  params: Promise<{ slug: string }>;
}

/* Mémoïsé par requête — partagé entre generateMetadata et le composant */
const getPost = cache(async (slug: string) => getBlogPost(slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return { title: "Article introuvable" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      ...(post.featured_image_url ? { images: [post.featured_image_url] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([
    getPost(slug),
    getPublishedBlogPosts(),
  ]);

  if (!post) notFound();

  const date = post.published_date
    ? new Date(post.published_date).toLocaleDateString("fr-CA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const related = (allPosts as typeof post[])
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  return (
    <main className="min-h-screen pt-24" style={{ backgroundColor: "#FAFAF8" }}>

        {/* Fil d'Ariane */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <Link href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all"
            style={{ color: "#2D5016" }}>
            <ArrowLeft size={15} /> Tous les articles
          </Link>
        </div>

        {/* Image hero de l'article */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="relative rounded-3xl overflow-hidden aspect-[21/9]" style={{ backgroundColor: "#1a3009" }}>
            {post.featured_image_url ? (
              <Image
                src={post.featured_image_url}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover"
              />
            ) : (
              <svg viewBox="0 0 1200 514" className="w-full h-full" style={{ opacity: 0.1 }}>
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                  <ellipse key={deg} cx="600" cy="257" rx="120" ry="240" fill="#D4A574"
                    transform={`rotate(${deg} 600 257)`} />
                ))}
                <circle cx="600" cy="257" r="65" fill="#F4D4B0" />
              </svg>
            )}
          </div>
        </div>

        {/* Contenu de l'article */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag: string) => (
                <span key={tag} className="flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium"
                  style={{ backgroundColor: "#F4D4B0", color: "#2D5016" }}>
                  <Tag size={10} /> {tag}
                </span>
              ))}
            </div>
          )}

          {/* Titre */}
          <h1 className="font-display font-bold leading-tight mb-6"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", color: "#1A1A1A" }}>
            {post.title}
          </h1>

          {/* Méta */}
          <div className="flex flex-wrap items-center gap-6 pb-8 mb-10 border-b border-[#E0D5C8]">
            <div className="flex items-center gap-2 text-sm" style={{ color: "#666" }}>
              <User size={14} style={{ color: "#2D5016" }} />
              <span>{post.author}</span>
            </div>
            {date && (
              <div className="flex items-center gap-2 text-sm" style={{ color: "#666" }}>
                <CalendarDays size={14} style={{ color: "#2D5016" }} />
                <time>{date}</time>
              </div>
            )}
          </div>

          {/* Corps du texte */}
          <div className="prose-farm" style={{ color: "#333" }}>
            {post.content ? (
              /* Le contenu vient de TipTap (HTML admin uniquement) */
              <div
                className="prose prose-lg max-w-none leading-relaxed"
                style={{
                  fontSize: "1.0625rem",
                  lineHeight: "1.85",
                  color: "#333",
                }}
                // Le contenu est exclusivement créé par les administrateurs authentifiés
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content, ALLOWED_HTML) }}
              />
            ) : (
              <p className="text-base leading-relaxed" style={{ color: "#666" }}>
                {post.excerpt}
              </p>
            )}
          </div>

          {/* CTA retour */}
          <div className="mt-16 pt-8 border-t border-[#E0D5C8] flex items-center justify-between flex-wrap gap-4">
            <Link href="/blog"
              className="inline-flex items-center gap-2 font-heading font-semibold text-sm hover:gap-3 transition-all"
              style={{ color: "#2D5016" }}>
              <ArrowLeft size={15} /> Tous les articles
            </Link>
            <Link href="/"
              className="inline-flex items-center gap-2 font-heading font-semibold text-sm px-5 py-2.5 rounded-full text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#2D5016" }}>
              Découvrir nos fleurs
            </Link>
          </div>
        </article>

        {/* Articles connexes */}
        {related && related.length > 0 && (
          <section className="border-t border-[#E0D5C8] py-16" style={{ backgroundColor: "#F0F5EC" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-display font-bold mb-10 text-center"
                style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: "#2D5016" }}>
                À lire aussi
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((rel) => {
                  const relDate = rel.published_date
                    ? new Date(rel.published_date).toLocaleDateString("fr-CA", { month: "short", day: "numeric", year: "numeric" })
                    : "";
                  return (
                    <Link key={rel.id} href={`/blog/${rel.slug}`} className="group block">
                      <article className="bg-white rounded-2xl border border-[#E0D5C8] overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-[16/9] relative" style={{ backgroundColor: "#1a3009" }}>
                          {rel.featured_image_url ? (
                            <Image src={rel.featured_image_url} alt={rel.title} fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 768px) 100vw, 33vw" />
                          ) : (
                            <svg viewBox="0 0 400 225" className="w-full h-full" style={{ opacity: 0.1 }}>
                              {[0, 60, 120, 180, 240, 300].map((deg) => (
                                <ellipse key={deg} cx="200" cy="112" rx="50" ry="100" fill="#D4A574"
                                  transform={`rotate(${deg} 200 112)`} />
                              ))}
                              <circle cx="200" cy="112" r="30" fill="#F4D4B0" />
                            </svg>
                          )}
                        </div>
                        <div className="p-5">
                          {rel.tags?.[0] && (
                            <span className="text-[10px] font-semibold uppercase tracking-[0.1em]"
                              style={{ color: "#D4A574" }}>{rel.tags[0]}</span>
                          )}
                          <h3 className="font-heading font-semibold text-sm leading-snug mt-1 mb-2 group-hover:text-[#2D5016] transition-colors line-clamp-2">
                            {rel.title}
                          </h3>
                          <time className="text-xs" style={{ color: "#999" }}>{relDate}</time>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}
    </main>
  );
}
