"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Eye, BookOpen } from "lucide-react";
import type { BlogPost } from "@/types";
import Modal from "@/components/admin/Modal";
import BlogPostForm from "./BlogPostForm";
import { createBlogPost, updateBlogPost, deleteBlogPost, togglePublished } from "@/lib/actions/blog";

interface Props { posts: BlogPost[] }

export default function BlogClient({ posts }: Props) {
  const [open, setOpen] = useState<"create" | BlogPost | null>(null);
  const [, startTransition] = useTransition();

  function handleDelete(id: string, title: string) {
    if (!confirm(`Supprimer l'article "${title}" ? Cette action est irréversible.`)) return;
    startTransition(async () => { await deleteBlogPost(id); });
  }

  function handleTogglePublished(id: string, published: boolean) {
    startTransition(async () => { await togglePublished(id, published); });
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#1A1A1A]">Blog</h1>
          <p className="text-sm opacity-50 mt-1">
            {posts.length} article{posts.length !== 1 ? "s" : ""} ·{" "}
            {posts.filter((p) => p.published).length} publié{posts.filter((p) => p.published).length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setOpen("create")}
          className="flex items-center gap-2 font-heading font-semibold px-5 py-2.5 rounded-xl text-sm text-white hover:opacity-90 transition-all"
          style={{ backgroundColor: "#2D5016" }}
        >
          <Plus size={16} /> Nouvel article
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E0D5C8] shadow-sm overflow-hidden">
        {posts.length === 0 ? (
          <div className="text-center py-16 opacity-40">
            <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-heading font-semibold text-lg">Aucun article</p>
            <p className="text-sm mt-1">Rédigez votre premier article de blogue.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: "#F5F5F5" }}>
              <tr>
                {["Titre", "Auteur", "Date", "Tags", "Statut", "Actions"].map((h) => (
                  <th key={h} className="text-left px-6 py-4 font-semibold opacity-50 uppercase tracking-wider text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D5C8]">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium max-w-xs truncate">{post.title}</p>
                    <p className="text-xs opacity-40 mt-0.5 font-mono">/blog/{post.slug}</p>
                  </td>
                  <td className="px-6 py-4 text-xs opacity-50">{post.author}</td>
                  <td className="px-6 py-4 text-xs opacity-50 whitespace-nowrap">
                    {post.published_date
                      ? new Date(post.published_date).toLocaleDateString("fr-CA", { year: "numeric", month: "short", day: "numeric" })
                      : new Date(post.created_at).toLocaleDateString("fr-CA", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(post.tags ?? []).slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F0F5EC", color: "#2D5016" }}>{tag}</span>
                      ))}
                      {(post.tags ?? []).length > 2 && <span className="text-xs opacity-40">+{(post.tags ?? []).length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleTogglePublished(post.id, post.published)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-opacity hover:opacity-70 ${post.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                      title="Cliquer pour changer le statut"
                    >
                      {post.published ? "Publié" : "Brouillon"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => setOpen(post)} className="p-1.5 rounded-lg hover:bg-[#F0F5EC] transition-colors" title="Modifier">
                        <Pencil size={15} style={{ color: "#2D5016" }} />
                      </button>
                      <button
                        onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                        className="p-1.5 rounded-lg hover:bg-[#F0F5EC] transition-colors"
                        title="Aperçu"
                        disabled={!post.published}
                      >
                        <Eye size={15} className={post.published ? "opacity-60" : "opacity-20"} />
                      </button>
                      <button onClick={() => handleDelete(post.id, post.title)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Supprimer">
                        <Trash2 size={15} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open === "create" && (
        <Modal title="Nouvel article" onClose={() => setOpen(null)} size="lg">
          <BlogPostForm action={createBlogPost} onSuccess={() => setOpen(null)} />
        </Modal>
      )}

      {open && open !== "create" && (
        <Modal title={`Modifier — ${open.title}`} onClose={() => setOpen(null)} size="lg">
          <BlogPostForm action={updateBlogPost} post={open} onSuccess={() => setOpen(null)} />
        </Modal>
      )}
    </>
  );
}
