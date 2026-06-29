// src/stores/auth.store.ts

import { create } from "zustand";
import { tokenStorage } from "@/lib/auth/token";
import { authService } from "@/features/auth/services/auth.service";
import { useCartStore } from "@/stores/cart.store";
import type {
  AuthUser,
  LoginCredentials,
  RegisterData,
} from "@/features/auth/types/auth.types";

// ─── ESTADO DEL STORE ──────────────────────────────────────

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  initialize: () => void;
}

// ─── STORE ────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  // ─── LOGIN ─────────────────────────────────────────
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true });

    try {
      // Limpiar datos del usuario anterior antes de login
      useCartStore.getState().clearCart();

      const tokens = await authService.login(credentials);

      tokenStorage.setAccessToken(tokens.access_token);
      tokenStorage.setRefreshToken(tokens.refresh_token);

      const user = await authService.getMe();

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // ─── REGISTER ──────────────────────────────────────
  register: async (data: RegisterData) => {
    set({ isLoading: true });

    try {
      // Limpiar datos del usuario anterior
      useCartStore.getState().clearCart();

      const user = await authService.register(data);

      const tokens = await authService.login({
        email: data.email,
        password: data.password,
      });

      tokenStorage.setAccessToken(tokens.access_token);
      tokenStorage.setRefreshToken(tokens.refresh_token);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // ─── LOGOUT ────────────────────────────────────────
  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // Ignorar errores
    } finally {
      // Limpiar tokens
      tokenStorage.clearSession();

      // Limpiar carrito
      useCartStore.getState().clearCart();

      // Limpiar localStorage de la app
      if (typeof window !== "undefined") {
        localStorage.removeItem("ima-cart");
      }

      // Resetear estado
      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },

  // ─── FETCH ME ──────────────────────────────────────
  fetchMe: async () => {
    try {
      const user = await authService.getMe();
      set({
        user,
        isAuthenticated: true,
      });
    } catch {
      tokenStorage.clearSession();
      useCartStore.getState().clearCart();
      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },

  // ─── SET USER ──────────────────────────────────────
  setUser: (user: AuthUser | null) => {
    set({
      user,
      isAuthenticated: user !== null,
    });
  },

  // ─── INITIALIZE ────────────────────────────────────
  initialize: () => {
    if (get().isInitialized) return;

    const hasAccessToken = tokenStorage.hasAccessToken();
    const hasRefreshToken = tokenStorage.hasRefreshToken();

    if (hasAccessToken || hasRefreshToken) {
      get()
        .fetchMe()
        .finally(() => {
          set({ isInitialized: true });
        });
    } else {
      set({
        isInitialized: true,
        user: null,
        isAuthenticated: false,
      });
    }
  },
}));

export default useAuthStore;