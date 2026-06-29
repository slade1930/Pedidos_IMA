// src/features/auth/hooks/useRegister.ts

import { useMutation } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { tokenStorage } from "@/lib/auth/token";
import type { RegisterData } from "@/features/auth/types/auth.types";

/**
 * useRegister
 * 
 * Hook que encapsula la lógica de registro de nuevo usuario.
 * 
 * Flujo:
 * 1. Recibe datos de registro (full_name, cedula, email, phone, password, confirm_password)
 * 2. Llama a authService.register() → POST /api/v1/users/register
 * 3. Si es exitoso, el backend retorna el usuario creado
 * 4. Hace login automático para obtener tokens
 * 5. Guarda tokens en storage
 * 6. Actualiza el store con el usuario autenticado
 * 
 * @returns Mutación de TanStack Query con estado y acción mutate
 */
export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),

    onSuccess: async (user, variables) => {
      // Hacer login automático con las mismas credenciales
      try {
        const tokens = await authService.login({
          email: variables.email,
          password: variables.password,
        });

        tokenStorage.setAccessToken(tokens.access_token);
        tokenStorage.setRefreshToken(tokens.refresh_token);

        useAuthStore.setState({
          user,
          isAuthenticated: true,
        });
      } catch {
        // Si falla el login, al menos guardamos el usuario
        useAuthStore.setState({
          user,
          isAuthenticated: true,
        });
      }
    },

    onError: () => {
      // El error se propaga al componente para mostrar feedback
    },
  });
}

export default useRegister;