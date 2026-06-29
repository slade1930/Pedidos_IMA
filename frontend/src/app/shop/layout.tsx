// src/app/(shop)/layout.tsx

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ShopNavbar } from "@/features/shop/components/ShopNavbar";
import { ShopFooter } from "@/features/shop/components/ShopFooter";

// ─── METADATA ──────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: "IMA System — Tienda",
    template: "%s — IMA System",
  },
  description: "Realiza tus pedidos para las ferias del IMA",
};

// ─── LAYOUT ────────────────────────────────────────────────

/**
 * Layout de la Tienda
 * 
 * Route Group: (shop)
 * Rutas: /products, /cart, /checkout, /orders, /history
 * 
 * Layout público con navbar y footer de tienda.
 * No incluye sidebar ni header del dashboard.
 */
export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ShopNavbar />
      <main className="flex-1">
        {children}
      </main>
      <ShopFooter />
    </div>
  );
}