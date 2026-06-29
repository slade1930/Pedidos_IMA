// src/features/fairs/hooks/useDeleteFair.ts

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fairService } from "@/features/fairs/services/fair.service";
import { queryKeys } from "@/constants/query-keys";

/**
 * useDeleteFair
 * 
 * Hook para eliminar una feria.
 * 
 * Flujo:
 * 1. Recibe el ID de la feria a eliminar (UUID string)
 * 2. Llama a fairService.deleteFair() → DELETE /api/v1/fairs/{id}
 * 3. Invalida la cache de ferias al tener éxito
 * 
 * @returns Mutación de TanStack Query
 */
export function useDeleteFair() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fairService.deleteFair(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fairs.all });
    },
    onError: (error: { message: string }) => {
      console.error("Delete fair error:", error);
      throw error;
    },
  });
}

export default useDeleteFair;