"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { BlogPost } from "@/types";

interface BlogPreviewProps {
  posts?: BlogPost[];
}

const PLACEHOLDER_POSTS: BlogPost[] = [
  { id: "b1", title: "Pourquoi les fleurs locales changent tout", slug: "pourquoi-fleurs-locales", content: "", featured_image_url: null, excerpt: "Les fleurs importées parcourent des milliers de kilomètres avant d'arriver chez vous. Découvrez pourquoi les fleurs locales sont meilleures pour vous, l'environnement et notre économie.", tags: ["local", "environnement"], author: "Florus Pocus", published: true, published_date: "2026-05-01", created_at: "", updated_at: "" },
  { id: "b2", title: "Comment prendre soin de vos bouquets", slug: "prendre-soin-bouquets", content: "", featured_image_url: null, excerpt: "Avec quelques gestes simples, vos bouquets peuvent durer une à deux semaines de plus. Nos conseils pro pour prolonger la vie de vos fleurs fraîches.", tags: ["conseils", "bouquets"], author: "Florus Pocus", published: true, published_date: "2026-04-15", created_at: "", updated_at: "" },
  { id: "b3", title: "Dans les coulisses d'une ferme florale", slug: "coulisses-ferme-florale", content: "", featured_image_url: null, excerpt: "Une journée avec nous à la ferme — de l'aube aux premières cueillettes, jusqu'à la préparation des commandes. Une vraie plongée dans notre quotidien.", tags: ["ferme", "vie"], author: "Florus Pocus", published: true, published_date: "2026-04-02", created_at: "", updated_at: "" },
  { id: "b4", title: "Les meilleures fleurs de l'automne québécois", slug: "fleurs-automne-quebec", content: "", featured_image_url: null, excerpt: "L'automne au Québec est une saison magique pour les fleurs. Dahlias, asters, et statices — voici nos coups de cœur pour cette saison.", tags: ["automne", "saison"], author: "Florus Pocus", published: true, published_date: "2026-03-20", created_at: "", updated_at: "" },
];

function ImagePlaceholderFeatured() {
  return (
    <div className="aspect-[16/10] overflow-hidden relative" style={{ backgroundColor: "#1a3009" }}>
      <svg viewBox="0 0 600 375" className="absolute inset-0 w-full h-full" style={{ opacity: 0.14 }}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <ellipse key={deg} cx="300" cy="188" rx="80" ry="160" fill="#D4A574"
            transform={`rotate(${deg} 300 188)`} />
        ))}
        <circle cx="300" cy="188" r="45" fill="#F4D4B0" />
      </svg>
    </div>
  );
}

function ImagePlaceholderSmall() {
  return (
    <div className="w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden relative" style={{ backgroundColor: "#E8F0E0" }}>
      <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full" style={{ opacity: 0.25 }}>
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <ellipse key={deg} cx="40" cy="40" rx="11" ry="25" fill="#2D5016"
            transform={`rotate(${deg} 40 40)`} />
        ))}
        <circle cx="40" cy="40" r="8" fill="#D4A574" />
      </svg>
    </div>
  );
}

function FeaturedCard({ post }: { post: BlogPost }) {
  const date = post.published_date
    ? new Date(post.published_date).toLocaleDateString("fr-CA", { year: "numeric", month: "long", day: "numeric" })
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="h-full"
    >
      <Link href={`/blog/${post.slug}`} className="group block h-full">
        <article className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow">
          <ImagePlaceholderFeatured />

          <div className="p-8 flex flex-col flex-1">
            {post.tags.length > 0 && (
              <div className="flex gap-2 mb-4">
                {post.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{ backgroundColor: "#F4D4B0", color: "#2D5016" }}>{tag}</span>
                ))}
              </div>
            )}

            <h3 className="font-display font-bold leading-tight mb-4 group-hover:text-[#2D5016] transition-colors"
              style={{ fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)", color: "#1A1A1A" }}>
              {post.title}
            </h3>

            <p className="text-sm opacity-60 leading-relaxed mb-6 flex-1 line-clamp-4">
              {post.excerpt}
            </p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
              <time className="text-xs opacity-40">{date}</time>
              <motion.span
                className="flex items-center gap-2 text-sm font-semibold"
                style={{ color: "#2D5016" }}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                Lire l&apos;article <ArrowRight size={15} />
              </motion.span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

function SmallCard({ post, index }: { post: BlogPost; index: number }) {
  const date = post.published_date
    ? new Date(post.published_date).toLocaleDateString("fr-CA", { month: "short", day: "numeric", year: "numeric" })
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ x: 4, transition: { duration: 0.2 } }}
    >
      <Link href={`/blog/${post.slug}`} className="group flex gap-4 items-start">
        <ImagePlaceholderSmall />

        <div className="flex-1 min-w-0">
          {post.tags[0] && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em]"
              style={{ color: "#D4A574" }}>{post.tags[0]}</span>
          )}
          <h4 className="font-heading font-semibold text-sm leading-snug mt-0.5 mb-1 group-hover:text-[#2D5016] transition-colors line-clamp-2">
            {post.title}
          </h4>
          <time className="text-xs opacity-35">{date}</time>
        </div>
      </Link>
    </motion.div>
  );
}

export default function BlogPreview({ posts }: BlogPreviewProps) {
  const articles = (posts && posts.length > 0) ? posts.slice(0, 4) : PLACEHOLDER_POSTS;
  const [featured, ...rest] = articles;

  return (
    <section id="blogue" className="section-padding relative" style={{ backgroundColor: "rgba(240,245,236,0.82)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", zIndex: 2 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-3"
              style={{ color: "#D4A574" }}>Actualités</p>
            <h2 className="font-display font-bold leading-tight"
              style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", color: "#2D5016" }}>
              Histoires<br />de la ferme
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/blog"
              className="flex items-center gap-2 font-heading font-semibold text-sm transition-all hover:gap-3"
              style={{ color: "#2D5016" }}>
              Voir tous les articles <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>

        {/* Grille magazine : 1 grande + 3 petites */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <FeaturedCard post={featured} />
          </div>

          <div className="lg:col-span-2 flex flex-col justify-between gap-0">
            <div className="bg-white rounded-3xl border border-border shadow-sm p-6 h-full flex flex-col justify-between gap-6">
              {rest.map((post, i) => (
                <div key={post.id}>
                  <SmallCard post={post} index={i} />
                  {i < rest.length - 1 && (
                    <div className="mt-6 border-t border-border" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
