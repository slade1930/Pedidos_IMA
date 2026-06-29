// src/features/users/services/user.service.ts

import { apiClient } from "@/lib/api/client";
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  AdminUpdateUserPayload,
  UsersResponse,
  UserFilters,
} from "@/features/users/types/user.types";

// ─── SERVICIO DE USUARIOS ─────────────────────────────────

export const userService = {
  /**
   * Obtiene lista paginada de usuarios con filtros opcionales.
   * 
   * GET /api/v1/users
   */
  async getUsers(filters?: UserFilters): Promise<UsersResponse> {
    const params = new URLSearchParams();

    if (filters?.search) params.set("search", filters.search);
    if (filters?.role) params.set("role", filters.role);
    if (filters?.is_active !== undefined) params.set("is_active", String(filters.is_active));
    if (filters?.skip !== undefined) params.set("skip", String(filters.skip));
    if (filters?.limit !== undefined) params.set("limit", String(filters.limit));

    const queryString = params.toString();
    const endpoint = queryString ? `/users?${queryString}` : "/users";

    const response = await apiClient.get<UsersResponse>(endpoint);
    return response.data;
  },

  /**
   * Obtiene un usuario por su ID.
   * 
   * GET /api/v1/users/{id}
   */
  async getUser(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  /**
   * Registra un nuevo usuario.
   * 
   * POST /api/v1/users/register
   */
  async createUser(data: CreateUserPayload): Promise<User> {
    const response = await apiClient.post<User>("/users/register", data);
    return response.data;
  },

  /**
   * Actualiza el perfil del usuario autenticado.
   * 
   * PUT /api/v1/users/me
   */
  async updateMe(data: UpdateUserPayload): Promise<User> {
    const response = await apiClient.put<User>("/users/me", data);
    return response.data;
  },

  /**
   * Actualiza un usuario (admin).
   * 
   * PUT /api/v1/users/{id}/admin
   */
  async adminUpdate(id: string, data: AdminUpdateUserPayload): Promise<User> {
    const response = await apiClient.put<User>(`/users/${id}/admin`, data);
    return response.data;
  },

  /**
   * Desactiva un usuario (soft delete).
   * 
   * DELETE /api/v1/users/{id}
   */
  async deactivateUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};

export default userService;