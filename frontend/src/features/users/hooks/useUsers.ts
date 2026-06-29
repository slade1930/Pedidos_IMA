// src/features/users/hooks/useUsers.ts

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { userService } from "@/features/users/services/user.service";
import type { UserFilters } from "@/features/users/types/user.types";

// ─── CONSTANTES ────────────────────────────────────────────

/** Tiempo de stale para la query de usuarios (5 minutos) */
const STALE_TIME = 5 * 60 * 1000;

// ─── HOOK ──────────────────────────────────────────────────

/**
 * useUsers
 * 
 * Hook para obtener la lista paginada de usuarios con filtros.
 * 
 * Flujo:
 * 1. Recibe filtros opcionales (search, role, is_active, skip, limit)
 * 2. Llama a userService.getUsers() → GET /api/v1/users
 * 3. Retorna datos paginados y estados de la query
 * 
 * Características:
 * - Datos previos mantenidos durante refetch (keepPreviousData)
 * - Stale time de 5 minutos para reducir requests innecesarios
 * - Query key incluye todos los filtros para cacheo granular
 * 
 * @param filters - Filtros de búsqueda, rol, estado y paginación
 * @returns Query de TanStack Query con datos paginados
 * 
 * Uso:
 * ```tsx
 * const [skip, setSkip] = useState(0);
 * const { data, isPending, isError } = useUsers({ skip, limit: 10 });
 * 
 * // data?.data → array de usuarios
 * // data?.total → total de usuarios
 * // data?.pages → total de páginas
 * ```
 */
export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => userService.getUsers(filters),
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

export default useUsers;