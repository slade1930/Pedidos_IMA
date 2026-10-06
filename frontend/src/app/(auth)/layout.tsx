// app/(auth)/layout.tsx
import type { ReactNode } from "react";

/**
 * AuthLayout — Marco de autenticación ITAS
 *
 * El panel animado (AuthSwitch) se encarga del fondo y la estructura visual.
 * Este layout solo envuelve el contenido y respeta prefers-reduced-motion.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
}