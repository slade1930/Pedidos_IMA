// src/app/(auth)/login/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useAuthStore } from "@/stores/auth.store";
import { LoginForm } from "@/features/auth/components/LoginForm";

// ─── VARIANTES DE ANIMACIÓN ────────────────────────────────────────────────────

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

const loaderVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
};

// ─── LOADER ────────────────────────────────────────────────────────────────────

function SessionLoader() {
  return (
    <motion.div
      key="session-loader"
      variants={loaderVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        padding: "3rem 0",
      }}
      role="status"
      aria-label="Verificando sesión"
    >
      <div style={{ position: "relative", width: "36px", height: "36px" }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2.5px solid rgba(61,90,30,0.12)",
          }}
        />
        <motion.div
          aria-hidden="true"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2.5px solid transparent",
            borderTopColor: "#F2A900",
            borderRightColor: "rgba(242,169,0,0.3)",
          }}
        />
      </div>
      <p
        style={{
          fontSize: "12px",
          color: "rgba(74,55,40,0.45)",
          letterSpacing: "0.04em",
        }}
      >
        Verificando sesión…
      </p>
    </motion.div>
  );
}

// ─── PAGE ──────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  // ── LÓGICA ORIGINAL (sin modificar) ──────────────────────────────────────
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized   = useAuthStore((state) => state.isInitialized);
  const redirectTo      = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isInitialized, isAuthenticated, redirectTo, router]);
  // ─────────────────────────────────────────────────────────────────────────

  if (!isInitialized) {
    return (
      <AnimatePresence mode="wait">
        <SessionLoader />
      </AnimatePresence>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="login-card"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header semántico */}
        <div style={{ marginBottom: "2rem" }}>
          <p
            style={{
              fontSize: "11px",
              color: "#5C8A3C",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 500,
              marginBottom: "6px",
            }}
          >
            Acceso seguro
          </p>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 500,
              color: "#4A3728",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Iniciar sesión
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "rgba(74,55,40,0.5)",
              marginTop: "6px",
            }}
          >
            Bienvenido de vuelta al sistema IMA
          </p>
        </div>

        {/* Card con glassmorphism */}
        <div
          style={{
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "0.5px solid #E8DDD0",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow:
              "0 1px 2px rgba(74,55,40,0.04), 0 4px 16px rgba(61,90,30,0.06)",
          }}
        >
          {/* Shimmer Golden Corn */}
          <div
            aria-hidden="true"
            style={{
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(242,169,0,0.5), transparent)",
              marginBottom: "1.5rem",
              borderRadius: "1px",
            }}
          />

          <LoginForm />
        </div>

        {/* Pie contextual */}
        <p
          style={{
            marginTop: "1.25rem",
            fontSize: "12px",
            color: "rgba(74,55,40,0.4)",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          ¿Problemas para ingresar?{" "}
          <span
            style={{
              color: "#3D5A1E",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Contacta al administrador →
          </span>
        </p>
      </motion.div>
    </AnimatePresence>
  );
}