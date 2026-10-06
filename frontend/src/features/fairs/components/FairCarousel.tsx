// src/features/fairs/components/FairCarousel.tsx

"use client";

import { Carousel, type CarouselShot } from "@/components/ui/Carousel";
import type { Fair } from "@/features/fairs/types/fair.types";

// ─── UTILITARIOS ───────────────────────────────────────────

/* Las ferias no llevan siempre foto; un fallback temático por
   ID (igual que FairCard) evita que dos cartas se vean igual. */
const FALLBACKS = [
  "https://images.unsplash.com/photo-1531058020387-3be344559be6?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80",
];

function getImageUrl(fair: Fair): string {
  if (fair.image_url) {
    if (fair.image_url.startsWith("http")) return fair.image_url;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return `${apiUrl}${fair.image_url}`;
  }
  const index = fair.id
    ? fair.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % FALLBACKS.length
    : 0;
  return FALLBACKS[index];
}

// ─── COMPONENTE ────────────────────────────────────────────

interface FairCarouselProps {
  fairs: Fair[];
  /** Feria actualmente seleccionada (id) */
  value: string | null;
  /** Se dispara cuando el carrusel se asienta sobre una carta */
  onChange: (fair: Fair) => void;
}

export function FairCarousel({ fairs, value, onChange }: FairCarouselProps) {
  const shots: CarouselShot[] = fairs.map((fair) => ({
    name: fair.id,
    src: getImageUrl(fair),
    label: fair.name,
    meta: fair.location,
  }));

  const initialIndex = Math.max(0, fairs.findIndex((f) => f.id === value));

  return (
    <Carousel
      shots={shots}
      initialIndex={initialIndex}
      onChange={(index) => onChange(fairs[index % fairs.length])}
      float={12}
      sink={50}
      settle={50}
    />
  );
}

export default FairCarousel;