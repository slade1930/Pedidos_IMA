// src/features/notifications/types/notification.types.ts

/** Nivel visual de la notificación */
export type NotificationLevel = "info" | "success" | "warning" | "error";

/** Audiencia: todos los usuarios registrados o destinatarios específicos */
export type NotificationAudience = "all" | "users";

/** Notificación tal como la devuelve el backend */
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  level: NotificationLevel;
  audience: NotificationAudience;
  recipient_ids: string[] | null;
  created_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  /** Solo en respuestas del usuario: leída o no */
  read: boolean | null;
  /** Solo en respuestas admin: total de destinatarios */
  recipients_count: number | null;
  /** Solo en respuestas admin: cuántos la han leído */
  read_count: number | null;
}

/**
 * Forma paginada del backend. Ojo: el interceptor de axios desenvuelve
 * `data`, así que en la práctica llega como `AppNotification[]`.
 */
export interface PaginatedNotifications {
  data: AppNotification[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CreateNotificationPayload {
  title: string;
  message: string;
  level: NotificationLevel;
  audience: NotificationAudience;
  recipient_ids?: string[];
}

export interface UpdateNotificationPayload {
  title?: string;
  message?: string;
  level?: NotificationLevel;
}

export interface UnreadCount {
  count: number;
}
