// src/features/auth/components/AuthGuard.tsx

"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import type { UserRole } from "@/features/auth/types/auth.types";

// ─── PROPS ─────────────────────────────────────────────────

interface AuthGuardProps {
  children: ReactNode;
  /** Roles permitidos. Si no se especifica, cualquier rol autenticado accede */
  allowedRoles?: UserRole[];
  /** Componente a mostrar mientras se verifica la autenticación */
  fallback?: ReactNode;
  /** Ruta a la que redirigir si no está autenticado */
  redirectTo?: string;
}

// ─── COMPONENTE ────────────────────────────────────────────

/**
 * AuthGuard
 * 
 * Componente guardián que protege rutas basado en autenticación y roles.
 * 
 * Comportamiento:
 * - Si auth no está inicializado → muestra fallback (loader)
 * - Si no está autenticado → redirige a /login
 * - Si está autenticado pero no tiene el rol requerido → redirige a /shop
 * - Si está autenticado y tiene el rol → renderiza children
 */
export function AuthGuard({
  children,
  allowedRoles,
  fallback,
  redirectTo = "/login",
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!isInitialized) return;

    // No autenticado → redirigir a login
    if (!isAuthenticated) {
      const currentPath = encodeURIComponent(pathname);
      router.replace(`${redirectTo}?redirect=${currentPath}`);
      return;
    }

    // Autenticado pero sin el rol requerido → redirigir a la tienda
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.replace("/shop");
    }
  }, [isInitialized, isAuthenticated, user, allowedRoles, pathname, redirectTo, router]);

  // Mientras se inicializa, mostrar fallback
  if (!isInitialized) {
    return fallback ? <>{fallback}</> : null;
  }

  // No autenticado
  if (!isAuthenticated) {
    return null;
  }

  // Sin el rol requerido
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  // Autorizado
  return <>{children}</>;
}

export default AuthGuard;