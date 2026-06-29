// src/stores/cart.store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── TIPOS ─────────────────────────────────────────────────

export interface CartItem {
  cartItemId: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  max_per_user: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  fairId: string | null;

  /** Agrega un item al carrito. Retorna true si se agregó, false si excedió el límite */
  addItem: (item: Omit<CartItem, "cartItemId">) => { success: boolean; message?: string };
  removeItem: (cartItemId: string) => void;
  /** Actualiza cantidad. Retorna true si se actualizó, false si excedió */
  updateQuantity: (cartItemId: string, quantity: number) => { success: boolean; message?: string };
  clearCart: () => void;
  setFairId: (fairId: string | null) => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getItemsCount: () => number;
  /** Verifica si se puede agregar más de un producto */
  canAddMore: (productId: string, additionalQty: number) => boolean;
  /** Obtiene la cantidad actual de un producto en el carrito */
  getProductQuantity: (productId: string) => number;
}

// ─── UTILITARIO ────────────────────────────────────────────

function generateCartItemId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── STORE ────────────────────────────────────────────────

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      fairId: null,

      addItem: (item) => {
        const state = get();
        const existingIndex = state.items.findIndex(
          (i) => i.product_id === item.product_id
        );

        // Si ya existe en el carrito
        if (existingIndex !== -1) {
          const existing = state.items[existingIndex];
          const newQuantity = existing.quantity + item.quantity;

          // Validar límite max_per_user
          if (existing.max_per_user > 0 && newQuantity > existing.max_per_user) {
            return {
              success: false,
              message: `Límite máximo: ${existing.max_per_user} unidad(es) por usuario. Ya tienes ${existing.quantity}.`,
            };
          }

          // Validar stock
          if (existing.stock > 0 && newQuantity > existing.stock) {
            return {
              success: false,
              message: `Stock insuficiente. Solo quedan ${existing.stock} unidad(es).`,
            };
          }

          const updatedItems = [...state.items];
          updatedItems[existingIndex] = {
            ...existing,
            quantity: newQuantity,
          };
          set({ items: updatedItems });
          return { success: true };
        }

        // Nuevo item: validar límite
        if (item.max_per_user > 0 && item.quantity > item.max_per_user) {
          return {
            success: false,
            message: `Límite máximo: ${item.max_per_user} unidad(es) por usuario.`,
          };
        }

        // Validar stock
        if (item.stock > 0 && item.quantity > item.stock) {
          return {
            success: false,
            message: `Stock insuficiente. Solo quedan ${item.stock} unidad(es).`,
          };
        }

        set({
          items: [
            ...state.items,
            { ...item, cartItemId: generateCartItemId() },
          ],
        });
        return { success: true };
      },

      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.cartItemId !== cartItemId),
        }));
      },

      updateQuantity: (cartItemId, quantity) => {
        const state = get();
        const item = state.items.find((i) => i.cartItemId === cartItemId);

        if (!item) return { success: false, message: "Producto no encontrado" };

        // Si es 0 o menos, eliminar
        if (quantity < 1) {
          get().removeItem(cartItemId);
          return { success: true };
        }

        // Validar límite max_per_user
        if (item.max_per_user > 0 && quantity > item.max_per_user) {
          return {
            success: false,
            message: `Límite máximo: ${item.max_per_user} unidad(es) por usuario.`,
          };
        }

        // Validar stock
        if (item.stock > 0 && quantity > item.stock) {
          return {
            success: false,
            message: `Stock insuficiente. Solo quedan ${item.stock} unidad(es).`,
          };
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.cartItemId === cartItemId ? { ...i, quantity } : i
          ),
        }));
        return { success: true };
      },

      clearCart: () => {
        set({ items: [], fairId: null });
      },

      setFairId: (fairId) => {
        set({ fairId });
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.unit_price * item.quantity,
          0
        );
      },

      getItemsCount: () => {
        return get().items.length;
      },

      canAddMore: (productId, additionalQty) => {
        const state = get();
        const existing = state.items.find((i) => i.product_id === productId);
        if (!existing) return true;

        const newQty = existing.quantity + additionalQty;
        if (existing.max_per_user > 0 && newQty > existing.max_per_user) return false;
        if (existing.stock > 0 && newQty > existing.stock) return false;
        return true;
      },

      getProductQuantity: (productId) => {
        const state = get();
        const existing = state.items.find((i) => i.product_id === productId);
        return existing?.quantity ?? 0;
      },
    }),
    {
      name: "ima-cart",
      partialize: (state) => ({
        items: state.items,
        fairId: state.fairId,
      }),
    }
  )
);

export default useCartStore;