// src/providers/QueryProvider.tsx

"use client";

import { useState, type ReactNode } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// ─── PROPS ─────────────────────────────────────────────────

interface QueryProviderProps {
  children: ReactNode;
}

// ─── CONFIGURACIÓN POR DEFECTO ─────────────────────────────

/**
 * Opciones por defecto para todas las queries.
 * 
 * - staleTime: 2 minutos (los datos se consideran frescos)
 * - gcTime: 10 minutos (tiempo en cache después de unmount)
 * - retry: 1 (reintentar una vez en caso de error)
 * - refetchOnWindowFocus: false (no refetch al cambiar de pestaña)
 */
const defaultOptions = {
  queries: {
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  },
  mutations: {
    retry: 0,
  },
};

// ─── COMPONENTE ────────────────────────────────────────────

/**
 * QueryProvider
 * 
 * Provider de TanStack Query para la aplicación.
 * 
 * Responsabilidades:
 * - Crear y proporcionar QueryClient a toda la app
 * - Configurar opciones globales de fetching
 * - Incluir ReactQueryDevtools en desarrollo
 * 
 * Se monta en el layout raíz, dentro de AuthProvider.
 * 
 * Uso en src/app/layout.tsx:
 * ```tsx
 * <AuthProvider>
 *   <QueryProvider>
 *     {children}
 *   </QueryProvider>
 * </AuthProvider>
 * ```
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions,
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Devtools solo en desarrollo */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

export default QueryProvider;