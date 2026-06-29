// src/app/(shop)/orders/page.tsx

"use client";

import { OrderList } from "@/features/shop/components/OrderList";

// ─── COMPONENTE ────────────────────────────────────────────

export default function OrdersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Mis Pedidos</h1>
      <OrderList />
    </div>
  );
}