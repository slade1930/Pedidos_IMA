// src/features/shop/components/ReorderButton.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import { usePdaRestriction } from "@/features/shop/hooks/usePdaRestriction";
import { useShopProducts } from "@/features/shop/hooks/useShopProducts";
import type { Order } from "@/features/orders/types/order.types";
import { RefreshCcw, CheckCircle2, AlertTriangle } from "lucide-react";

// ─── CONSTANTES ────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_URL}${imageUrl}`;
}

// ─── PROPS ─────────────────────────────────────────────────

interface ReorderButtonProps {
  order: Order;
  /** Clases extra opcionales (para adaptar el estilo a cada vista) */
  className?: string;
}

// ─── COMPONENTE ────────────────────────────────────────────

export function ReorderButton({ order, className }: ReorderButtonProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const setFairId = useCartStore((state) => state.setFairId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: pdaStatus } = usePdaRestriction();
  const restriction = isAuthenticated && pdaStatus && !pdaStatus.can_purchase ? pdaStatus.restriction : null;
  const { data: products } = useShopProducts({ fair_id: order.fair_id });
  const [result, setResult] = useState<{ type: "success" | "partial" | "error"; message: string } | null>(null);

  const handleReorder = () => {
    setResult(null);

    if (restriction) {
      setResult({
        type: "error",
        message: `Control de beneficios activo: podrás volver a pedir el ${new Date(restriction.next_available_date).toLocaleDateString("es-PA")}.`,
      });
      return;
    }

    setFairId(order.fair_id);

    const productMap = new Map((products ?? []).map((p) => [p.id, p]));
    let added = 0;
    let skipped = 0;

    order.items.forEach((item) => {
      const prod = productMap.get(item.product_id);
      const stock = prod && typeof prod.available_stock === "number" ? prod.available_stock : item.quantity;
      const maxPerUser = prod?.max_per_user ?? 100;

      if (stock <= 0) {
        skipped++;
        return;
      }

      const quantity = Math.min(item.quantity, stock);

      const res = addItem({
        product_id: item.product_id,
        product_name: prod?.name ?? item.product_name,
        quantity: Math.max(quantity, 1),
        unit_price: prod?.price ?? Number(item.unit_price),
        max_per_user: maxPerUser,
        stock,
        image_url: prod ? getImageUrl(prod.image_url) : null,
      });

      if (res.success) added++;
      else skipped++;
    });

    if (added > 0 && skipped === 0) {
      setResult({ type: "success", message: `${added} producto(s) agregados al carrito` });
    } else if (added > 0) {
      setResult({ type: "partial", message: `${added} agregado(s), ${skipped} agotado(s)` });
    } else {
      setResult({ type: "error", message: "Todos los productos están agotados" });
      return;
    }

    // Abrir el carrito después de un breve momento
    setTimeout(() => router.push("/shop/cart"), 900);
  };

  return (
    <div className={className}>
      <button
        onClick={handleReorder}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1b4f72] px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-[#1b4f72]/20 hover:bg-[#142b45] active:scale-95 transition-all cursor-pointer"
      >
        <RefreshCcw size={14} strokeWidth={2.5} />
        Volver a Pedir
      </button>

      {result && (
        <p
          className={`mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold ${
            result.type === "error"
              ? "text-red-600"
              : result.type === "partial"
              ? "text-amber-600"
              : "text-green-700"
          }`}
        >
          {result.type === "error" ? (
            <AlertTriangle size={12} />
          ) : (
            <CheckCircle2 size={12} />
          )}
          {result.message}
        </p>
      )}
    </div>
  );
}

export default ReorderButton;
