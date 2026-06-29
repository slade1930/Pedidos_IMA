// src/app/(public)/layout.tsx

import type { Metadata } from "next";
import type { ReactNode } from "react";

// ─── METADATA ──────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: "IMA System — Información Pública",
    template: "%s — IMA System",
  },
  description: "Información pública de ferias y eventos de IMA System",
};

// ─── LAYOUT ────────────────────────────────────────────────

/**
 * Layout Público
 * 
 * Route Group: (public)
 * Rutas: /public-fairs/:id
 * 
 * Layout para páginas accesibles sin autenticación.
 * Útil para compartir información de ferias con clientes
 * o visitantes externos.
 * 
 * Características:
 * - Sin autenticación requerida
 * - Diseño limpio y público
 * - Sin sidebar ni header del dashboard
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header público simple */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <a href="/" className="text-lg font-bold text-gray-900">
            IMA System
          </a>
          <span className="ml-3 text-sm text-gray-500">
            Información Pública
          </span>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer público simple */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} IMA System. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}