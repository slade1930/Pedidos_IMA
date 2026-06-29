// src/hooks/useLocalStorage.ts

"use client";

import { useState, useEffect, useCallback } from "react";

// ─── HOOK ──────────────────────────────────────────────────

/**
 * useLocalStorage
 * 
 * Hook que sincroniza un valor de estado con localStorage.
 * 
 * Características:
 * - Persiste el valor en localStorage automáticamente
 * - Recupera el valor inicial desde localStorage
 * - Soporta SSR (verifica typeof window)
 * - Tipado genérico seguro
 * - Maneja errores de parseo
 * 
 * @param key - Clave en localStorage
 * @param initialValue - Valor inicial si no existe en localStorage
 * @returns [value, setValue, removeValue] - Valor, setter y función para eliminar
 * 
 * Uso:
 * ```tsx
 * const [theme, setTheme, removeTheme] = useLocalStorage("theme", "light");
 * 
 * setTheme("dark"); // guarda en localStorage automáticamente
 * removeTheme(); // elimina del localStorage
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // ─── INICIALIZAR ESTADO ─────────────────────────────
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(
        `Error al leer localStorage key "${key}":`,
        error
      );
      return initialValue;
    }
  });

  // ─── SINCRONIZAR CON LOCALSTORAGE ───────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(
        `Error al escribir localStorage key "${key}":`,
        error
      );
    }
  }, [key, storedValue]);

  // ─── SETTER TIPADO ──────────────────────────────────
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const newValue =
          value instanceof Function ? value(prev) : value;
        return newValue;
      });
    },
    []
  );

  // ─── ELIMINAR VALOR ─────────────────────────────────
  const removeValue = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(
        `Error al eliminar localStorage key "${key}":`,
        error
      );
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;