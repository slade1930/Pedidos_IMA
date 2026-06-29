// src/hooks/useToast.ts

"use client";

import { useState, useCallback } from "react";

// ─── TIPOS ─────────────────────────────────────────────────

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

// ─── CONFIGURACIÓN ─────────────────────────────────────────

const DEFAULT_DURATION = 4000;
const MAX_TOASTS = 5;

// ─── HOOK ──────────────────────────────────────────────────

/**
 * useToast
 * 
 * Hook simple para mostrar notificaciones toast.
 * 
 * Si el proyecto ya tiene el toast de Shadcn/UI (src/components/ui/toast.tsx),
 * usar ese en su lugar. Este es un hook ligero independiente.
 * 
 * Funcionalidades:
 * - Mostrar toasts con diferentes tipos (success, error, warning, info)
 * - Auto-dismiss después de una duración configurable
 * - Límite máximo de toasts visibles
 * - Eliminación manual
 * 
 * @returns { toasts, addToast, removeToast, success, error, warning, info }
 * 
 * Uso:
 * ```tsx
 * const { success, error } = useToast();
 * 
 * success("Usuario creado correctamente");
 * error("Error al guardar");
 * ```
 */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ─── AGREGAR TOAST ──────────────────────────────────
  const addToast = useCallback(
    ({ message, type = "info", duration = DEFAULT_DURATION }: ToastOptions) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      const newToast: Toast = { id, message, type, duration };

      setToasts((prev) => {
        // Limitar cantidad máxima de toasts
        const updated = [...prev, newToast];
        if (updated.length > MAX_TOASTS) {
          return updated.slice(-MAX_TOASTS);
        }
        return updated;
      });

      // Auto-dismiss
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    []
  );

  // ─── ELIMINAR TOAST ─────────────────────────────────
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // ─── SHORTCUTS ──────────────────────────────────────
  const success = useCallback(
    (message: string, duration?: number) =>
      addToast({ message, type: "success", duration }),
    [addToast]
  );

  const error = useCallback(
    (message: string, duration?: number) =>
      addToast({ message, type: "error", duration }),
    [addToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) =>
      addToast({ message, type: "warning", duration }),
    [addToast]
  );

  const info = useCallback(
    (message: string, duration?: number) =>
      addToast({ message, type: "info", duration }),
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}

export default useToast;