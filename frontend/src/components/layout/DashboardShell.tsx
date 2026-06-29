"use client";

import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardShellProps {
  children: ReactNode;
  header?: ReactNode;
}

export function DashboardShell({ children, header }: DashboardShellProps) {
  return (
    <div
      className="flex flex-col h-[100dvh] overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FDF8F0] to-[#F6EFE5] relative"
    >
      {/* Subtle background glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_top_right,_rgba(242,169,0,0.06),_transparent_45%)]"
        aria-hidden="true"
      />
      <div 
        className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_bottom_left,_rgba(61,90,30,0.05),_transparent_50%)]"
        aria-hidden="true"
      />

      {/* Top Navbar */}
      {header && (
        <header className="sticky top-0 z-40 flex-shrink-0 shadow-sm shadow-[#4A3728]/[0.01]">
          {header}
        </header>
      )}

      {/* Contenido principal */}
      <AnimatePresence mode="wait">
        <motion.main
          key="dashboard-content"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="flex-1 overflow-y-auto relative z-10 scrollbar-thin scroll-smooth"
          style={{
            // Custom scrollbar styling in inline CSS for universal support
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(74, 55, 40, 0.15) transparent",
          }}
        >
          <div className="max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 md:px-8 lg:py-10">
            {children}
          </div>
        </motion.main>
      </AnimatePresence>
    </div>
  );
}

export default DashboardShell;