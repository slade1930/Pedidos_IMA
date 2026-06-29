// src/app/(shop)/products/[id]/page.tsx

"use client";

import { useParams } from "next/navigation";
import { ProductDetail } from "@/features/shop/components/ProductDetail";

// ─── COMPONENTE ────────────────────────────────────────────

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductDetail productId={productId} />
    </div>
  );
}