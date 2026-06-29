// src/lib/auth/token.ts

const ACCESS_TOKEN_KEY = "ima_access_token";
const REFRESH_TOKEN_KEY = "ima_refresh_token";
const SESSION_COOKIE = "has_session";

/**
 * TokenStorage
 * 
 * Clase responsable de la persistencia y gestión de tokens de autenticación.
 * 
 * Utiliza localStorage para tokens y cookies para indicador de sesión.
 * 
 * La cookie "has_session" permite al middleware de Next.js (Edge Runtime)
 * verificar si hay sesión activa sin acceder a localStorage, que no está
 * disponible en el servidor.
 * 
 * Consumidores:
 * - Axios Interceptors (src/lib/api/client.ts)
 * - Auth Store (src/stores/auth.store.ts)
 * - Middleware (src/middleware.ts)
 * - AuthProvider (src/providers/AuthProvider.tsx)
 */

class TokenStorage {
  // ─── ACCESS TOKEN ───────────────────────────────────────

  /** Guarda el access token en localStorage y crea cookie de sesión */
  setAccessToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    this.setSessionCookie(true);
  }

  /** Obtiene el access token. Retorna null si no existe o está en SSR */
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  /** Elimina el access token del almacenamiento */
  removeAccessToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  // ─── REFRESH TOKEN ──────────────────────────────────────

  /** Guarda el refresh token en localStorage */
  setRefreshToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  /** Obtiene el refresh token. Retorna null si no existe o está en SSR */
  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /** Elimina el refresh token del almacenamiento */
  removeRefreshToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  // ─── SESIÓN COMPLETA ────────────────────────────────────

  /** Verifica si existe un access token guardado */
  hasAccessToken(): boolean {
    return this.getAccessToken() !== null;
  }

  /** Verifica si existe un refresh token guardado */
  hasRefreshToken(): boolean {
    return this.getRefreshToken() !== null;
  }

  /**
   * Limpia toda la sesión:
   * - Elimina tokens de localStorage
   * - Elimina cookie de sesión
   */
  clearSession(): void {
    this.removeAccessToken();
    this.removeRefreshToken();
    this.setSessionCookie(false);
  }

  // ─── COOKIE DE SESIÓN (PARA MIDDLEWARE) ─────────────────

  /**
   * Crea o elimina la cookie has_session.
   * 
   * Esta cookie es leída por el middleware de Next.js para saber
   * si hay una sesión activa sin necesidad de leer localStorage.
   * 
   * Configuración:
   * - path=/ → disponible en toda la app
   * - SameSite=Lax → protege contra CSRF sin romper navegación normal
   * - No lleva HttpOnly porque el cliente JS necesita eliminarla en logout
   * - No lleva Secure para funcionar en localhost (en producción agregar)
   */
  private setSessionCookie(active: boolean): void {
    if (typeof window === "undefined") return;

    if (active) {
      document.cookie = `${SESSION_COOKIE}=true; path=/; SameSite=Lax`;
    } else {
      // Eliminar cookie: poner fecha de expiración en el pasado
      document.cookie = `${SESSION_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    }
  }
}

/** Instancia singleton exportada para uso en toda la aplicación */
export const tokenStorage = new TokenStorage();