// src/hooks/useDebounce.ts

import { useState, useEffect } from "react";

// ─── HOOK ──────────────────────────────────────────────────

/**
 * useDebounce
 * 
 * Hook que aplica debounce a un valor que cambia rápidamente.
 * 
 * Útil para:
 * - Inputs de búsqueda (esperar a que el usuario deje de escribir)
 * - Redimensionamiento de ventana
 * - Cualquier valor que cambie frecuentemente y requiera
 *   una acción costosa (API call, cálculo, etc.)
 * 
 * @param value - El valor a debounce
 * @param delay - Tiempo de espera en milisegundos (default: 300ms)
 * @returns El valor después del delay
 * 
 * Uso:
 * ```tsx
 * const [search, setSearch] = useState("");
 * const debouncedSearch = useDebounce(search, 500);
 * 
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     fetchResults(debouncedSearch);
 *   }
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Crear timer que actualiza el valor después del delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar timer si value cambia antes de que se complete el delay
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;