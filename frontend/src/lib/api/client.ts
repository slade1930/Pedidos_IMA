// src/lib/api/client.ts

import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import { tokenStorage } from "@/lib/auth/token";

// ======================================================
// CONFIGURACIÓN BASE
// ======================================================

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const API_VERSION = "/api/v1";

// ===== DEBUG =====
console.log("====================================");
console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
console.log("API_URL:", API_URL);
console.log("BASE URL:", `${API_URL}${API_VERSION}`);
console.log("====================================");

export const apiClient = axios.create({
  baseURL: `${API_URL}${API_VERSION}`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ======================================================
// TIPOS
// ======================================================

interface BackendError {
  success: boolean;
  message: string;
  detail?: unknown;
  code?: string;
}

// ======================================================
// FORMATEADOR DE ERRORES
// ======================================================

function getErrorMessage(data: unknown): string {
  if (!data) return "Error de conexión";

  const d = data as Record<string, unknown>;

  if (d.detail && Array.isArray(d.detail)) {
    const details = d.detail as Array<{
      loc: (string | number)[];
      msg: string;
    }>;

    return details
      .map((e) => `${e.loc.join(".")}: ${e.msg}`)
      .join(". ");
  }

  if (typeof d.message === "string") return d.message;

  if (typeof d.detail === "string") return d.detail;

  if (typeof d.detail === "object" && d.detail !== null) {
    const obj = d.detail as Record<string, unknown>;
    return (obj.message as string) || "Error de conexión";
  }

  return "Error de conexión";
}

// ======================================================
// REQUEST INTERCEPTOR
// ======================================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log("➡️ REQUEST");
    console.log(config.method?.toUpperCase(), config.baseURL + config.url);

    const publicRoutes = [
      "/auth/login",
      "/auth/refresh",
      "/users/register",
    ];

    const isPublicRoute = publicRoutes.some((route) =>
      config.url?.includes(route)
    );

    if (!isPublicRoute) {
      const token = tokenStorage.getAccessToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ======================================================
// REFRESH TOKEN
// ======================================================

let isRefreshing = false;

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}> = [];

function processQueue(
  error: AxiosError | null,
  token: string | null
): void {
  failedQueue.forEach((request) => {
    if (error || !token) {
      request.reject(error!);
    } else {
      request.resolve(token);
    }
  });

  failedQueue = [];
}

// ======================================================
// RESPONSE INTERCEPTOR
// ======================================================

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log("✅ RESPONSE");
    console.log(response.status, response.config.url);

    if (
      response.config.responseType === "blob" ||
      response.data instanceof Blob
    ) {
      return response;
    }

    const payload = response.data;

    if (
      payload &&
      typeof payload === "object" &&
      "success" in payload &&
      "data" in payload
    ) {
      return {
        ...response,
        data: payload.data,
      };
    }

    return response;
  },

  async (error: AxiosError<BackendError>) => {
    console.error("❌ AXIOS ERROR");
    console.error("URL:", error.config?.baseURL + error.config?.url);
    console.error("STATUS:", error.response?.status);
    console.error("DATA:", error.response?.data);

    const originalRequest =
      error.config as InternalAxiosRequestConfig & {
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
        return new Promise((resolve, reject) => {
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
        const response = await axios.post(
          `${API_URL}${API_VERSION}/auth/refresh`,
          {
            refresh_token: refreshToken,
          }
        );

        const newAccessToken = response.data.data.access_token;

        tokenStorage.setAccessToken(newAccessToken);

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        tokenStorage.clearSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const responseData =
      error.response?.data as Record<string, unknown> | undefined;

    return Promise.reject({
      status: error.response?.status ?? 0,
      message: getErrorMessage(responseData),
      detail: responseData?.detail,
      originalError: error,
    });
  }
);

export default apiClient;
