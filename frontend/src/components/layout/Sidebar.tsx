"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { JSX } from "react";
import { useAuthStore } from "@/stores/auth.store";
import type { UserRole } from "@/features/auth/types/auth.types";

// ─── TIPOS ─────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
}

// ─── NAVEGACIÓN ────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", roles: ["admin", "staff", "client"] },
  { label: "Usuarios", href: "/dashboard/users", icon: "Users", roles: ["admin"] },
  { label: "Ferias", href: "/dashboard/fairs", icon: "Store", roles: ["admin", "staff", "client"] },
  { label: "Productos", href: "/dashboard/products", icon: "Package", roles: ["admin", "staff", "client"] },
  { label: "Inventario", href: "/dashboard/inventory", icon: "ClipboardList", roles: ["admin", "staff"] },
  { label: "Órdenes", href: "/dashboard/orders", icon: "ShoppingCart", roles: ["admin", "staff", "client"] },
  { label: "Pagos", href: "/dashboard/payments", icon: "CreditCard", roles: ["admin", "client"] },
  { label: "Configuración", href: "/dashboard/settings", icon: "Settings", roles: ["admin", "staff", "client"] },
];

// ─── ICONOS ────────────────────────────────────────────────

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const className = `h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${active ? "text-[#3D5A1E]" : "text-[#4A3728]/50 group-hover:text-[#4A3728]/75"}`;

  const icons: Record<string, JSX.Element> = {
    LayoutDashboard: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    Users: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    Store: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
      </svg>
    ),
    Package: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
    ClipboardList: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
    ShoppingCart: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
    ),
    CreditCard: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    Settings: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  };

  return icons[name] ?? null;
}

// ─── COMPONENTE ────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const userRole: UserRole = user?.role ?? "client";

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside 
      className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-neutral-200/60 lg:bg-white/95 lg:backdrop-blur-md lg:z-30"
      style={{ boxShadow: "1px 0 10px rgba(74, 55, 40, 0.02)" }}
    >
      {/* Header / Brand matching the top header */}
      <div 
        className="flex items-center h-16 px-6 border-b border-neutral-200/60 bg-gradient-to-r from-[#253912] to-[#3D5A1E] text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(242,169,0,0.12),_transparent_60%)]" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-[#F2A900] to-[#C78500] flex items-center justify-center text-[10px] font-black text-[#3D5A1E] shadow-md">
            IMA
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-tight leading-none text-[#FDF8F0]">
              IMA System
            </span>
            <span className="text-[8px] text-[#FDF8F0]/40 tracking-wider uppercase font-bold mt-1">
              Mercadeo
            </span>
          </div>
        </div>
      </div>

      {/* Nav list with premium sliding background pill */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`group relative flex items-center w-full gap-3.5 rounded-lg px-4 py-2.5 text-xs font-bold transition-all duration-300 ${
                isActive 
                  ? "text-[#3D5A1E]" 
                  : "text-[#4A3728]/70 hover:text-[#4A3728] hover:bg-[#E8DDD0]/15"
              }`}
            >
              {/* Sliding Active Pill */}
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-pill"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="absolute inset-0 bg-[#3D5A1E]/8 border-l-[3px] border-[#3D5A1E] rounded-r-lg rounded-l-none -z-10"
                />
              )}
              <NavIcon name={item.icon} active={isActive} />
              <span className="relative z-10 leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User profile footer section */}
      <div className="border-t border-neutral-200/50 bg-[#FDF8F0]/30 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-gradient-to-br from-[#F2A900] to-[#C78500] flex items-center justify-center shadow-sm">
            <span className="text-xs font-black text-[#3D5A1E]">
              {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#4A3728] truncate leading-tight">
              {user?.full_name ?? "Usuario"}
            </p>
            <p className="text-[10px] font-semibold text-[#4A3728]/50 truncate capitalize mt-0.5 leading-none">
              {user?.role ?? ""}
            </p>
          </div>
          <button 
            onClick={handleLogout} 
            title="Cerrar sesión"
            className="flex-shrink-0 p-2 rounded-lg text-[#4A3728]/50 hover:text-[#C94B32] hover:bg-[#C94B32]/5 border border-transparent hover:border-[#C94B32]/10 transition-all"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;