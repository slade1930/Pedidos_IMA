// src/features/auth/services/auth.service.ts

import { apiClient } from "@/lib/api/client";
import type {
  LoginCredentials,
  RegisterData,
  SessionResponse,
  LogoutResponse,
  AuthUser,
} from "@/features/auth/types/auth.types";

export const authService = {
  /**
   * Inicia sesión con email y contraseña.
   * Los tokens se reciben en cookies httpOnly (itas_access / itas_refresh).
   *
   * POST /api/v1/auth/login
   */
  async login(credentials: LoginCredentials): Promise<SessionResponse> {
    const response = await apiClient.post<SessionResponse>(
      "/auth/login",
      credentials
    );
    return response.data;
  },

  /**
   * Registra un nuevo usuario.
   *
   * POST /api/v1/users/register
   */
  async register(data: RegisterData): Promise<AuthUser> {
    const response = await apiClient.post<AuthUser>(
      "/users/register",
      data
    );
    return response.data;
  },

  /**
   * Cierra sesión.
   *
   * POST /api/v1/auth/logout
   */
  async logout(): Promise<LogoutResponse> {
    const response = await apiClient.post<LogoutResponse>("/auth/logout");
    return response.data;
  },

  /**
   * Obtiene el perfil del usuario autenticado.
   *
   * GET /api/v1/users/me
   */
  async getMe(): Promise<AuthUser> {
    const response = await apiClient.get<AuthUser>("/users/me");
    return response.data;
  },
};

export default authService;