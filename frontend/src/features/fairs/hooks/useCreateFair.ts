// src/features/fairs/hooks/useCreateFair.ts

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fairService } from "@/features/fairs/services/fair.service";
import { queryKeys } from "@/constants/query-keys";
import type { CreateFairPayload } from "@/features/fairs/types/fair.types";

/**
 * useCreateFair
 * 
 * Hook para crear una nueva feria.
 * 
 * Flujo:
 * 1. Recibe los datos de la feria
 * 2. Llama a fairService.createFair() → POST /api/v1/fairs
 * 3. Invalida la cache de ferias al tener éxito
 * 
 * @returns Mutación de TanStack Query
 */
export function useCreateFair() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFairPayload) => fairService.createFair(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fairs.all });
    },
    onError: (error: { message: string }) => {
      console.error("Create fair error:", error);
      throw error;
    },
  });
}

export default useCreateFair;