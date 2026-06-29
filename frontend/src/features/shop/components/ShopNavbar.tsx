"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image"; // 👈 Importar Image
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { NotificationDropdown } from "@/features/shop/components/NotificationDropdown";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { CartDrawer } from "@/features/shop/components/CartDrawer";
import { ShoppingBag, Clock, History, LogOut, LogIn, UserPlus } from "lucide-react";

// ─── COMPONENTE ────────────────────────────────────────────

export function ShopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const cartItemsCount = useCartStore((state) => state.getItemsCount());
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // Configuración de pestañas para ExpandableTabs
  const navigationTabs = [
    { title: "Productos", icon: ShoppingBag, href: "/shop/products" },
    ...(isAuthenticated ? [
      { type: "separator" as const },
      { title: "Mis Pedidos", icon: Clock, href: "/shop/orders" },
      { title: "Historial", icon: History, href: "/shop/history" }
    ] : [])
  ];

  const handleTabChange = (href: string | null) => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b-2 border-[#3A5F26]/12 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* 🔄 LOGO CON IMAGEN */}
          <Link href="/shop" className="flex items-center flex-shrink-0 group">
            <div className="relative h-[100px] w-[250px]">
              <Image
                src="/images/LogoIMA.png"
                alt="IMA System"
                fill
                className="object-contain object-left"
                priority
                sizes="(max-width: 640px) 120px, 140px"
              />
            </div>
          </Link>

          {/* Navegación Minimalista con ExpandableTabs */}
          <nav className="hidden md:flex items-center justify-center flex-1">
            <ExpandableTabs 
              tabs={navigationTabs} 
              activeTabPath={pathname}
              onChange={handleTabChange}
              activeColor="text-white"
            />
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Carrito */}
            {isAuthenticated && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-[#1E3A1E] hover:text-[#3A5F26] hover:bg-[#3A5F26]/10 rounded-xl transition-all duration-200 cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 rounded-lg bg-[#FBBF24] border border-[#1E3A1E]/10 text-[#1E3A1E] text-[10px] flex items-center justify-center font-black shadow-sm animate-pulse">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            )}

            {/* Notificaciones */}
            {isAuthenticated && (
              <div className="relative text-[#1E3A1E]">
                <NotificationDropdown />
              </div>
            )}

            {/* Usuario */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3 border-l border-[#3A5F26]/20 pl-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-[#FBBF24] border border-[#3A5F26]/20 flex items-center justify-center shadow-inner">
                    <span className="text-xs font-black text-[#1E3A1E]">
                      {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-xs font-bold text-[#1E3A1E] truncate max-w-[90px]">
                    {user?.full_name ?? "Usuario"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-[#1E3A1E]/70 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut size={16} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="flex items-center gap-1 text-xs font-bold text-[#1E3A1E]/80 hover:text-[#1E3A1E] hover:bg-[#3A5F26]/10 px-3 py-2 rounded-xl transition-all duration-200"
                >
                  <LogIn size={14} strokeWidth={2.5} />
                  <span>Ingresar</span>
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1 bg-[#1E3A1E] border border-[#FBBF24] hover:bg-[#132613] px-3.5 py-2 text-xs font-black text-white rounded-xl shadow-md transition-all duration-200"
                >
                  <UserPlus size={14} strokeWidth={2.5} />
                  <span>Registro</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer del Carrito */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}

export default ShopNavbar;