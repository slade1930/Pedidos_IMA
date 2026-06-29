// src/lib/utils/format.ts

// ─── MONEDA ────────────────────────────────────────────────

/**
 * Formatea un número como moneda (USD).
 * 
 * @param value - Valor a formatear
 * @param decimals - Cantidad de decimales (default: 2)
 * @returns String formateado como moneda
 * 
 * Uso:
 * ```ts
 * formatCurrency(29.99); // "$29.99"
 * formatCurrency(1500); // "$1,500.00"
 * formatCurrency(1500, 0); // "$1,500"
 * ```
 */
export function formatCurrency(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// ─── NÚMERO ────────────────────────────────────────────────

/**
 * Formatea un número con separadores de miles.
 * 
 * @param value - Valor a formatear
 * @returns String formateado
 * 
 * Uso:
 * ```ts
 * formatNumber(1234567); // "1,234,567"
 * ```
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-PA").format(value);
}

// ─── PORCENTAJE ────────────────────────────────────────────

/**
 * Formatea un valor como porcentaje.
 * 
 * @param value - Valor decimal (0.25 = 25%)
 * @param decimals - Decimales a mostrar (default: 1)
 * @returns String formateado
 * 
 * Uso:
 * ```ts
 * formatPercent(0.25); // "25.0%"
 * formatPercent(0.333, 2); // "33.33%"
 * ```
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat("es-PA", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// ─── FECHA ─────────────────────────────────────────────────

/**
 * Formatea una fecha ISO a formato legible (día, mes, año).
 * 
 * @param dateString - Fecha en formato ISO
 * @returns Fecha formateada
 * 
 * Uso:
 * ```ts
 * formatDate("2026-06-05T10:30:00"); // "5 jun 2026"
 * ```
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-PA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── FECHA LARGA ───────────────────────────────────────────

/**
 * Formatea una fecha ISO a formato largo (día, mes completo, año).
 * 
 * @param dateString - Fecha en formato ISO
 * @returns Fecha formateada
 * 
 * Uso:
 * ```ts
 * formatDateLong("2026-06-05"); // "5 de junio de 2026"
 * ```
 */
export function formatDateLong(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-PA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── FECHA Y HORA ──────────────────────────────────────────

/**
 * Formatea una fecha ISO a formato con hora incluida.
 * 
 * @param dateString - Fecha en formato ISO
 * @returns Fecha y hora formateada
 * 
 * Uso:
 * ```ts
 * formatDateTime("2026-06-05T10:30:00"); // "5 de junio de 2026, 10:30 AM"
 * ```
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-PA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── TIEMPO RELATIVO ───────────────────────────────────────

/**
 * Formatea una fecha como tiempo relativo.
 * 
 * @param dateString - Fecha en formato ISO
 * @returns Tiempo relativo legible
 * 
 * Uso:
 * ```ts
 * formatRelativeTime("2026-06-05T10:25:00"); // "Hace 5 min" (si ahora son las 10:30)
 * formatRelativeTime("2026-06-04T10:00:00"); // "Ayer"
 * ```
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Futuro
  if (diffMs < 0) {
    const absDiffMs = Math.abs(diffMs);
    const absDiffDays = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
    if (absDiffDays > 0) return `En ${absDiffDays} día(s)`;
    const absDiffHours = Math.floor(absDiffMs / (1000 * 60 * 60));
    if (absDiffHours > 0) return `En ${absDiffHours}h`;
    return "Pronto";
  }

  // Pasado
  if (diffSeconds < 10) return "Ahora";
  if (diffSeconds < 60) return `Hace ${diffSeconds}s`;
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  if (diffHours < 6) return `Hace ${diffHours}h`;
  if (diffHours < 24) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`;

  return formatDate(dateString);
}

// ─── TEXTO ─────────────────────────────────────────────────

/**
 * Trunca un texto a una longitud máxima con puntos suspensivos.
 * 
 * @param text - Texto a truncar
 * @param maxLength - Longitud máxima (default: 50)
 * @returns Texto truncado
 * 
 * Uso:
 * ```ts
 * truncateText("Lorem ipsum dolor sit amet", 15); // "Lorem ipsum..."
 * ```
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

// ─── INICIALES ─────────────────────────────────────────────

/**
 * Obtiene las iniciales de un nombre.
 * 
 * @param name - Nombre completo
 * @param maxInitials - Máximo de iniciales (default: 2)
 * @returns Iniciales en mayúscula
 * 
 * Uso:
 * ```ts
 * getInitials("Juan Pérez"); // "JP"
 * getInitials("María José López", 1); // "M"
 * ```
 */
export function getInitials(name: string, maxInitials: number = 2): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n.charAt(0).toUpperCase())
    .slice(0, maxInitials)
    .join("");
}

// ─── TELÉFONO ──────────────────────────────────────────────

/**
 * Formatea un número de teléfono.
 * 
 * @param phone - Número de teléfono (10 dígitos)
 * @returns Teléfono formateado
 * 
 * Uso:
 * ```ts
 * formatPhone("6666666666"); // "(666) 666-6666"
 * ```
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
}

// ─── OBJETO FORMAT ─────────────────────────────────────────

/**
 * Objeto que agrupa todas las funciones de formateo.
 * 
 * Uso:
 * ```ts
 * import { fmt } from "@/lib/utils/format";
 * 
 * fmt.currency(29.99);
 * fmt.date("2026-06-05");
 * fmt.initials("Juan Pérez");
 * ```
 */
export const fmt = {
  currency: formatCurrency,
  number: formatNumber,
  percent: formatPercent,
  date: formatDate,
  dateLong: formatDateLong,
  dateTime: formatDateTime,
  relativeTime: formatRelativeTime,
  truncate: truncateText,
  initials: getInitials,
  phone: formatPhone,
} as const;

export default fmt;