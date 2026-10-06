// src/features/notifications/components/NotificationBell.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  useMyNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/features/notifications/hooks/useNotifications";
import { useAuthStore } from "@/stores/auth.store";

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffMin < 1440) return `Hace ${Math.floor(diffMin / 60)}h`;
  return date.toLocaleDateString("es-PA", { month: "short", day: "numeric" });
}

const LEVEL_STYLES: Record<string, { container: string; icon: string }> = {
  success: { container: "bg-green-500/15", icon: "text-green-400" },
  warning: { container: "bg-yellow-500/15", icon: "text-yellow-400" },
  error: { container: "bg-red-500/15", icon: "text-red-400" },
  info: { container: "bg-blue-500/15", icon: "text-blue-300" },
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);

  const { data: notifications = [] } = useMyNotifications(8);
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const canManage = user?.role === "admin";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="itas-icon-btn"
        aria-label="Notificaciones"
        onClick={() => setIsOpen((v) => !v)}
      >
        <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[#C94B32] border border-[#1b4f72] text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#0e1e33] dark:bg-slate-950 rounded-2xl border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.5)] z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-sm font-semibold text-[#eef6f4]">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsReadMutation.mutate()}
                className="text-xs text-[#2fd4a7] hover:text-[#4ee0b8]"
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <svg className="mx-auto h-8 w-8 text-[#eef6f4]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                <p className="mt-2 text-sm text-[#eef6f4]/50">No hay notificaciones</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const styles = LEVEL_STYLES[notif.level] ?? LEVEL_STYLES.info;
                return (
                  <button
                    key={notif.id}
                    type="button"
                    onClick={() => {
                      if (!notif.read) markAsReadMutation.mutate(notif.id);
                    }}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                      !notif.read ? "bg-[#2fd4a7]/5" : ""
                    }`}
                  >
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${styles.container}`}
                    >
                      <svg className={`h-4 w-4 ${styles.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-[#eef6f4] truncate">
                        {notif.title}
                      </span>
                      <span className="block text-xs text-[#eef6f4]/50 mt-0.5 line-clamp-2">
                        {notif.message}
                      </span>
                      <span className="block text-xs text-[#eef6f4]/30 mt-1">
                        {formatTime(notif.created_at)}
                      </span>
                    </span>
                    {!notif.read && (
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-[#2fd4a7] flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {canManage && (
            <Link
              href="/dashboard/notifications"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-center text-xs font-semibold text-[#2fd4a7] hover:text-[#4ee0b8] hover:bg-white/5 border-t border-white/10"
            >
              Gestionar notificaciones
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;