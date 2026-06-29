"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { NotificationDropdown } from "@/features/shop/components/NotificationDropdown";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { CartDrawer } from "@/features/shop/components/CartDrawer";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Clock,
  History,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

// ─── COMPONENTE ────────────────────────────────────────────

export function ShopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const cartItemsCount = useCartStore((state) => state.getItemsCount());
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    await logout();
    router.push("/");
  };

  const navigationTabs = [
    { title: "Productos", icon: ShoppingBag, href: "/shop/products" },
    ...(isAuthenticated
      ? [
          { type: "separator" as const },
          { title: "Mis Pedidos", icon: Clock, href: "/shop/orders" },
          { title: "Historial", icon: History, href: "/shop/history" },
        ]
      : []),
  ];

  const handleTabChange = (href: string | null) => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b-2 border-[#3A5F26]/12 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            
            {/* LADO IZQUIERDO: Hamburguesa + Logo */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Botón hamburguesa (móvil) */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-1.5 sm:p-2 lg:hidden text-[#1E3A1E] hover:text-[#3A5F26] hover:bg-[#3A5F26]/10 rounded-xl transition-all duration-200 cursor-pointer"
                aria-label="Abrir menú"
              >
                <Menu size={20} strokeWidth={2.5} />
              </button>

              {/* Logo */}
              <Link href="/shop" className="flex items-center group flex-shrink-0">
                <div className="relative h-[38px] w-[100px] sm:h-[42px] sm:w-[140px] lg:h-[48px] lg:w-[160px] transition-all">
                  <Image
                    src="/images/LogoIMA.png"
                    alt="IMA System"
                    fill
                    className="object-contain object-left"
                    priority
                    sizes="(max-width: 640px) 100px, (max-width: 1024px) 140px, 160px"
                  />
                </div>
              </Link>
            </div>

            {/* Navegación Desktop */}
            <nav className="hidden lg:flex items-center justify-center flex-1 min-w-0">
              <ExpandableTabs
                tabs={navigationTabs}
                activeTabPath={pathname}
                onChange={handleTabChange}
                activeColor="text-white"
              />
            </nav>

            {/* Acciones (derecha) */}
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              {/* Carrito */}
              {isAuthenticated && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-1.5 sm:p-2 text-[#1E3A1E] hover:text-[#3A5F26] hover:bg-[#3A5F26]/10 rounded-xl transition-all duration-200 cursor-pointer"
                >
                  <svg className="h-4.5 w-4.5 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 sm:h-4.5 sm:w-4.5 rounded-lg bg-[#FBBF24] border border-[#1E3A1E]/10 text-[#1E3A1E] text-[9px] sm:text-[10px] flex items-center justify-center font-black shadow-sm">
                      {cartItemsCount}
                    </span>
                  )}
                </button>
              )}

              {/* Notificaciones (solo desktop) */}
              {isAuthenticated && (
                <div className="hidden sm:relative text-[#1E3A1E]">
                  <NotificationDropdown />
                </div>
              )}

              {/* Usuario desktop */}
              {isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-2 border-l border-[#3A5F26]/20 pl-2 sm:pl-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-[#FBBF24] border border-[#3A5F26]/20 flex items-center justify-center shadow-inner flex-shrink-0">
                      <span className="text-[10px] sm:text-xs font-black text-[#1E3A1E]">
                        {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
                      </span>
                    </div>
                    <span className="hidden lg:inline text-xs font-bold text-[#1E3A1E] truncate max-w-[70px]">
                      {user?.full_name?.split(" ")[0] ?? "Usuario"}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 sm:p-2 text-[#1E3A1E]/70 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 cursor-pointer"
                    title="Cerrar sesión"
                  >
                    <LogOut size={15} strokeWidth={2.5} />
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#1E3A1E]/80 hover:text-[#1E3A1E] hover:bg-[#3A5F26]/10 px-2.5 sm:px-3 py-2 rounded-xl transition-all duration-200"
                  >
                    <LogIn size={13} strokeWidth={2.5} />
                    <span className="hidden sm:inline">Ingresar</span>
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-1 bg-[#1E3A1E] border border-[#FBBF24] hover:bg-[#132613] px-2.5 sm:px-3.5 py-2 text-[11px] sm:text-xs font-black text-white rounded-xl shadow-md transition-all duration-200"
                  >
                    <UserPlus size={13} strokeWidth={2.5} />
                    <span className="hidden sm:inline">Registro</span>
                  </Link>
                </div>
              )}
              
              {/* Botón menú hamburguesa para auth en móvil */}
              {!isAuthenticated && (
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="sm:hidden p-1.5 text-[#1E3A1E] hover:bg-[#3A5F26]/10 rounded-xl transition-all cursor-pointer"
                  aria-label="Menú"
                >
                  <Menu size={20} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── SIDEBAR MÓVIL ────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] bg-white shadow-2xl flex flex-col lg:hidden"
            >
              {/* Header del sidebar */}
              <div className="flex items-center justify-between p-4 border-b border-[#3A5F26]/10">
                <div className="relative h-[32px] w-[90px]">
                  <Image
                    src="/images/LogoIMA.png"
                    alt="IMA"
                    fill
                    className="object-contain object-left"
                    sizes="90px"
                  />
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#1E3A1E] hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* Navegación */}
              <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
                {navigationTabs
                  .filter((tab: any) => tab.type !== "separator")
                  .map((tab: any) => {
                    const Icon = tab.icon;
                    const isActive = pathname === tab.href;
                    return (
                      <Link
                        key={tab.title}
                        href={tab.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                          isActive
                            ? "bg-[#3A5F26] text-white shadow-md"
                            : "text-[#1E3A1E]/80 hover:bg-[#3A5F26]/8 hover:text-[#3A5F26]"
                        }`}
                      >
                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                        <span>{tab.title}</span>
                        {isActive && <ChevronRight size={14} className="ml-auto" />}
                      </Link>
                    );
                  })}

                {/* Separador */}
                <div className="my-3 border-t border-[#3A5F26]/10" />

                {/* Auth móvil */}
                {isAuthenticated ? (
                  <>
                    {/* Info usuario */}
                    <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-[#F4F6F3] rounded-xl">
                      <div className="h-9 w-9 rounded-xl bg-[#FBBF24] border border-[#3A5F26]/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-black text-[#1E3A1E]">
                          {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#1E3A1E] truncate">
                          {user?.full_name ?? "Usuario"}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {user?.email ?? ""}
                        </p>
                      </div>
                    </div>
                    {/* Cerrar sesión */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all w-full text-left cursor-pointer"
                    >
                      <LogOut size={18} strokeWidth={2.5} />
                      <span>Cerrar sesión</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 px-2">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 text-sm font-bold text-[#1E3A1E] hover:bg-[#3A5F26]/10 px-4 py-3 rounded-xl border border-[#3A5F26]/20 transition-all"
                    >
                      <LogIn size={16} strokeWidth={2.5} />
                      <span>Ingresar</span>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 bg-[#1E3A1E] border border-[#FBBF24] hover:bg-[#132613] px-4 py-3 text-sm font-black text-white rounded-xl shadow-md transition-all"
                    >
                      <UserPlus size={16} strokeWidth={2.5} />
                      <span>Registro</span>
                    </Link>
                  </div>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Drawer del Carrito */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

export default ShopNavbar;
