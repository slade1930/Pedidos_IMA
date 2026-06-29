"use client";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/auth.store";
import { NAV_ITEMS } from "@/components/layout/nav-items";
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
        .ima-icon-btn {
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
        .ima-icon-btn:hover {
          background: rgba(255,255,255,0.1);
          color: #FDF8F0;
        }
        .ima-hamburger {
          display: none;
        }
        @media (max-width: 1023px) {
          .ima-desktop-nav { display: none !important; }
          .ima-desktop-search { display: none !important; }
          .ima-hamburger { display: flex !important; }
          .ima-avatar-name-wrap { display: none !important; }
        }
      `}</style>

      {/* ── NAVBAR PRINCIPAL ─────────────────────────────────────────────── */}
      <div
        className="px-6 lg:px-8 flex items-center justify-between gap-4 relative bg-gradient-to-b from-[#253912] to-[#3D5A1E] border-b border-[#F2A900]/15"
        style={{ height: "58px" }}
      >
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F2A900] to-transparent opacity-40 pointer-events-none"
        />

        {/* ── LEFT: Logo + Nav ───────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {/* Hamburger mobile */}
          <button
            type="button"
            onClick={onMenuToggle}
            className="ima-icon-btn ima-hamburger flex lg:hidden"
            aria-label="Abrir menú"
          >
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* 🔄 LOGO CON IMAGEN - Reemplazo completo */}
          <Link
            href="/dashboard"
            className="flex items-center flex-shrink-0 pr-5 border-r border-white/10 mr-2"
          >
            <div className="relative h-[54px] w-[200px]">
              <Image
                src="/images/LogoIMA.png"
                alt="IMA System - Mercadeo Agropecuario"
                fill
                className="object-contain object-left"
                priority
                sizes="120px"
              />
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="ima-desktop-nav hidden lg:flex items-center gap-1.5" aria-label="Navegación principal">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all z-10 ${
                  isActive(item.href)
                    ? "text-[#3D5A1E] font-bold"
                    : "text-[#FDF8F0]/65 hover:text-[#FDF8F0] hover:bg-white/5"
                }`}
              >
                <span className="relative z-10">{item.label}</span>
                {isActive(item.href) && (
                  <motion.span
                    layoutId="ima-active-nav"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 bg-[#F2A900] rounded-lg -z-10 shadow-sm"
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
            className={`ima-desktop-search hidden lg:flex items-center gap-2 h-8 px-3 rounded-lg border transition-all duration-200 cursor-text ${
              searchFocused
                ? "bg-white/12 border-[#F2A900]/50 shadow-[0_0_0_3px_rgba(242,169,0,0.12)]"
                : "bg-white/6 border-white/10 hover:border-white/20"
            }`}
          >
            <svg
              width="14" height="14" fill="none" viewBox="0 0 24 24"
              stroke={searchFocused ? "#F2A900" : "rgba(253,248,240,0.35)"}
              strokeWidth={2}
              style={{ flexShrink: 0, transition: "stroke 0.2s" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar en IMA..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="bg-transparent border-none outline-none text-xs text-[#FDF8F0] placeholder-[#FDF8F0]/30 transition-all duration-300"
              style={{ width: searchFocused ? "180px" : "130px" }}
            />
            {!searchFocused && (
              <span className="text-[9px] text-[#FDF8F0]/30 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 font-mono flex-shrink-0 leading-none">
                ⌘K
              </span>
            )}
          </div>

          {/* Notificaciones */}
          <button type="button" className="ima-icon-btn" aria-label="Notificaciones">
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#C94B32] border border-[#3D5A1E] animate-pulse" />
          </button>

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
                  ? "border-[#F2A900]/40 bg-[#F2A900]/10"
                  : "border-[#F2A900]/20 bg-[#F2A900]/5"
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#F2A900] to-[#C78500] flex items-center justify-center text-xs font-black text-[#3D5A1E] flex-shrink-0 shadow-sm">
                {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <div className="ima-avatar-name-wrap flex flex-col text-left">
                <span className="text-xs font-bold text-[#FDF8F0] leading-none max-w-[88px] overflow-hidden text-ellipsis white-space-nowrap">
                  {user?.full_name?.split(" ")[0] ?? "Usuario"}
                </span>
                <span className="text-[10px] text-[#FDF8F0]/40 capitalize font-medium mt-0.5 leading-none">
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
                  className="absolute right-0 top-[calc(100%+10px)] w-56 bg-white/95 backdrop-blur-md rounded-2xl border border-[#E8DDD0] shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-[#E8DDD0] bg-gradient-to-br from-[#3D5A1E]/[0.03] to-[#F2A900]/[0.03] flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#3D5A1E] to-[#4A6B2C] flex items-center justify-center text-sm font-black text-[#F2A900] shadow-sm">
                      {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#4A3728] truncate max-w-[130px] leading-tight">
                        {user?.full_name ?? "Usuario"}
                      </p>
                      <p className="text-[10px] font-semibold text-[#4A3728]/50 capitalize mt-0.5 leading-none">
                        {user?.role ?? ""}
                      </p>
                    </div>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#4A3728]/70 hover:text-[#3D5A1E] hover:bg-[#3D5A1E]/5 transition-colors"
                    >
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Configuración
                    </Link>
                  </div>
                  <div className="border-t border-[#E8DDD0] py-1 bg-neutral-50/50">
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
        className="px-6 lg:px-8 flex items-center justify-between bg-[#243714] border-b border-[#F2A900]/10"
        style={{ height: "34px" }}
      >
        <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide">
          <span className="text-[#FDF8F0]/30 uppercase">IMA</span>
          <span className="text-[#FDF8F0]/20">›</span>
          <span className="text-[#FDF8F0]/70 font-semibold uppercase text-[10px] tracking-wider">
            {currentSection}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#5C8A3C] bg-[#5C8A3C]/10 border border-[#5C8A3C]/20 rounded-full px-2.5 py-0.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5C8A3C] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#5C8A3C]"></span>
          </span>
          Sistema activo
        </div>
      </div>
    </>
  );
}

export default Header;