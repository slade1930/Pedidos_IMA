// src/app/(auth)/register/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/auth.store";
import AuthSwitch from "@/components/ui/auth-switch";
import {
  TermsAcceptanceModal,
  useTermsAcceptance,
} from "@/components/features/TermsAcceptanceModal";

// ─── LOADER ────────────────────────────────────────────────────────────────────

function SessionLoader() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        background: "#eef6f4",
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
            border: "2.5px solid rgba(20,43,69,0.12)",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2.5px solid transparent",
            borderTopColor: "#2fbf9b",
            borderRightColor: "rgba(47,212,167,0.3)",
            animation: "itas-spin 0.9s linear infinite",
          }}
        />
      </div>
      <p style={{ fontSize: "12px", color: "rgba(20,43,69,0.45)" }}>
        Verificando sesión…
      </p>
    </div>
  );
}

// ─── PAGE ──────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  // ── LÓGICA ORIGINAL (sin modificar) ──────────────────────────────────────
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized   = useAuthStore((state) => state.isInitialized);
  const redirectTo      = searchParams.get("redirect") || "/shop";

  const { accepted, accept, reject } = useTermsAcceptance();
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isInitialized, isAuthenticated, redirectTo, router]);
  // ─────────────────────────────────────────────────────────────────────────

  if (!isInitialized) {
    return <SessionLoader />;
  }

  if (isAuthenticated) return null;

  return (
    <>
      <AnimatePresence>
        {termsModalOpen && (
          <TermsAcceptanceModal
            onAccept={() => {
              accept();
              setTermsModalOpen(false);
            }}
            onReject={reject}
          />
        )}
      </AnimatePresence>

      <AuthSwitch
        initialMode="sign-up"
        termsAccepted={accepted}
        onRequireTerms={() => setTermsModalOpen(true)}
      />
    </>
  );
}