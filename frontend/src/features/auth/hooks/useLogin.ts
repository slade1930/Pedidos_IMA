// src/features/auth/hooks/useLogin.ts

import { useMutation } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { tokenStorage } from "@/lib/auth/token";
import type { LoginCredentials } from "@/features/auth/types/auth.types";

/**
 * useLogin
 * 
 * Hook que encapsula la lógica de inicio de sesión.
 * 
 * Flujo:
 * 1. Recibe credenciales (email, password)
 * 2. Llama a authService.login() → POST /api/v1/auth/login
 * 3. Guarda tokens en tokenStorage
 * 4. Llama a authService.getMe() → GET /api/v1/users/me
 * 5. Actualiza el store con el usuario autenticado
 * 
 * @returns Mutación de TanStack Query con estado y acción mutate
 */
export function useLogin() {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),

    onSuccess: async (tokens) => {
      // 1. Guardar tokens en storage
      tokenStorage.setAccessToken(tokens.access_token);
      tokenStorage.setRefreshToken(tokens.refresh_token);

      // 2. Obtener perfil del usuario
      try {
        const user = await authService.getMe();
        useAuthStore.setState({
          user,
          isAuthenticated: true,
        });
      } catch {
        // Si falla getMe, marcamos como autenticado con tokens
        useAuthStore.setState({
          isAuthenticated: true,
        });
      }
    },

    onError: () => {
      // El error se propaga al componente
    },
  });
}

export default useLogin;