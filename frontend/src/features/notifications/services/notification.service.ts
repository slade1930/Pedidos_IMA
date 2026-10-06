// src/features/notifications/services/notification.service.ts

import { apiClient } from "@/lib/api/client";
import type {
  AppNotification,
  CreateNotificationPayload,
  PaginatedNotifications,
  UnreadCount,
  UpdateNotificationPayload,
} from "@/features/notifications/types/notification.types";

/** El interceptor desenvuelve `data`; acepta ambos formatos por seguridad. */
function unwrapList(
  data: AppNotification[] | PaginatedNotifications | undefined,
): AppNotification[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.data ?? [];
}

export const notificationService = {
  /** Notificaciones visibles para el usuario autenticado */
  async getMine(limit = 10, skip = 0): Promise<AppNotification[]> {
    const response = await apiClient.get<
      AppNotification[] | PaginatedNotifications
    >(`/notifications?limit=${limit}&skip=${skip}`);
    return unwrapList(response.data);
  },

  /** Conteo de no leídas del usuario autenticado */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<UnreadCount>(
      "/notifications/unread-count",
    );
    return response.data?.count ?? 0;
  },

  /** Marca una notificación como leída */
  async markAsRead(id: string): Promise<void> {
    await apiClient.post(`/notifications/${id}/read`);
  },

  /** Marca todas las visibles como leídas */
  async markAllAsRead(): Promise<void> {
    await apiClient.post("/notifications/read-all");
  },

  // ─── ADMIN ──────────────────────────────────────────────

  /** Listado admin con estadísticas (recipients_count / read_count) */
  async getAdminList(limit = 100, skip = 0): Promise<AppNotification[]> {
    const response = await apiClient.get<
      AppNotification[] | PaginatedNotifications
    >(`/notifications/admin?limit=${limit}&skip=${skip}`);
    return unwrapList(response.data);
  },

  /** Crea y envía una notificación */
  async create(
    payload: CreateNotificationPayload,
  ): Promise<AppNotification> {
    const response = await apiClient.post<AppNotification>(
      "/notifications",
      payload,
    );
    return response.data;
  },

  /** Edita título/mensaje/nivel de una notificación */
  async update(
    id: string,
    payload: UpdateNotificationPayload,
  ): Promise<AppNotification> {
    const response = await apiClient.put<AppNotification>(
      `/notifications/${id}`,
      payload,
    );
    return response.data;
  },

  /** Elimina (soft delete) una notificación */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },
};

export default notificationService;
