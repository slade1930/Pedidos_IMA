// src/lib/utils/errors.ts

// ─── TIPOS ─────────────────────────────────────────────────

/** Error estandarizado de la aplicación */
export interface AppError {
  message: string;
  status?: number;
  code?: string;
  field?: string;
  originalError?: unknown;
}

/** Error de validación del backend (FastAPI/Pydantic) */
interface ValidationErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

// ─── EXTRACCIÓN DE MENSAJE ─────────────────────────────────

/**
 * Extrae un mensaje legible de cualquier tipo de error.
 * 
 * Soporta:
 * - Axios errors (del interceptor)
 * - Errores de validación de FastAPI
 * - Errores nativos de JavaScript
 * - Strings directos
 * 
 * @param error - El error a parsear
 * @returns Mensaje de error legible para el usuario
 * 
 * Uso:
 * ```ts
 * catch (error) {
 *   toast.error(getErrorMessage(error));
 * }
 * ```
 */
export function getErrorMessage(error: unknown): string {
  // Ya formateado por el interceptor de Axios
  if (isAppError(error)) {
    return error.message;
  }

  // Error nativo de JavaScript
  if (error instanceof Error) {
    return error.message;
  }

  // Error de validación de FastAPI (array de detalles)
  if (isValidationError(error)) {
    return formatValidationError(error);
  }

  // String directo
  if (typeof error === "string") {
    return error;
  }

  // Fallback
  return "Ocurrió un error inesperado";
}

// ─── TYPE GUARDS ───────────────────────────────────────────

/**
 * Verifica si un error es un AppError (formateado por el interceptor).
 */
function isAppError(error: unknown): error is AppError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as AppError).message === "string"
  );
}

/**
 * Verifica si un error es de validación de FastAPI.
 * 
 * Formato: { detail: [{ loc: [...], msg: "...", type: "..." }] }
 */
function isValidationError(
  error: unknown
): error is { detail: ValidationErrorDetail[] } {
  return (
    typeof error === "object" &&
    error !== null &&
    "detail" in error &&
    Array.isArray((error as { detail: unknown }).detail)
  );
}

// ─── FORMATEO DE ERRORES ───────────────────────────────────

/**
 * Formatea errores de validación de FastAPI en un string legible.
 * 
 * @param error - Error con array de detalles de validación
 * @returns Mensaje formateado
 */
function formatValidationError(error: {
  detail: ValidationErrorDetail[];
}): string {
  const messages = error.detail.map((d) => {
    const field = d.loc[d.loc.length - 1];
    return `${field}: ${d.msg}`;
  });

  return messages.join(". ");
}

// ─── CREACIÓN DE ERRORES ───────────────────────────────────

/**
 * Crea un AppError con campos opcionales.
 * 
 * @param message - Mensaje descriptivo
 * @param options - Campos adicionales (status, code, field)
 * @returns AppError
 * 
 * Uso:
 * ```ts
 * throw createError("Usuario no encontrado", { status: 404 });
 * ```
 */
export function createError(
  message: string,
  options?: Partial<Omit<AppError, "message">>
): AppError {
  return {
    message,
    status: options?.status,
    code: options?.code,
    field: options?.field,
    originalError: options?.originalError,
  };
}

// ─── CONSTANTES ────────────────────────────────────────────

/** Mensajes de error comunes reutilizables */
export const ERROR_MESSAGES = {
  NETWORK: "Error de conexión. Verifica tu conexión a internet",
  UNAUTHORIZED: "No tienes autorización para realizar esta acción",
  SESSION_EXPIRED: "Tu sesión ha expirado. Inicia sesión nuevamente",
  NOT_FOUND: "El recurso solicitado no fue encontrado",
  SERVER_ERROR: "Error del servidor. Intenta nuevamente más tarde",
  VALIDATION: "Por favor, corrige los errores indicados",
  GENERIC: "Ocurrió un error inesperado",
} as const;

// ─── OBJETO ERRORS ─────────────────────────────────────────

/**
 * Objeto que agrupa todas las utilidades de error.
 * 
 * Uso:
 * ```ts
 * import { errors } from "@/lib/utils/errors";
 * 
 * errors.getMessage(error);
 * errors.create("Mensaje", { status: 400 });
 * ```
 */
export const errors = {
  getMessage: getErrorMessage,
  create: createError,
  MESSAGES: ERROR_MESSAGES,
} as const;

export default errors;