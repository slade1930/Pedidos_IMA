// src/hooks/useMediaQuery.ts

"use client";

import { useState, useEffect } from "react";

// ─── HOOK ──────────────────────────────────────────────────

/**
 * useMediaQuery
 * 
 * Hook que evalúa si una media query CSS coincide.
 * 
 * Útil para:
 * - Detectar tamaño de pantalla (mobile, tablet, desktop)
 * - Aplicar lógica condicional basada en breakpoints
 * - Alternativa a CSS hidden/shown cuando se necesita
 *   lógica de JavaScript
 * 
 * @param query - Media query a evaluar (ej: "(min-width: 768px)")
 * @returns boolean - true si la media query coincide
 * 
 * Uso:
 * ```tsx
 * const isMobile = useMediaQuery("(max-width: 767px)");
 * const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
 * const isDesktop = useMediaQuery("(min-width: 1024px)");
 * 
 * if (isMobile) {
 *   return <MobileLayout />;
 * }
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);

    // Actualizar estado inicial
    setMatches(mediaQuery.matches);

    // Listener para cambios
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Agregar listener (método moderno)
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}

export default useMediaQuery;