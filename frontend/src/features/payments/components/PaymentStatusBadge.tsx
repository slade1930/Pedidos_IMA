import type { PaymentStatus } from "@/features/payments/types/payment.types";

// ─── PROPS ─────────────────────────────────────────────────

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  size?: "sm" | "md";
}

// ─── CONFIGURACIÓN ─────────────────────────────────────────

const STATUS_CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
  completed: {
    label: "Completado",
    className: "bg-[#1B4314] text-[#4ADE80] border-2 border-[#22C55E]",
  },
  pending: {
    label: "Pendiente",
    className: "bg-[#45300B] text-[#FBBF24] border-2 border-[#FBBF24]",
  },
  processing: {
    label: "Procesando",
    className: "bg-[#1E293B] text-[#60A5FA] border-2 border-[#3B82F6]",
  },
  failed: {
    label: "Fallido",
    className: "bg-[#450A0A] text-[#F87171] border-2 border-[#EF4444]",
  },
  refunded: {
    label: "Reembolsado",
    className: "bg-[#3B0764] text-[#C084FC] border-2 border-[#A855F7]",
  },
};

const SIZE_STYLES = {
  sm: "px-2.5 py-0.5 text-[10px] tracking-wider uppercase",
  md: "px-3.5 py-1 text-xs tracking-wider uppercase sm:px-4 sm:py-1 sm:text-xs",
} as const;

// ─── COMPONENTE ────────────────────────────────────────────

export function PaymentStatusBadge({ status, size = "md" }: PaymentStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  if (!config) return null;

  return (
    <span className={`inline-flex rounded-xl font-black shadow-md align-middle items-center justify-center border-box ${SIZE_STYLES[size]} ${config.className}`}>
      {config.label}
    </span>
  );
}

export default PaymentStatusBadge;