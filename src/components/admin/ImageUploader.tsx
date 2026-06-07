"use client";

import { useRef, useState } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";

interface Props {
  name: string;          // nom du champ hidden dans le formulaire
  folder: string;        // "products" | "blog" | "pages"
  currentUrl?: string | null;
  label?: string;
  onUploadedUrl?: (url: string) => void; // callback optionnel — bypasse le champ caché
}

export default function ImageUploader({ name, folder, currentUrl, label = "Image", onUploadedUrl }: Props) {
  const [url, setUrl] = useState<string>(currentUrl ?? "");
  const [preview, setPreview] = useState<string>(currentUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);

    const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!ALLOWED.includes(file.type)) {
      setError("Format non supporté. Utilisez JPG, PNG, WebP, GIF ou AVIF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Fichier trop lourd. Maximum 10 Mo.");
      return;
    }

    setUploading(true);

    // Prévisualisation locale immédiate
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Erreur de téléversement.");
        setPreview(currentUrl ?? "");
      } else {
        setUrl(json.url);
        setPreview(json.url);
        onUploadedUrl?.(json.url);
      }
    } catch {
      setError("Impossible de contacter le serveur.");
      setPreview(currentUrl ?? "");
    } finally {
      setUploading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function clear() {
    setUrl("");
    setPreview("");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const labelStyle = "block text-xs font-semibold text-[#1A1A1A] opacity-60 mb-1 uppercase tracking-wide";

  return (
    <div>
      <p className={labelStyle}>{label}</p>

      {/* Champ caché qui porte l'URL finale dans le formulaire */}
      <input type="hidden" name={name} value={url} />

      {preview ? (
        /* Aperçu de l'image actuelle */
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Aperçu"
            className="h-36 w-auto rounded-xl object-cover border border-[#E0D5C8]"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-xl">
              <Loader2 size={20} className="animate-spin" style={{ color: "#2D5016" }} />
            </div>
          )}
          {!uploading && (
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="p-1.5 rounded-lg bg-white shadow border border-[#E0D5C8] hover:bg-gray-50 transition-colors"
                title="Changer l'image"
              >
                <Upload size={13} style={{ color: "#2D5016" }} />
              </button>
              <button
                type="button"
                onClick={clear}
                className="p-1.5 rounded-lg bg-white shadow border border-[#E0D5C8] hover:bg-red-50 transition-colors"
                title="Supprimer l'image"
              >
                <X size={13} className="text-red-500" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Zone de dépôt */
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex flex-col items-center justify-center gap-2 h-32 w-full rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:bg-[#F0F5EC]"
          style={{ borderColor: "#E0D5C8" }}
        >
          {uploading ? (
            <Loader2 size={22} className="animate-spin" style={{ color: "#2D5016" }} />
          ) : (
            <>
              <ImageIcon size={22} style={{ color: "#2D5016", opacity: 0.5 }} />
              <p className="text-xs text-center" style={{ color: "#999" }}>
                Cliquez ou déposez une image<br />
                <span style={{ opacity: 0.6 }}>JPG, PNG, WebP, GIF — max 10 Mo</span>
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
