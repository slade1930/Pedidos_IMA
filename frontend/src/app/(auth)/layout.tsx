// app/(auth)/layout.tsx
"use client";

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// ─── METADATA (exportada desde server component wrapper) ──────────────────────
// Nota: metadata no se puede exportar desde client components.
// Crear un metadata.ts separado o usar generateMetadata en page.tsx si se necesita.

// ─── CONSTANTES DE DISEÑO ─────────────────────────────────────────────────────
const IMA_STATS = [
  { value: "240+", label: "Ferias activas" },
  { value: "18K",  label: "Productores" },
  { value: "9",    label: "Provincias" },
] as const;

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

/**
 * AuthLayout — Layout de autenticación IMA
 *
 * Split-screen: panel izquierdo con identidad de marca (fijo, sin scroll),
 * panel derecho con el formulario (scrollable en mobile).
 *
 * Solo modifica aspectos visuales. Toda la lógica de auth permanece
 * intacta en features/auth/* y stores/providers.
 *
 * Paleta: Palette B — Deep Olive + Golden Corn + Coffee Brown + Warm White
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  const bgRef = useRef<HTMLDivElement>(null);

  // Animación sutil del gradiente de fondo (GSAP alternativo con CSS animation)
  // Sin dependencias adicionales, usando CSS custom properties
  useEffect(() => {
    const el = bgRef.current;
    if (!el) return;
    // Framer Motion maneja las animaciones de entrada desde los children
    // GSAP se usará en fases posteriores para animaciones más complejas
  }, []);

  return (
    <div
      className="ima-auth-root"
      style={{
        minHeight: "100dvh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        backgroundColor: "#FDF8F0",
      }}
    >
      {/* ── PANEL IZQUIERDO — Identidad IMA ─────────────────────────── */}
      <motion.aside
        ref={bgRef as any}
        className="ima-brand-panel"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: "linear-gradient(155deg, #3D5A1E 0%, #2a3f14 55%, #4A3728 100%)",
          padding: "clamp(2rem, 5vw, 3.5rem)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Círculos decorativos de profundidad */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: "rgba(242,169,0,0.07)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            background: "rgba(92,138,60,0.10)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(253,248,240,0.02)",
            pointerEvents: "none",
          }}
        />

        {/* Logo IMA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
          style={{ position: "relative", zIndex: 1 }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "#F2A900",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: 700,
              color: "#3D5A1E",
              letterSpacing: "-0.02em",
              marginBottom: "12px",
              boxShadow: "0 0 0 1px rgba(242,169,0,0.3)",
            }}
          >
            IMA
          </div>
          <p
            style={{
              color: "#FDF8F0",
              fontSize: "16px",
              fontWeight: 500,
              margin: 0,
            }}
          >
            Sistema IMA
          </p>
          <p
            style={{
              color: "rgba(253,248,240,0.45)",
              fontSize: "10px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginTop: "4px",
            }}
          >
            Instituto de Mercadeo Agropecuario
          </p>
        </motion.div>

        {/* Headline + Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "relative", zIndex: 1 }}
        >
          <p
            style={{
              color: "#FDF8F0",
              fontSize: "clamp(18px, 2.2vw, 26px)",
              fontWeight: 500,
              lineHeight: 1.35,
              marginBottom: "24px",
            }}
          >
            La plataforma que conecta
            <br />
            el{" "}
            <span style={{ color: "#F2A900" }}>campo panameño</span>
            <br />
            con sus mercados.
          </p>

          {/* Stats chips */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            {IMA_STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.45 + i * 0.08,
                  duration: 0.4,
                  ease: "easeOut",
                }}
                style={{
                  background: "rgba(253,248,240,0.07)",
                  border: "0.5px solid rgba(253,248,240,0.13)",
                  borderRadius: "10px",
                  padding: "10px 16px",
                  backdropFilter: "blur(8px)",
                }}
              >
                <p
                  style={{
                    color: "#F2A900",
                    fontSize: "20px",
                    fontWeight: 600,
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    color: "rgba(253,248,240,0.45)",
                    fontSize: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginTop: "4px",
                  }}
                >
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.aside>

      {/* ── PANEL DERECHO — Formulario ────────────────────────────────── */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        style={{
          background: "#FDF8F0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(2rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3.5rem)",
          overflowY: "auto",
        }}
      >
        {/* Línea decorativa superior Golden Corn */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "50%",
            height: "2px",
            background:
              "linear-gradient(90deg, transparent, #F2A900 60%, transparent)",
            opacity: 0.4,
          }}
        />

        <div style={{ width: "100%", maxWidth: "400px" }}>
          {children}
        </div>

        {/* Footer del panel */}
        <p
          style={{
            marginTop: "2rem",
            fontSize: "11px",
            color: "rgba(74,55,40,0.35)",
            textAlign: "center",
          }}
        >
          © {new Date().getFullYear()} IMA · República de Panamá
        </p>
      </motion.main>

      {/* ── RESPONSIVE: Mobile (< 768px) ─────────────────────────────── */}
      <style>{`
        @media (max-width: 767px) {
          .ima-auth-root {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto 1fr;
          }
          .ima-brand-panel {
            padding: 1.5rem !important;
            min-height: 180px;
          }
          .ima-brand-panel > div:first-of-type { display: none !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}