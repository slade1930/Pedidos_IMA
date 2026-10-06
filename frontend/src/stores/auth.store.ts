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

      // FASE 1.1: login deja las cookies httpOnly (itas_access/itas_refresh)
      await authService.login(credentials);
      tokenStorage.markSessionActive();

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

      await authService.login({
        email: data.email,
        password: data.password,
      });
      tokenStorage.markSessionActive();

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
        localStorage.removeItem("itas-cart");
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

    // FASE 1.1: la sesión se detecta con la cookie ligera "has_session".
    // Los tokens httpOnly no son legibles desde JS.
    if (tokenStorage.hasSession()) {
      get()
        .fetchMe()
        .finally(() => {
          set({ isInitialized: true });
        });
    } else {
      tokenStorage.clearSession();
      set({
        isInitialized: true,
        user: null,
        isAuthenticated: false,
      });
    }
  },
}));

export default useAuthStore;