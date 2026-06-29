// src/app/(shop)/orders/[id]/page.tsx

"use client";

import { useParams } from "next/navigation";
import { OrderDetail } from "@/features/shop/components/OrderDetail";

// ─── COMPONENTE ────────────────────────────────────────────

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <OrderDetail orderId={orderId} />
    </div>
  );
}