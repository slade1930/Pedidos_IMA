// src/components/layout/ProtectedLayout.tsx

"use client";

import { useState, useCallback, type ReactNode } from "react";
import { motion } from "framer-motion";
import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";

// ─── PROPS ─────────────────────────────────────────────────

interface ProtectedLayoutProps {
  children: ReactNode;
}

// ─── LOADER ────────────────────────────────────────────────

function LayoutLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#FDF8F0]">
      <div className="flex flex-col items-center gap-4">
        <div style={{ position: "relative", width: "40px", height: "40px" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "3px solid rgba(61,90,30,0.12)",
            }}
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "3px solid transparent",
              borderTopColor: "#F2A900",
              borderRightColor: "rgba(242,169,0,0.3)",
            }}
          />
        </div>
        <p className="text-sm text-[#4A3728]/50 tracking-wide">Cargando IMA System...</p>
      </div>
    </div>
  );
}

// ─── COMPONENTE ────────────────────────────────────────────

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuToggle = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <AuthGuard allowedRoles={["admin", "staff"]} fallback={<LayoutLoader />}>
      <div className="flex flex-col h-screen overflow-hidden bg-[#FDF8F0]">
        {/* Top Navbar */}
        <Header onMenuToggle={handleMenuToggle} />

        {/* Mobile Drawer */}
        <MobileNav isOpen={mobileMenuOpen} onClose={handleMenuClose} />

        {/* Contenido */}
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 overflow-y-auto"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
            {children}
          </div>
        </motion.main>
      </div>
    </AuthGuard>
  );
}

export default ProtectedLayout;