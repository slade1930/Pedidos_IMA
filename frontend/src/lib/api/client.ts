// src/lib/api/client.ts

import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import { tokenStorage } from "@/lib/auth/token";

// ─── CONFIGURACIÓN BASE ───────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const API_VERSION = "/api/v1";

export const apiClient = axios.create({
  baseURL: `${API_URL}${API_VERSION}`,
  headers: {
    "Content-Type": "application/json",
  },
  // Permite recibir/enviar la cookie httpOnly "itas_refresh" (login/refresh/logout)
  withCredentials: true,
  timeout: 30000,
});

// ─── TIPOS ────────────────────────────────────────────────

interface BackendError {
  success: boolean;
  message: string;
  detail?: unknown;
  code?: string;
}

// ─── UTILITARIO DE ERRORES ────────────────────────────────

function getErrorMessage(data: unknown): string {
  if (!data) return "Error de conexión";

  const d = data as Record<string, unknown>;

  // Error de validación de FastAPI: { detail: [{ loc, msg, type }] }
  if (d.detail && Array.isArray(d.detail)) {
    const details = d.detail as Array<{ loc: (string | number)[]; msg: string }>;
    return details.map((e) => `${e.loc.join(".")}: ${e.msg}`).join(". ");
  }

  // Error con message string
  if (d.message && typeof d.message === "string") return d.message;

  // Error con detail string
  if (d.detail && typeof d.detail === "string") return d.detail;

  // Error con detail objeto (ej: PDA) — tomar message del objeto
  if (d.detail && typeof d.detail === "object") {
    const obj = d.detail as Record<string, unknown>;
    return (obj.message as string) || "Error de conexión";
  }

  return "Error de conexión";
}

// ─── INTERCEPTOR DE REQUEST ───────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // FASE 1.1: el access token viaja en la cookie httpOnly "itas_access"
    // y se envía automáticamente con withCredentials. No se agrega
    // header Authorization manual desde JS (evita exfiltración por XSS).

    // Si los datos son FormData, eliminar Content-Type para que axios lo configure automáticamente
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    // NO agregar trailing slash - FastAPI redirige 307 y pierde el body del POST

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ─── INTERCEPTOR DE RESPONSE ──────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  retry: () => void;
  fail: (error: AxiosError) => void;
}> = [];

function processQueue(error: AxiosError | null = null): void {
  failedQueue.forEach((request) => {
    if (error) {
      request.fail(error);
    } else {
      request.retry();
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Si es blob, devolver sin modificar
    if (response.config.responseType === "blob" || response.data instanceof Blob) {
      return response;
    }
    
    const payload = response.data;
    if (
      payload &&
      typeof payload === "object" &&
      "success" in payload &&
      "data" in payload
    ) {
      return { ...response, data: payload.data };
    }
    return response;
  },
  async (error: AxiosError<BackendError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/refresh") ||
      // FASE 1.5: un 401 en login/register/logout NO debe disparar refresh
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/logout") ||
      originalRequest.url?.includes("/users/register");

    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // Esperar a que el refresh en curso termine y reintentar (o fallar)
        return new Promise<AxiosResponse>((resolve, reject) => {
          failedQueue.push({
            retry: () => resolve(apiClient(originalRequest)),
            fail: reject,
          });
        });
      }

      isRefreshing = true;
      originalRequest._retry = true;

      try {
        // FASE 1.1: el refresh token viaja en la cookie httpOnly "itas_refresh";
        // el navegador la envía con withCredentials. La nueva access token se
        // rota en la cookie "itas_access" automáticamente (set-cookie).
        await axios.post(
          `${API_URL}${API_VERSION}/auth/refresh`,
          {},
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        tokenStorage.markSessionActive();
        processQueue();

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        tokenStorage.clearSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Obtener el detail original
    const responseData = error.response?.data as Record<string, unknown> | undefined;
    const detail = responseData?.detail;

    // Formatear error
    const formattedError = {
      status: error.response?.status ?? 0,
      message: getErrorMessage(responseData),
      detail: detail,
      originalError: error,
    };

    return Promise.reject(formattedError);
  }
);

export default apiClient;
