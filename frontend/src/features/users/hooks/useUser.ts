// src/features/users/hooks/useUser.ts

import { useQuery } from "@tanstack/react-query";
import { userService } from "@/features/users/services/user.service";

// ─── CONSTANTES ────────────────────────────────────────────

/** Tiempo de stale para la query de usuario individual (2 minutos) */
const STALE_TIME = 2 * 60 * 1000;

// ─── HOOK ──────────────────────────────────────────────────

/**
 * useUser
 * 
 * Hook para obtener un usuario individual por su ID.
 * 
 * Flujo:
 * 1. Recibe un ID de usuario (UUID string)
 * 2. Si el ID es válido, llama a userService.getUser(id) → GET /api/v1/users/{id}
 * 3. Si el ID es null/undefined/vacío, la query no se ejecuta (enabled: false)
 * 4. Retorna el usuario y estados de la query
 * 
 * Características:
 * - Query condicional: no se ejecuta si id no es válido
 * - Stale time de 2 minutos
 * - Query key incluye el ID para cacheo individual
 * 
 * @param id - ID del usuario a obtener (UUID string)
 * @returns Query de TanStack Query con el usuario
 * 
 * Uso:
 * ```tsx
 * const { data: user, isPending } = useUser("abc-123-def");
 * 
 * // user → { id, full_name, cedula, email, role, ... }
 * // isPending → true mientras carga
 * ```
 */
export function useUser(id: string | null | undefined) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => userService.getUser(id as string),
    enabled: !!id,
    staleTime: STALE_TIME,
  });
}

export default useUser;