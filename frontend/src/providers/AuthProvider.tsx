// src/providers/AuthProvider.tsx

"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/stores/auth.store";

// ─── PROPS ─────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
  /** Componente a mostrar mientras se inicializa la autenticación */
  fallback?: ReactNode;
}

// ─── COMPONENTE ────────────────────────────────────────────

/**
 * AuthProvider
 * 
 * Provider raíz de autenticación.
 * 
 * Responsabilidades:
 * - Ejecutar initialize() al montar la aplicación
 * - Validar tokens existentes contra el backend (GET /auth/me)
 * - Restaurar sesión si los tokens son válidos
 * - Mostrar fallback (loader) mientras se resuelve la inicialización
 * 
 * Flujo:
 * 1. Se monta el provider
 * 2. Si no está inicializado, ejecuta store.initialize()
 * 3. initialize() verifica si hay tokens en localStorage
 * 4. Si hay tokens → GET /auth/me para validarlos
 *    - Éxito → user en store, isAuthenticated = true
 *    - Error 401 → interceptor intenta refresh
 *      - Éxito → nuevo access token, se reintenta /auth/me
 *      - Error → clearSession, isAuthenticated = false
 * 5. Si no hay tokens → isAuthenticated = false directamente
 * 6. isInitialized = true → se renderizan los children
 * 
 * Ubicación: src/app/layout.tsx
 * ```tsx
 * <AuthProvider fallback={<FullScreenLoader />}>
 *   {children}
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children, fallback }: AuthProviderProps) {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Mientras se inicializa, mostrar fallback
  if (!isInitialized) {
    return fallback ?? null;
  }

  // Inicialización completa, renderizar hijos
  return <>{children}</>;
}

export default AuthProvider;