"use client";

import { useActionState, useEffect, useState } from "react";
import type { BlogPost } from "@/types";
import type { BlogFormState } from "@/lib/actions/blog";
import ImageUploader from "@/components/admin/ImageUploader";
import RichTextEditor from "@/components/admin/blog/RichTextEditor";

interface Props {
  action: (prev: BlogFormState, formData: FormData) => Promise<BlogFormState>;
  post?: BlogPost;
  onSuccess: () => void;
}

function toSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 200);
}

export default function BlogPostForm({ action, post, onSuccess }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(!!post);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  const field = "block w-full border border-[#E0D5C8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2D5016] transition-colors";
  const label = "block text-xs font-semibold text-[#1A1A1A] opacity-60 mb-1 uppercase tracking-wide";

  return (
    <form action={formAction} className="space-y-4">
      {post && <input type="hidden" name="id" value={post.id} />}

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{state.error}</p>
      )}

      <div>
        <label className={label}>Titre *</label>
        <input
          name="title"
          defaultValue={post?.title}
          required
          className={field}
          onChange={(e) => { if (!slugEdited) setSlug(toSlug(e.target.value)); }}
        />
      </div>

      <div>
        <label className={label}>Slug (URL) *</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-30">/blog/</span>
          <input
            name="slug"
            value={slug}
            required
            className={field + " pl-14"}
            onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
          />
        </div>
        <p className="text-xs opacity-40 mt-1">Lettres minuscules, chiffres et tirets seulement.</p>
      </div>

      <div>
        <label className={label}>Auteur *</label>
        <input name="author" defaultValue={post?.author ?? "admin"} required className={field} />
      </div>

      <div>
        <label className={label}>Extrait (max 160 car.) *</label>
        <textarea name="excerpt" defaultValue={post?.excerpt} required maxLength={160} rows={2} className={`${field} resize-none`} />
      </div>

      <div>
        <label className={label}>Contenu *</label>
        <RichTextEditor name="content" defaultValue={post?.content ?? ""} />
      </div>

      <div>
        <ImageUploader
          name="featured_image_url"
          folder="blog"
          currentUrl={post?.featured_image_url}
          label="Image principale de l'article"
        />
      </div>

      <div>
        <label className={label}>Tags (séparés par des virgules)</label>
        <input name="tags" defaultValue={(post?.tags ?? []).join(", ")} className={field} placeholder="fleurs, local, ferme" />
      </div>

      <div className="flex items-center gap-3">
        <label className={label + " mb-0"}>Statut</label>
        <select name="published" defaultValue={post?.published ? "true" : "false"} className="border border-[#E0D5C8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2D5016]">
          <option value="false">Brouillon</option>
          <option value="true">Publié</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full font-heading font-semibold py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: "#2D5016" }}
      >
        {pending ? "Enregistrement…" : post ? "Mettre à jour" : "Créer l'article"}
      </button>
    </form>
  );
}
