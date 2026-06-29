// src/stores/ui.store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── TIPOS ─────────────────────────────────────────────────

type SidebarState = "expanded" | "collapsed";

interface UIState {
  // ─── SIDEBAR ───────────────────────────────────────
  sidebarState: SidebarState;
  isMobileMenuOpen: boolean;

  // ─── TEMA ──────────────────────────────────────────
  theme: "light" | "dark" | "system";

  // ─── ACCIONES SIDEBAR ──────────────────────────────
  toggleSidebar: () => void;
  setSidebarState: (state: SidebarState) => void;
  setMobileMenuOpen: (isOpen: boolean) => void;
  toggleMobileMenu: () => void;

  // ─── ACCIONES TEMA ─────────────────────────────────
  setTheme: (theme: "light" | "dark" | "system") => void;
}

// ─── STORE ────────────────────────────────────────────────

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // ─── ESTADO INICIAL ─────────────────────────────
      sidebarState: "expanded",
      isMobileMenuOpen: false,
      theme: "system",

      // ─── SIDEBAR ────────────────────────────────────
      toggleSidebar: () => {
        set((state) => ({
          sidebarState:
            state.sidebarState === "expanded" ? "collapsed" : "expanded",
        }));
      },

      setSidebarState: (sidebarState) => {
        set({ sidebarState });
      },

      setMobileMenuOpen: (isOpen) => {
        set({ isMobileMenuOpen: isOpen });
      },

      toggleMobileMenu: () => {
        set((state) => ({
          isMobileMenuOpen: !state.isMobileMenuOpen,
        }));
      },

      // ─── TEMA ───────────────────────────────────────
      setTheme: (theme) => {
        set({ theme });
      },
    }),
    {
      name: "ima-ui",
      partialize: (state) => ({
        sidebarState: state.sidebarState,
        theme: state.theme,
      }),
    }
  )
);

export default useUIStore;