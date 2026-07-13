// src/features/shop/hooks/useCheckout.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useCartStore } from "@/stores/cart.store";
import type { CreateOrderPayload } from "@/features/orders/types/order.types";
import type { Order } from "@/features/orders/types/order.types";
import type { PdaRestriction } from "@/features/orders/types/order.types";

// ─── TIPOS ─────────────────────────────────────────────────

interface CheckoutData {
  payment_method: "yappy" | "card" | "cash";
  notes?: string;
}

export interface CheckoutError {
  message: string;
  status?: number;
  isPdaRestriction?: boolean;
  pda?: PdaRestriction;
}

// ─── HOOK ──────────────────────────────────────────────────

export function useCheckout() {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((state) => state.clearCart);
  const items = useCartStore((state) => state.items);
  const fairId = useCartStore((state) => state.fairId);

  const mutation = useMutation({
    mutationFn: async (data: CheckoutData): Promise<Order> => {
      // Validar que se haya seleccionado una feria
      if (!fairId) {
        throw new Error("No se ha seleccionado una feria. Selecciona una feria para continuar.");
      }

      // Validar que el carrito tenga productos
      if (items.length === 0) {
        throw new Error("El carrito está vacío. Agrega productos antes de confirmar.");
      }

      const payload: CreateOrderPayload = {
        fair_id: fairId,
        payment_method: data.payment_method,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        notes: data.notes || null,
      };

      const response = await apiClient.post<Order>("/orders", payload);
      return response.data;
    },
    onSuccess: () => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });

  // Detectar si el error es PDA
  const error = mutation.error as any;
  const checkoutError: CheckoutError | null = error
    ? {
        message: error.message || "Error al procesar el pedido",
        status: error.status,
        isPdaRestriction: error.status === 400 && error.detail?.days_remaining !== undefined,
        pda: error.detail?.days_remaining !== undefined ? (error.detail as PdaRestriction) : undefined,
      }
    : null;

  return {
    ...mutation,
    checkoutError,
  };
}

export default useCheckout;
