// src/lib/utils/cn.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ─── UTILITARIO ────────────────────────────────────────────

/**
 * Combina clases CSS resolviendo conflictos de Tailwind.
 * 
 * Usa clsx para concatenar condicionalmente y tailwind-merge
 * para resolver conflictos (ej: `px-4 px-6` → `px-6`).
 * 
 * @param inputs - Clases CSS (strings, objetos, arrays)
 * @returns String con clases combinadas y sin conflictos
 * 
 * Uso:
 * ```tsx
 * <div className={cn(
 *   "px-4 py-2 rounded-md",
 *   isActive && "bg-indigo-600 text-white",
 *   isDisabled && "opacity-50 cursor-not-allowed",
 *   className
 * )} />
 * ```
 * 
 * Requiere: npm install clsx tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export default cn;