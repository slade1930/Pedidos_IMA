// src/app/not-found.tsx

import Link from "next/link";

// ─── COMPONENTE ────────────────────────────────────────────

/**
 * Página 404 - No Encontrada
 * 
 * Se muestra automáticamente cuando una ruta no existe.
 * 
 * Next.js App Router usa este archivo como página 404 global.
 * No es necesario configurar nada adicional.
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        {/* Código 404 */}
        <p className="text-6xl font-bold text-indigo-600">404</p>

        {/* Mensaje */}
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Página no encontrada
        </h1>
        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
          La página que buscas no existe o fue movida.
          Verifica la URL o regresa al inicio.
        </p>

        {/* Acciones */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            Ir al Dashboard
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}