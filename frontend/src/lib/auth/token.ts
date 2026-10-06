// src/lib/auth/token.ts

const ACCESS_TOKEN_KEY = "itas_access_token";
const REFRESH_TOKEN_KEY = "itas_refresh_token";
const SESSION_COOKIE = "has_session";

/**
 * TokenStorage
 *
 * FASE 1.1 — Los tokens de acceso/refresco viven SOLO en cookies httpOnly
 * del backend ("itas_access" / "itas_refresh") y NO son legibles desde JS.
 * Esta clase ya NO persiste ningún token en localStorage.
 *
 * Responsabilidad actual:
 * - Gestionar la cookie ligera "has_session" (NO HttpOnly) que el middleware
 *   de Next.js (Edge Runtime) usa para decidir si hay una sesión activa sin
 *   poder leer localStorage (no disponible en el servidor).
 * - Limpiar residuos de tokens en localStorage de versiones anteriores.
 *
 * Consumidores:
 * - Axios Interceptors (src/lib/api/client.ts)
 * - Auth Store (src/stores/auth.store.ts)
 * - Middleware (src/middleware.ts)
 * - Guard de rutas (src/lib/auth/guards.ts)
 */

class TokenStorage {
  // ─── DETECCIÓN DE SESIÓN ────────────────────────────────

  /**
   * Verifica si hay una sesión activa leyendo la cookie ligera "has_session".
   * El token real (httpOnly) no es legible; esta cookie es solo una señal.
   */
  hasSession(): boolean {
    if (typeof window === "undefined") return false;
    return document.cookie
      .split("; ")
      .some((part) => part.startsWith(`${SESSION_COOKIE}=true`));
  }

  /**
   * Marca la sesión como activa tras un login/refresh exitoso.
   * El backend ya dejó las cookies httpOnly; aquí solo se avisa al middleware.
   */
  markSessionActive(): void {
    this.setSessionCookie(true);
  }

  /**
   * Limpia toda la sesión:
   * - Elimina la cookie ligera has_session
   * - Elimina residuos de tokens de localStorage (versiones anteriores)
   * - Las cookies httpOnly se borran en el backend (POST /auth/logout)
   */
  clearSession(): void {
    this.setSessionCookie(false);
    this.removeLegacyTokens();
  }

  // ─── LIMPIEZA DE RESIDUOS LEGADOS ────────────────────────

  /**
   * Borra cualquier token que versiones anteriores hayan dejado en
   * localStorage. A partir de FASE 1.1 los tokens nunca se persisten en JS.
   */
  private removeLegacyTokens(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  // ─── COOKIE DE SESIÓN (PARA MIDDLEWARE) ─────────────────

  /**
   * Crea o elimina la cookie has_session.
   *
   * Configuración:
   * - path=/ → disponible en toda la app
   * - max-age 30 días → alinea con la vida útil de la cookie httpOnly
   *   itas_refresh; así la sesión sobrevive a reinicios del navegador.
   * - SameSite=Lax → protege contra CSRF sin romper navegación normal
   * - No lleva HttpOnly porque el cliente JS necesita eliminarla en logout
   * - No lleva Secure para funcionar en localhost (en producción agregar)
   */
  private setSessionCookie(active: boolean): void {
    if (typeof window === "undefined") return;

    if (active) {
      document.cookie = `${SESSION_COOKIE}=true; path=/; max-age=2592000; SameSite=Lax`;
    } else {
      // Eliminar cookie: poner fecha de expiración en el pasado
      document.cookie = `${SESSION_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    }
  }
}

/** Instancia singleton exportada para uso en toda la aplicación */
export const tokenStorage = new TokenStorage();