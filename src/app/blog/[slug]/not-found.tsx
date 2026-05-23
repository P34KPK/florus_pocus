import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BlogNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="text-center">
        <p className="font-display text-7xl font-bold mb-4" style={{ color: "#E0D5C8" }}>404</p>
        <h1 className="font-display font-bold text-2xl mb-3" style={{ color: "#1A1A1A" }}>
          Article introuvable
        </h1>
        <p className="text-sm mb-8" style={{ color: "#999" }}>
          Cet article n&apos;existe pas ou n&apos;est plus disponible.
        </p>
        <Link href="/blog"
          className="inline-flex items-center gap-2 font-heading font-semibold text-sm px-6 py-3 rounded-full text-white"
          style={{ backgroundColor: "#2D5016" }}>
          <ArrowLeft size={15} /> Retour au blogue
        </Link>
      </div>
    </div>
  );
}
