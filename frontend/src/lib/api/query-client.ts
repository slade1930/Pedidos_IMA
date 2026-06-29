// src/lib/api/query-client.ts

import { QueryClient } from "@tanstack/react-query";

// ─── CONFIGURACIÓN POR DEFECTO ─────────────────────────────

/**
 * Opciones globales para todas las queries y mutations.
 * 
 * Queries:
 * - staleTime: 2 minutos (datos considerados frescos)
 * - gcTime: 10 minutos (tiempo en cache garbage collection)
 * - retry: 1 (reintentar una vez en error)
 * - refetchOnWindowFocus: false (no refetch al cambiar pestaña)
 * 
 * Mutations:
 * - retry: 0 (no reintentar mutations)
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
} as const;

// ─── FUNCIÓN FACTORY ───────────────────────────────────────

/**
 * Crea una nueva instancia de QueryClient con las opciones por defecto.
 * 
 * Útil para:
 * - Provider en la app (src/providers/QueryProvider.tsx)
 * - Tests unitarios
 * - Scripts fuera de React
 * 
 * @returns Nueva instancia de QueryClient
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions,
  });
}

// ─── INSTANCIA POR DEFECTO ─────────────────────────────────

/**
 * Instancia singleton del QueryClient.
 * 
 * Usada por QueryProvider. No usar directamente en componentes.
 * Los componentes deben usar useQuery/useMutation que obtienen
 * el cliente del contexto.
 */
export const queryClient = createQueryClient();

export default queryClient;