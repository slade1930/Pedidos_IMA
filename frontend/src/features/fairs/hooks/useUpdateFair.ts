// src/features/fairs/hooks/useUpdateFair.ts

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fairService } from "@/features/fairs/services/fair.service";
import { queryKeys } from "@/constants/query-keys";
import type { UpdateFairPayload } from "@/features/fairs/types/fair.types";

/**
 * useUpdateFair
 * 
 * Hook para actualizar una feria existente.
 * 
 * Flujo:
 * 1. Recibe ID (UUID string) y datos a actualizar
 * 2. Llama a fairService.updateFair() → PUT /api/v1/fairs/{id}
 * 3. Invalida la cache de ferias al tener éxito
 * 
 * @returns Mutación de TanStack Query
 */
export function useUpdateFair() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFairPayload }) =>
      fairService.updateFair(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fairs.all });
    },
    onError: (error: { message: string }) => {
      console.error("Update fair error:", error);
      throw error;
    },
  });
}

export default useUpdateFair;