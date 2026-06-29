// src/features/shop/hooks/useCart.ts

"use client";

import { useCallback } from "react";
import { useCartStore } from "@/stores/cart.store";
import type { CartItem } from "@/stores/cart.store";

// ─── HOOK ──────────────────────────────────────────────────

/**
 * useCart
 * 
 * Hook que encapsula la lógica del carrito de compras.
 * 
 * Proporciona métodos para agregar, quitar, actualizar items
 * y obtener totales del carrito.
 * 
 * @returns Métodos y estado del carrito
 */
export function useCart() {
  const items = useCartStore((state) => state.items);
  const fairId = useCartStore((state) => state.fairId);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const setFairId = useCartStore((state) => state.setFairId);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const getItemsCount = useCartStore((state) => state.getItemsCount);

  const addToCart = useCallback(
    (item: Omit<CartItem, "cartItemId">) => {
      addItem(item);
    },
    [addItem]
  );

  const removeFromCart = useCallback(
    (cartItemId: string) => {
      removeItem(cartItemId);
    },
    [removeItem]
  );

  const updateItemQuantity = useCallback(
    (cartItemId: string, quantity: number) => {
      updateQuantity(cartItemId, quantity);
    },
    [updateQuantity]
  );

  const emptyCart = useCallback(() => {
    clearCart();
  }, [clearCart]);

  const selectFair = useCallback(
    (id: string | null) => {
      setFairId(id);
    },
    [setFairId]
  );

  return {
    items,
    fairId,
    subtotal: getSubtotal(),
    totalItems: getTotalItems(),
    itemsCount: getItemsCount(),
    addToCart,
    removeFromCart,
    updateItemQuantity,
    emptyCart,
    selectFair,
  };
}

export default useCart;