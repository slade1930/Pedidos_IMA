"use client";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/auth.store";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import type { UserRole } from "@/features/auth/types/auth.types";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const user     = useAuthStore((state) => state.user);
  const logout   = useAuthStore((state) => state.logout);
  const userRole: UserRole = user?.role ?? "client";
  
  const visibleItems = NAV_ITEMS.filter((item) =>
    (item.roles as readonly UserRole[]).includes(userRole)
  );

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const [avatarHovered, setAvatarHovered] = useState(false);
  const currentSection = visibleItems.find((item) => isActive(item.href))?.label ?? "Dashboard";

  return (
    <>
      <style>{`
        .itas-icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: rgba(253,248,240,0.45);
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07);
          transition: background 0.15s, color 0.15s;
          position: relative;
        }
        .itas-icon-btn:hover {
          background: rgba(255,255,255,0.1);
          color: #eef6f4;
        }
        .itas-hamburger {
          display: none;
        }
        @media (max-width: 1023px) {
          .itas-desktop-nav { display: none !important; }
          .itas-desktop-search { display: none !important; }
          .itas-hamburger { display: flex !important; }
          .itas-avatar-name-wrap { display: none !important; }
        }
      `}</style>

      {/* ── NAVBAR PRINCIPAL ─────────────────────────────────────────────── */}
      <div
        className="px-6 lg:px-8 flex items-center justify-between gap-4 relative bg-gradient-to-r from-[#0e1e33] via-[#142b45] to-[#1b4f72] border-b border-[#2fd4a7]/25 shadow-[0_8px_30px_-12px_rgba(10,25,45,0.6)]"
        style={{ height: "76px" }}
      >
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#2fd4a7] to-transparent opacity-60 pointer-events-none"
        />

        {/* ── LEFT: Logo + Nav ───────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {/* Hamburger mobile */}
          <button
            type="button"
            onClick={onMenuToggle}
            className="itas-icon-btn itas-hamburger flex lg:hidden"
            aria-label="Abrir menú"
          >
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* 🔄 LOGO CON IMAGEN - Reemplazo completo */}
          <Link
            href="/dashboard"
            className="group flex items-center flex-shrink-0 pr-6 border-r border-white/15 mr-3 transition-opacity hover:opacity-95"
          >
            <div className="relative flex items-center">
              <div aria-hidden="true" className="absolute -inset-x-3 -inset-y-1.5 rounded-2xl bg-[#2fd4a7]/25 blur-lg opacity-70 group-hover:opacity-100 transition-opacity" />
              <Image
                src="/images/ITAS_logo.png"
                alt="ITAS - Abasto Social"
                width={1254}
                height={1254}
                className="relative w-auto h-8 sm:h-10 object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-[1.04]"
                priority
              />
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="itas-desktop-nav hidden lg:flex items-center gap-1.5" aria-label="Navegación principal">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 text-sm font-semibold rounded-xl transition-all z-10 ${
                  isActive(item.href)
                    ? "text-[#0e1e33] font-bold"
                    : "text-[#eef6f4]/70 hover:text-[#eef6f4] hover:bg-white/5"
                }`}
              >
                <span className="relative z-10">{item.label}</span>
                {isActive(item.href) && (
                  <motion.span
                    layoutId="itas-active-nav"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 bg-gradient-to-b from-[#2fd4a7] to-[#2fbf9b] rounded-xl -z-10 shadow-[0_4px_16px_-4px_rgba(47,212,167,0.7)]"
                  />
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* ── RIGHT: Search + Notif + Avatar ─────────────────────────────── */}
        <div className="flex items-center gap-2">
          {/* Búsqueda global */}
          <div
            className={`itas-desktop-search hidden lg:flex items-center gap-2 h-8 px-3 rounded-lg border transition-all duration-200 cursor-text ${
              searchFocused
                ? "bg-white/12 border-[#2fd4a7]/60 shadow-[0_0_0_3px_rgba(47,212,167,0.15)]"
                : "bg-white/6 border-white/10 hover:border-white/20"
            }`}
          >
            <svg
              width="14" height="14" fill="none" viewBox="0 0 24 24"
              stroke={searchFocused ? "#2fd4a7" : "rgba(253,248,240,0.35)"}
              strokeWidth={2}
              style={{ flexShrink: 0, transition: "stroke 0.2s" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar en ITAS..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="bg-transparent border-none outline-none text-xs text-[#eef6f4] placeholder-[#eef6f4]/30 transition-all duration-300"
              style={{ width: searchFocused ? "180px" : "130px" }}
            />
            {!searchFocused && (
              <span className="text-[9px] text-[#eef6f4]/30 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 font-mono flex-shrink-0 leading-none">
                ⌘K
              </span>
            )}
          </div>

          {/* Notificaciones */}
          <NotificationBell />

          <div className="w-[1px] h-[22px] bg-white/10 mx-1" />

          {/* Avatar + Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setShowUserMenu((v) => !v)}
              onMouseEnter={() => setAvatarHovered(true)}
              onMouseLeave={() => setAvatarHovered(false)}
              className={`flex items-center gap-2 p-1 pr-2.5 rounded-xl border transition-all duration-200 ${
                showUserMenu || avatarHovered
                  ? "border-[#2fd4a7]/50 bg-[#2fd4a7]/10"
                  : "border-[#2fd4a7]/20 bg-[#2fd4a7]/5"
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2fd4a7] to-[#20917a] flex items-center justify-center text-xs font-black text-[#0e1e33] flex-shrink-0 shadow-sm">
                {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <div className="itas-avatar-name-wrap flex flex-col text-left">
                <span className="text-xs font-bold text-[#eef6f4] leading-none max-w-[88px] overflow-hidden text-ellipsis white-space-nowrap">
                  {user?.full_name?.split(" ")[0] ?? "Usuario"}
                </span>
                <span className="text-[10px] text-[#eef6f4]/40 capitalize font-medium mt-0.5 leading-none">
                  {user?.role ?? ""}
                </span>
              </div>
              <motion.svg
                width="13" height="13" fill="none" viewBox="0 0 24 24"
                stroke="rgba(253,248,240,0.4)" strokeWidth={2.5}
                animate={{ rotate: showUserMenu ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </motion.svg>
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-[calc(100%+10px)] w-56 bg-white/95 backdrop-blur-md rounded-2xl border border-[#e4f0ed] shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-[#e4f0ed] bg-gradient-to-br from-[#1b4f72]/[0.03] to-[#2fd4a7]/[0.05] flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1b4f72] to-[#2e7d9e] flex items-center justify-center text-sm font-black text-[#2fd4a7] shadow-sm">
                      {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#142b45] truncate max-w-[130px] leading-tight">
                        {user?.full_name ?? "Usuario"}
                      </p>
                      <p className="text-[10px] font-semibold text-[#142b45]/50 capitalize mt-0.5 leading-none">
                        {user?.role ?? ""}
                      </p>
                    </div>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#142b45]/70 hover:text-[#1b4f72] hover:bg-[#1b4f72]/5 transition-colors"
                    >
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Configuración
                    </Link>
                  </div>
                  <div className="border-t border-[#e4f0ed] py-1 bg-neutral-50/50">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#C94B32] hover:bg-[#C94B32]/5 transition-colors text-left"
                    >
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                      Cerrar sesión
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── SUBBAR — Breadcrumb + Estado ─────────────────────────────────── */}
      <div
        className="px-6 lg:px-8 flex items-center justify-between bg-[#0d1830]/95 border-b border-[#2fd4a7]/15 backdrop-blur-sm"
        style={{ height: "34px" }}
      >
        <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide">
          <span className="text-[#8fdcc9] uppercase font-bold">ITAS</span>
          <span className="text-[#eef6f4]/20">›</span>
          <span className="text-[#eef6f4]/70 font-semibold uppercase text-[10px] tracking-wider">
            {currentSection}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#2fd4a7] bg-[#2fd4a7]/10 border border-[#2fd4a7]/25 rounded-full px-2.5 py-0.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2fd4a7] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2fd4a7]"></span>
          </span>
          Sistema activo
        </div>
      </div>
    </>
  );
}

export default Header;