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
    const publicRoutes = ["/auth/login", "/auth/refresh", "/users/register"];

    const isPublicRoute = publicRoutes.some((route) =>
      config.url?.includes(route)
    );

    if (!isPublicRoute) {
      const token = tokenStorage.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Si los datos son FormData, eliminar Content-Type para que axios lo configure automáticamente
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    // Agregar trailing slash para evitar redirect 307 que pierde autenticación
    if (config.url && !config.url.includes("?") && !config.url.endsWith("/")) {
      config.url = config.url + "/";
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ─── INTERCEPTOR DE RESPONSE ──────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}> = [];

function processQueue(error: AxiosError | null, token: string | null): void {
  failedQueue.forEach((request) => {
    if (error || !token) {
      request.reject(error!);
    } else {
      request.resolve(token);
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

    if (
      error.response?.status === 401 &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest._retry
    ) {
      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        tokenStorage.clearSession();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      originalRequest._retry = true;

      try {
        const response = await axios.post<{ success: boolean; data: { access_token: string } }>(
          `${API_URL}${API_VERSION}/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const payload = response.data;
        const newAccessToken = payload.data.access_token;
        tokenStorage.setAccessToken(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
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
