// src/app/(dashboard)/dashboard/notifications/page.tsx

"use client";

import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  useAdminNotifications,
  useCreateNotification,
  useDeleteNotification,
} from "@/features/notifications/hooks/useNotifications";
import type {
  AppNotification,
  CreateNotificationPayload,
  NotificationLevel,
} from "@/features/notifications/types/notification.types";
import { useUsers } from "@/features/users/hooks/useUsers";
import type { User } from "@/features/users/types/user.types";

type ModalMode = "create" | null;

const LEVEL_OPTIONS: { value: NotificationLevel; label: string }[] = [
  { value: "info", label: "Información" },
  { value: "success", label: "Éxito" },
  { value: "warning", label: "Advertencia" },
  { value: "error", label: "Error" },
];

const LEVEL_STYLES: Record<string, string> = {
  info: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  success: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300",
  error: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString("es-PA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AppNotification | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [level, setLevel] = useState<NotificationLevel>("info");
  const [audience, setAudience] = useState<"all" | "users">("all");
  const [recipientIds, setRecipientIds] = useState<string[]>([]);

  const { data: notifications = [] } = useAdminNotifications();
  const { data: usersData } = useUsers({ limit: 100 });
  const users = useMemo(
    () =>
      Array.isArray(usersData)
        ? (usersData as User[])
        : ((usersData as { data?: User[] } | undefined)?.data ?? []),
    [usersData],
  );

  const createMutation = useCreateNotification();
  const deleteMutation = useDeleteNotification();

  const openCreateModal = useCallback(() => {
    setTitle("");
    setMessage("");
    setLevel("info");
    setAudience("all");
    setRecipientIds([]);
    setServerError(null);
    setModalMode("create");
  }, []);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setServerError(null);
  }, []);

  const toggleRecipient = useCallback((id: string) => {
    setRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  }, []);

  const handleSubmit = useCallback(() => {
    if (title.trim().length < 3) {
      setServerError("El título debe tener al menos 3 caracteres");
      return;
    }
    if (!message.trim()) {
      setServerError("El mensaje no puede estar vacío");
      return;
    }
    if (audience === "users" && recipientIds.length === 0) {
      setServerError("Selecciona al menos un usuario destinatario");
      return;
    }

    const payload: CreateNotificationPayload = {
      title: title.trim(),
      message: message.trim(),
      level,
      audience,
      recipient_ids: audience === "users" ? recipientIds : undefined,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["notifications"],
        });
        closeModal();
      },
      onError: (error: { message: string }) => {
        setServerError(error.message || "Error al crear la notificación");
      },
    });
  }, [
    title,
    message,
    level,
    audience,
    recipientIds,
    createMutation,
    queryClient,
    closeModal,
  ]);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteConfirm) return;
    deleteMutation.mutate(deleteConfirm.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["notifications"],
        });
        setDeleteConfirm(null);
      },
    });
  }, [deleteConfirm, deleteMutation, queryClient]);

  const isSubmitting = createMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <div className="space-y-6 relative">
      <div className="absolute top-[-80px] right-[-80px] -z-10 h-[300px] w-[300px] rounded-full bg-[#2e7d9e]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[200px] left-[-80px] -z-10 h-[300px] w-[300px] rounded-full bg-[#e4f0ed]/20 dark:bg-slate-900/30 blur-[120px] pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#142b45] dark:text-white leading-none">
            Notificaciones
          </h1>
          <p className="mt-2 text-sm text-[#142b45]/60 dark:text-slate-400 font-medium">
            Crea y envía notificaciones a los usuarios registrados de la plataforma
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#1b4f72] to-[#2e7d9e] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(92,138,60,0.18)] hover:shadow-[0_4px_25px_rgba(92,138,60,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
        >
          <svg className="h-5 w-5 mr-2 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva notificación
        </button>
      </div>

      {/* Lista de notificaciones enviadas */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#e4f0ed] dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 px-6 py-14 text-center">
            <svg className="mx-auto h-12 w-12 text-[#142b45]/20 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <h3 className="mt-4 text-lg font-extrabold text-[#142b45] dark:text-white">
              Aún no hay notificaciones
            </h3>
            <p className="mt-1 text-sm text-[#142b45]/50 dark:text-slate-400">
              Crea la primera para empezar a comunicarte con los usuarios
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-3xl border border-[#e4f0ed] dark:border-slate-800 bg-white/80 dark:bg-slate-900/40 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    notification.level === "success"
                      ? "bg-green-100 dark:bg-green-500/15"
                      : notification.level === "warning"
                      ? "bg-yellow-100 dark:bg-yellow-500/15"
                      : notification.level === "error"
                      ? "bg-red-100 dark:bg-red-500/15"
                      : "bg-blue-100 dark:bg-blue-500/15"
                  }`}
                >
                  <svg
                    className={`h-5 w-5 ${
                      notification.level === "success"
                        ? "text-green-600 dark:text-green-400"
                        : notification.level === "warning"
                        ? "text-yellow-600 dark:text-yellow-400"
                        : notification.level === "error"
                        ? "text-red-600 dark:text-red-400"
                        : "text-blue-600 dark:text-blue-400"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-extrabold text-[#142b45] dark:text-white truncate">
                      {notification.title}
                    </h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${LEVEL_STYLES[notification.level]}`}>
                      {notification.level}
                    </span>
                    <span className="text-[10px] font-bold text-[#1b4f72]/60 dark:text-slate-400 bg-[#e4f0ed]/60 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {notification.audience === "all"
                        ? "Todos los usuarios"
                        : `Destinatarios específicos (${notification.recipients_count ?? 0})`}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#142b45]/60 dark:text-slate-400 line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#142b45]/40 dark:text-slate-500">
                    <span>{formatDate(notification.created_at)}</span>
                    <span>
                      {notification.read_count ?? 0}/{notification.recipients_count ?? 0} leídas
                    </span>
                    <div className="w-32 h-1.5 rounded-full bg-[#e4f0ed] dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#2fd4a7] to-[#1b4f72]"
                        style={{
                          width: `${(notification.recipients_count ?? 0) > 0 ? Math.round(((notification.read_count ?? 0) / (notification.recipients_count ?? 1)) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setDeleteConfirm(notification)}
                  className="flex-shrink-0 p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                  aria-label="Eliminar notificación"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Crear */}
      {modalMode === "create" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-955/40 backdrop-blur-md transition-opacity" onClick={closeModal} />
          <div className="relative bg-white dark:bg-slate-950 rounded-3xl border border-[#e4f0ed]/30 dark:border-slate-900/60 shadow-[0_24px_60px_rgba(0,0,0,0.12)] w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-black text-[#142b45] dark:text-white">
              Nueva notificación
            </h2>
            <p className="mt-1 text-sm text-[#142b45]/50 dark:text-slate-400">
              Se enviará a los usuarios seleccionados
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#142b45]/70 dark:text-slate-400 mb-1.5">
                  Título *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={150}
                  placeholder="Ej: Nuevos productos disponibles"
                  className="block w-full rounded-xl border border-[#e4f0ed] dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 px-4 py-3 text-sm shadow-sm placeholder-[#142b45]/40 dark:placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-[#1b4f72]/10 focus:border-[#1b4f72] text-[#142b45] dark:text-white transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142b45]/70 dark:text-slate-400 mb-1.5">
                  Mensaje *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={2000}
                  rows={4}
                  placeholder="Escribe el contenido de la notificación..."
                  className="block w-full rounded-xl border border-[#e4f0ed] dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 px-4 py-3 text-sm shadow-sm placeholder-[#142b45]/40 dark:placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-[#1b4f72]/10 focus:border-[#1b4f72] text-[#142b45] dark:text-white transition-all duration-300 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#142b45]/70 dark:text-slate-400 mb-1.5">
                    Tipo *
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as NotificationLevel)}
                    className="block w-full rounded-xl border border-[#e4f0ed] dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-[#1b4f72]/10 focus:border-[#1b4f72] text-[#142b45] dark:text-white transition-all duration-300 appearance-none cursor-pointer"
                  >
                    {LEVEL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#142b45]/70 dark:text-slate-400 mb-1.5">
                    ¿A quién va dirigida? *
                  </label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as "all" | "users")}
                    className="block w-full rounded-xl border border-[#e4f0ed] dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-[#1b4f72]/10 focus:border-[#1b4f72] text-[#142b45] dark:text-white transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="all">Todos los usuarios</option>
                    <option value="users">Usuarios específicos</option>
                  </select>
                </div>
              </div>

              {audience === "users" && (
                <div>
                  <label className="block text-xs font-bold text-[#142b45]/70 dark:text-slate-400 mb-1.5">
                    Destinatarios ({recipientIds.length} seleccionados) *
                  </label>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-[#e4f0ed] dark:border-slate-800 divide-y divide-[#e4f0ed] dark:divide-slate-800">
                    {users.length === 0 ? (
                      <p className="px-4 py-6 text-center text-sm text-[#142b45]/40 dark:text-slate-500">
                        Cargando usuarios...
                      </p>
                    ) : (
                      users.map((user) => {
                        const selected = recipientIds.includes(user.id);
                        return (
                          <label
                            key={user.id}
                            className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                              selected
                                ? "bg-[#2fd4a7]/10"
                                : "hover:bg-slate-50 dark:hover:bg-slate-900/40"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleRecipient(user.id)}
                              className="h-4 w-4 rounded border-slate-300 text-[#1b4f72] focus:ring-[#1b4f72]/30 accent-[#1b4f72]"
                            />
                            <span className="flex-1 min-w-0">
                              <span className="block text-sm font-semibold text-[#142b45] dark:text-white truncate">
                                {user.full_name}
                              </span>
                              <span className="block text-xs text-[#142b45]/40 dark:text-slate-500 truncate">
                                {user.email}
                              </span>
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {serverError && (
                <div className="rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
                  {serverError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-2.5 text-sm font-bold text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="rounded-xl bg-gradient-to-r from-[#1b4f72] to-[#2e7d9e] px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Enviando..." : "Enviar notificación"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminar */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-955/40 backdrop-blur-md transition-opacity" onClick={() => !isDeleting && setDeleteConfirm(null)} />
          <div className="relative bg-white dark:bg-slate-950 rounded-3xl border border-rose-500/10 dark:border-slate-900/60 shadow-[0_24px_60px_rgba(0,0,0,0.12)] w-full max-w-sm p-6 md:p-8 text-center animate-in fade-in zoom-in-95 duration-200">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-650 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30 mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </div>
              <h3 className="text-lg font-extrabold text-[#142b45] dark:text-white leading-snug">
                Eliminar notificación
              </h3>
              <p className="mt-2.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                ¿Estás seguro de eliminar{" "}
                <span className="font-extrabold text-[#142b45] dark:text-white">
                  {deleteConfirm.title}
                </span>
                ? Desaparecerá de la bandeja de todos los usuarios.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-2.5 text-sm font-bold text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer"
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}