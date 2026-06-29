// src/lib/utils.ts

// ─── RE-EXPORTACIONES ──────────────────────────────────────

export { cn } from "@/lib/utils/cn";
export { errors, getErrorMessage, createError, ERROR_MESSAGES } from "@/lib/utils/errors";
export { fmt, formatCurrency, formatDate, formatDateTime, formatRelativeTime, getInitials, truncateText } from "@/lib/utils/format";

// ─── TIPOS ─────────────────────────────────────────────────

/** Valor que puede ser nulo o indefinido */
type Nullable<T> = T | null | undefined;

// ─── FUNCIONES GENERALES ───────────────────────────────────

/**
 * Verifica si un valor es nulo o undefined.
 * 
 * @param value - Valor a verificar
 * @returns true si es null o undefined
 */
export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Verifica si un valor no es nulo ni undefined.
 * 
 * @param value - Valor a verificar
 * @returns true si NO es null ni undefined
 */
export function isNotNil<T>(value: Nullable<T>): value is T {
  return value !== null && value !== undefined;
}

/**
 * Verifica si un string está vacío o solo tiene espacios.
 * 
 * @param value - String a verificar
 * @returns true si está vacío o solo tiene espacios
 */
export function isEmptyString(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

/**
 * Verifica si un array está vacío.
 * 
 * @param arr - Array a verificar
 * @returns true si el array es null, undefined o está vacío
 */
export function isEmptyArray<T>(arr: Nullable<T[]>): boolean {
  return !arr || arr.length === 0;
}

// ─── OBJETOS ───────────────────────────────────────────────

/**
 * Elimina propiedades con valor undefined, null o string vacío de un objeto.
 * Útil para limpiar payloads antes de enviar al backend.
 * 
 * @param obj - Objeto a limpiar
 * @returns Nuevo objeto sin propiedades vacías
 * 
 * Uso:
 * ```ts
 * cleanObject({ name: "Juan", email: "", phone: undefined });
 * // { name: "Juan" }
 * ```
 */
export function cleanObject<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  ) as Partial<T>;
}

/**
 * Picks specific keys from an object.
 * 
 * @param obj - Objeto origen
 * @param keys - Array de claves a extraer
 * @returns Nuevo objeto solo con las claves especificadas
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

// ─── ARRAYS ────────────────────────────────────────────────

/**
 * Divide un array en chunks de tamaño fijo.
 * 
 * @param arr - Array a dividir
 * @param size - Tamaño de cada chunk
 * @returns Array de chunks
 * 
 * Uso:
 * ```ts
 * chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
 * ```
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

/**
 * Elimina elementos duplicados de un array.
 * 
 * @param arr - Array con posibles duplicados
 * @returns Array sin duplicados
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

// ─── ID ────────────────────────────────────────────────────

/**
 * Genera un ID único.
 * 
 * @returns String único
 * 
 * Uso:
 * ```ts
 * generateId(); // "l3k5m8n2"
 * ```
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── DEBOUNCE (función, no hook) ───────────────────────────

/**
 * Crea una versión debounced de una función.
 * 
 * @param fn - Función a debounce
 * @param delay - Tiempo de espera en ms
 * @returns Función debounced
 * 
 * Uso:
 * ```ts
 * const debouncedSearch = debounce((query) => fetchResults(query), 300);
 * ```
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// ─── SLEEP ─────────────────────────────────────────────────

/**
 * Promesa que se resuelve después de un tiempo.
 * Útil para simular delays en desarrollo.
 * 
 * @param ms - Milisegundos a esperar
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── COPIA AL PORTAPAPELES ─────────────────────────────────

/**
 * Copia un texto al portapapeles.
 * 
 * @param text - Texto a copiar
 * @returns true si se copió correctamente
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback para navegadores antiguos
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  }
}

// ─── DOWNLOAD ──────────────────────────────────────────────

/**
 * Descarga un archivo desde una URL o base64.
 * 
 * @param url - URL del archivo
 * @param filename - Nombre del archivo descargado
 */
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ─── COLOR ALEATORIO ───────────────────────────────────────

/**
 * Genera un color hexadecimal aleatorio.
 * 
 * @returns Color en formato #RRGGBB
 */
export function randomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
}

// ─── CLAMP ─────────────────────────────────────────────────

/**
 * Limita un número entre un mínimo y un máximo.
 * 
 * @param value - Valor a limitar
 * @param min - Valor mínimo
 * @param max - Valor máximo
 * @returns Valor limitado
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}