"use client";

import type { UserRole } from "@/features/auth/types/auth.types";

// ─── TIPOS ─────────────────────────────────────────────────

type BadgeVariant = "role" | "status";

interface UserBadgeProps {
  variant: BadgeVariant;
  role?: UserRole;
  isActive?: boolean;
  size?: "sm" | "md";
}

// ─── ESTILOS ───────────────────────────────────────────────

const ROLE_STYLES: Record<UserRole, string> = {
  admin: "bg-gradient-to-r from-purple-500/10 to-purple-600/15 border-purple-500/25 text-purple-700 shadow-sm",
  staff: "bg-gradient-to-r from-blue-500/10 to-blue-600/15 border-blue-500/25 text-blue-700 shadow-sm",
  client: "bg-gradient-to-r from-[#4A3728]/5 to-[#4A3728]/12 border-[#4A3728]/20 text-[#4A3728] shadow-sm",
};

const SIZE_STYLES = {
  sm: "px-2 py-0.5 text-[9px] font-extrabold tracking-wider",
  md: "px-2.5 py-0.5 text-[9px] sm:px-3 sm:py-1 sm:text-[10px] font-extrabold tracking-widest",
} as const;

// ─── COMPONENTE ────────────────────────────────────────────

export function UserBadge({ variant, role, isActive, size = "md" }: UserBadgeProps) {
  if (variant === "role" && role) {
    return (
      <span className={`inline-flex rounded-full border uppercase leading-none capitalize ${SIZE_STYLES[size]} ${ROLE_STYLES[role]}`}>
        {role}
      </span>
    );
  }

  if (variant === "status") {
    const isUserActive = isActive ?? false;
    const dotSize = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";

    return (
      <span 
        className={`inline-flex items-center gap-1.5 leading-none uppercase ${SIZE_STYLES[size]} ${
          isUserActive ? "text-[#3D5A1E]" : "text-[#C94B32]"
        }`}
      >
        {isUserActive ? (
          <span className={`relative flex ${dotSize}`}>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5C8A3C] opacity-75"></span>
            <span className={`relative inline-flex rounded-full ${dotSize} bg-[#3D5A1E] shadow-[0_0_6px_#3D5A1E]`}></span>
          </span>
        ) : (
          <span className={`relative flex ${dotSize}`}>
            <span className={`relative inline-flex rounded-full ${dotSize} bg-[#C94B32] shadow-[0_0_6px_#C94B32]`}></span>
          </span>
        )}
        
        {isUserActive ? "Activo" : "Inactivo"}
      </span>
    );
  }

  return null;
}

export default UserBadge;