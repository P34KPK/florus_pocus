"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  images: { image_url: string; sort_order: number }[];
  productName: string;
}

export default function ProductGallery({ images, productName }: Props) {
  const [active, setActive] = useState(0);

  if (images.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Grande image principale */}
      <div className="rounded-3xl overflow-hidden aspect-square relative" style={{ backgroundColor: "#F0F5EC" }}>
        <Image
          key={images[active].image_url}
          src={images[active].image_url}
          alt={`${productName} — photo ${active + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {/* Miniatures */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img.image_url}
              type="button"
              onClick={() => setActive(idx)}
              className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all"
              style={{
                border: idx === active ? "2px solid #2D5016" : "2px solid transparent",
                opacity: idx === active ? 1 : 0.55,
              }}
              aria-label={`Photo ${idx + 1}`}
            >
              <Image
                src={img.image_url}
                alt={`${productName} — miniature ${idx + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
