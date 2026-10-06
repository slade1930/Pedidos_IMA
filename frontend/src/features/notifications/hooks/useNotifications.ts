// src/features/notifications/hooks/useNotifications.ts

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { notificationService } from "@/features/notifications/services/notification.service";
import type {
  CreateNotificationPayload,
  UpdateNotificationPayload,
} from "@/features/notifications/types/notification.types";

/** El sondeo mantiene la campana fresca sin WebSockets */
const POLL_INTERVAL = 30_000;
const STALE_TIME = 15_000;

/** Notificaciones del usuario autenticado (con polling) */
export function useMyNotifications(limit = 10) {
  return useQuery({
    queryKey: queryKeys.notifications.mine(limit),
    queryFn: () => notificationService.getMine(limit),
    refetchInterval: POLL_INTERVAL,
    staleTime: STALE_TIME,
  });
}

/** Conteo de no leídas del usuario (con polling) */
export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: notificationService.getUnreadCount,
    refetchInterval: POLL_INTERVAL,
    staleTime: STALE_TIME,
  });
}

/** Marca una notificación como leída */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
    },
  });
}

/** Marca todas las notificaciones como leídas */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
    },
  });
}

// ─── ADMIN ────────────────────────────────────────────────

/** Listado admin de notificaciones enviadas */
export function useAdminNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.adminList(),
    queryFn: () => notificationService.getAdminList(100),
    staleTime: 30_000,
  });
}

/** Crea y envía una notificación */
export function useCreateNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateNotificationPayload) =>
      notificationService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
    },
  });
}

/** Edita una notificación */
export function useUpdateNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateNotificationPayload;
    }) => notificationService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
    },
  });
}

/** Elimina una notificación */
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
    },
  });
}
