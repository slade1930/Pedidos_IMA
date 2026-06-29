// src/components/layout/MobileNav.tsx
"use client";

import { useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import type { JSX } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import type { UserRole } from "@/features/auth/types/auth.types";

// ─── PROPS ────────────────────────────────────────────────────────────────────

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── VARIANTES ────────────────────────────────────────────────────────────────

const drawerVariants: Variants = {
  hidden: { x: "-100%" },
  visible: {
    x: 0,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
  exit: {
    x: "-100%",
    transition: { duration: 0.24, ease: [0.55, 0, 1, 0.45] as [number, number, number, number] },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.08 + i * 0.045,
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

// ─── ÍCONOS ───────────────────────────────────────────────────────────────────

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? "#F2A900" : "rgba(253,248,240,0.35)";
  const stroke = 1.6;

  const icons: Record<string, JSX.Element> = {
    LayoutDashboard: (
      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={stroke} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    Users: (
      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={stroke} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    Store: (
      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={stroke} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
      </svg>
    ),
    Package: (
      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={stroke} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
    ClipboardList: (
      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={stroke} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
    ShoppingCart: (
      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={stroke} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
    ),
    CreditCard: (
      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={stroke} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    Settings: (
      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={stroke} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  };

  return icons[name] ?? null;
}

// ─── SECCIÓN LABEL ────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <p
      style={{
        fontSize: "9.5px",
        fontWeight: 600,
        color: "rgba(253,248,240,0.22)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding: "12px 10px 5px",
        margin: 0,
      }}
    >
      {label}
    </p>
  );
}

// ─── DIVIDER ──────────────────────────────────────────────────────────────────

function NavDivider() {
  return (
    <div
      style={{
        height: "1px",
        background: "rgba(255,255,255,0.06)",
        margin: "6px 10px",
      }}
    />
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  // ── LÓGICA ORIGINAL (sin modificar) ────────────────────────────────────
  const pathname = usePathname();
  const router   = useRouter();
  const user     = useAuthStore((state) => state.user);
  const logout   = useAuthStore((state) => state.logout);

  const userRole: UserRole = user?.role ?? "client";
  const visibleItems = NAV_ITEMS.filter((item) =>
    (item.roles as readonly UserRole[]).includes(userRole)
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleNavigate = useCallback((href: string) => {
    router.push(href);
    onClose();
  }, [router, onClose]);

  const handleLogout = useCallback(async () => {
    await logout();
    onClose();
    router.push("/login");
  }, [logout, onClose, router]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  // ─────────────────────────────────────────────────────────────────────────

  // Agrupar items por sección para labels
  const groups = [
    { label: "Principal",   keys: ["LayoutDashboard", "Users", "Store"] },
    { label: "Inventario",  keys: ["Package", "ClipboardList", "ShoppingCart"] },
    { label: "Finanzas",    keys: ["CreditCard", "Settings"] },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Overlay ───────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 40,
              background: "rgba(30,46,14,0.65)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          />

          {/* ── Drawer ────────────────────────────────────────────────── */}
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            style={{
              position: "fixed",
              inset: "0 auto 0 0",
              zIndex: 50,
              width: "272px",
              background: "#1e2e0e",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* ── Header del drawer ───────────────────────────────────── */}
            <div
              style={{
                height: "58px",
                padding: "0 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(180deg, #2a3f14 0%, #1e2e0e 100%)",
                borderBottom: "1px solid rgba(242,169,0,0.12)",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <div
                  style={{
                    width: "32px", height: "32px",
                    borderRadius: "8px",
                    background: "#F2A900",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "10px", fontWeight: 700, color: "#3D5A1E",
                    letterSpacing: "-0.02em",
                    boxShadow: "0 0 0 1px rgba(242,169,0,0.3)",
                    flexShrink: 0,
                  }}
                >
                  IMA
                </div>
                <div>
                  <p style={{ fontSize: "12.5px", fontWeight: 600, color: "#FDF8F0", margin: 0, lineHeight: 1.2 }}>
                    IMA System
                  </p>
                  <p style={{ fontSize: "9px", color: "rgba(253,248,240,0.32)", margin: 0, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Mercadeo Agropecuario
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar menú"
                style={{
                  width: "28px", height: "28px",
                  borderRadius: "7px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  color: "rgba(253,248,240,0.4)",
                  flexShrink: 0,
                }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Línea dorada */}
            <div
              aria-hidden="true"
              style={{
                height: "1.5px",
                background: "linear-gradient(90deg, transparent, #F2A900 40%, #F2A900 60%, transparent)",
                opacity: 0.45,
                flexShrink: 0,
              }}
            />

            {/* ── Nav agrupado ────────────────────────────────────────── */}
            <nav
              style={{ flex: 1, overflowY: "auto", padding: "4px 8px 8px" }}
              aria-label="Navegación principal"
            >
              {groups.map((group, gi) => {
                const groupItems = visibleItems.filter((item) =>
                  group.keys.includes(item.icon)
                );
                if (groupItems.length === 0) return null;

                return (
                  <div key={group.label}>
                    {gi > 0 && <NavDivider />}
                    <SectionLabel label={group.label} />
                    {groupItems.map((item, i) => {
                      const active = isActive(item.href);
                      return (
                        <motion.button
                          key={item.href}
                          custom={gi * 3 + i}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          type="button"
                          onClick={() => handleNavigate(item.href)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: "9px",
                            marginBottom: "2px",
                            background: active ? "rgba(242,169,0,0.09)" : "transparent",
                            border: `1px solid ${active ? "rgba(242,169,0,0.18)" : "transparent"}`,
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "background 0.15s, border-color 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                          }}
                          onMouseLeave={(e) => {
                            if (!active) e.currentTarget.style.background = "transparent";
                          }}
                        >
                          {/* Ícono con fondo */}
                          <div
                            style={{
                              width: "32px", height: "32px",
                              borderRadius: "8px",
                              background: active ? "rgba(242,169,0,0.14)" : "rgba(255,255,255,0.05)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0,
                              transition: "background 0.15s",
                            }}
                          >
                            <NavIcon name={item.icon} active={active} />
                          </div>

                          {/* Label */}
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 500,
                              color: active ? "#F2A900" : "rgba(253,248,240,0.5)",
                              flex: 1,
                              transition: "color 0.15s",
                            }}
                          >
                            {item.label}
                          </span>

                          {/* Dot activo */}
                          {active && (
                            <div
                              style={{
                                width: "6px", height: "6px",
                                borderRadius: "50%",
                                background: "#F2A900",
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                );
              })}
            </nav>

            {/* ── Footer — User card ──────────────────────────────────── */}
            <div
              style={{
                padding: "10px 10px 14px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  background: "rgba(242,169,0,0.07)",
                  border: "1px solid rgba(242,169,0,0.15)",
                  borderRadius: "10px",
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: "34px", height: "34px",
                    borderRadius: "9px",
                    background: "#F2A900",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", fontWeight: 700, color: "#3D5A1E",
                    flexShrink: 0,
                  }}
                >
                  {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "12.5px", fontWeight: 600, color: "#FDF8F0", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user?.full_name ?? "Usuario"}
                  </p>
                  <p style={{ fontSize: "10px", color: "rgba(253,248,240,0.38)", margin: "2px 0 0", textTransform: "capitalize" }}>
                    {user?.role ?? ""}
                  </p>
                </div>

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Cerrar sesión"
                  style={{
                    width: "28px", height: "28px",
                    borderRadius: "7px",
                    background: "rgba(201,75,50,0.1)",
                    border: "1px solid rgba(201,75,50,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                    color: "#C94B32",
                    flexShrink: 0,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,75,50,0.18)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(201,75,50,0.1)"; }}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default MobileNav;