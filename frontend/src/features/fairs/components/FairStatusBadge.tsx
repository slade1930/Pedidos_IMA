"use client";

import type { FairStatus } from "@/features/fairs/types/fair.types";

// ─── PROPS ─────────────────────────────────────────────────

interface FairStatusBadgeProps {
  status: FairStatus;
  size?: "sm" | "md";
}

// ─── CONFIGURACIÓN DE ESTADOS ──────────────────────────────

const STATUS_CONFIG: Record<
  FairStatus,
  { label: string; className: string; dotClass: string }
> = {
  upcoming: {
    label: "Próxima",
    className: "bg-gradient-to-r from-yellow-500/10 to-yellow-600/15 border-yellow-500/25 text-yellow-700 shadow-sm",
    dotClass: "bg-yellow-500 shadow-[0_0_4px_#ecc94b]",
  },
  active: {
    label: "Activa",
    className: "bg-gradient-to-r from-[#3D5A1E]/10 to-[#5C8A3C]/15 border-[#3D5A1E]/20 text-[#3D5A1E] shadow-sm",
    dotClass: "bg-[#3D5A1E] shadow-[0_0_6px_#3D5A1E]",
  },
  paused: {
    label: "Pausada",
    className: "bg-gradient-to-r from-orange-500/10 to-orange-600/15 border-orange-500/25 text-orange-700 shadow-sm",
    dotClass: "bg-orange-500 shadow-[0_0_4px_#dd6b20]",
  },
  finished: {
    label: "Finalizada",
    className: "bg-gradient-to-r from-blue-500/10 to-blue-600/15 border-blue-500/25 text-blue-700 shadow-sm",
    dotClass: "bg-blue-500 shadow-[0_0_4px_#3182ce]",
  },
  cancelled: {
    label: "Cancelada",
    className: "bg-gradient-to-r from-red-500/10 to-red-600/15 border-red-500/25 text-red-700 shadow-sm",
    dotClass: "bg-red-500 shadow-[0_0_6px_#e53e3e]",
  },
};

const SIZE_STYLES = {
  sm: "px-2 py-0.5 text-[9px] font-extrabold tracking-wider",
  md: "px-2.5 py-0.5 text-[9px] sm:px-3 sm:py-1 sm:text-[10px] font-extrabold tracking-widest",
} as const;

// ─── COMPONENTE ────────────────────────────────────────────

export function FairStatusBadge({ status, size = "md" }: FairStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  if (!config) return null;

  const dotSize = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border leading-none uppercase ${SIZE_STYLES[size]} ${config.className}`}>
      {status === "active" ? (
        <span className={`relative flex ${dotSize}`}>
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5C8A3C] opacity-75"></span>
          <span className={`relative inline-flex rounded-full ${dotSize} bg-[#3D5A1E] shadow-[0_0_6px_#3D5A1E]`}></span>
        </span>
      ) : (
        <span className={`rounded-full ${dotSize} ${config.dotClass}`} />
      )}
      {config.label}
    </span>
  );
}

export default FairStatusBadge;