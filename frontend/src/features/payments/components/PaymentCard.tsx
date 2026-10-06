import type { PaymentMethod, PaymentStatus } from "@/features/payments/types/payment.types";
import type { Payment } from "@/features/payments/types/payment.types";
import { motion } from "framer-motion";

interface PaymentCardProps {
  payment: Payment;
  compact?: boolean;
}

const METHOD_THEME: Record<
  PaymentMethod,
  { chip: string; accent: string; soft: string; glow: string }
> = {
  yappy: {
    chip: "bg-emerald-400/10 ring-1 ring-emerald-400/30 shadow-[0_0_16px_-4px_rgba(52,211,153,0.55)]",
    accent: "text-emerald-300",
    soft: "bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/25",
    glow: "bg-gradient-to-br from-emerald-500/25 to-emerald-400/5",
  },
  card: {
    chip: "bg-sky-400/10 ring-1 ring-sky-400/30 shadow-[0_0_16px_-4px_rgba(56,189,248,0.55)]",
    accent: "text-sky-300",
    soft: "bg-sky-400/10 text-sky-300 ring-1 ring-inset ring-sky-400/25",
    glow: "bg-gradient-to-br from-sky-500/25 to-sky-400/5",
  },
  cash: {
    chip: "bg-amber-400/10 ring-1 ring-amber-400/30 shadow-[0_0_16px_-4px_rgba(251,191,36,0.5)]",
    accent: "text-amber-300",
    soft: "bg-amber-400/10 text-amber-300 ring-1 ring-inset ring-amber-400/25",
    glow: "bg-gradient-to-br from-amber-400/25 to-amber-400/5",
  },
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

function getMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case "yappy":
      return "Yappy";
    case "card":
      return "Tarjeta";
    case "cash":
      return "Efectivo";
    default:
      return method;
  }
}

function getMethodIcon(method: PaymentMethod): string {
  switch (method) {
    case "yappy":
      return "📱";
    case "card":
      return "💳";
    case "cash":
      return "💵";
    default:
      return "💵";
  }
}

function getStatusBadgeClass(status: PaymentStatus): string {
  switch (status) {
    case "completed":
      return "bg-emerald-400/10 text-emerald-300 border border-emerald-400/40 shadow-[0_0_14px_-4px_rgba(52,211,153,0.6)]";
    case "pending":
      return "bg-[var(--itas-gold)]/10 text-[var(--itas-gold)] border border-[var(--itas-gold)]/40 shadow-[0_0_14px_-4px_rgba(var(--itas-gold-rgb),0.55)]";
    case "processing":
      return "bg-sky-400/10 text-sky-300 border border-sky-400/40 shadow-[0_0_14px_-4px_rgba(56,189,248,0.55)]";
    case "failed":
      return "bg-red-400/10 text-red-300 border border-red-400/40 shadow-[0_0_14px_-4px_rgba(248,113,113,0.55)]";
    case "refunded":
      return "bg-purple-400/10 text-purple-300 border border-purple-400/40 shadow-[0_0_14px_-4px_rgba(192,132,252,0.55)]";
    default:
      return "bg-zinc-400/10 text-zinc-300 border border-zinc-400/40";
  }
}

function getStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case "completed":
      return "Completado";
    case "pending":
      return "Pendiente";
    case "processing":
      return "Procesando";
    case "failed":
      return "Fallido";
    case "refunded":
      return "Reembolsado";
    default:
      return status;
  }
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-PA", { day: "2-digit", month: "short", year: "numeric" });
}

function CompactPaymentCard({ payment }: PaymentCardProps) {
  const theme = METHOD_THEME[payment.method] ?? METHOD_THEME.cash;
  const isActive = payment.status === "pending" || payment.status === "processing";

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -3 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-[#142b45] p-4 shadow-card transition-all duration-300 hover:border-[var(--itas-gold)]/50 dark:hover:border-white/20 hover:shadow-card-hover"
    >
      <div
        className={`pointer-events-none absolute -top-20 -right-12 h-40 w-40 rounded-full opacity-50 blur-2xl transition-opacity duration-300 group-hover:opacity-80 ${theme.glow}`}
      />

      <div
        className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg transition-transform duration-300 group-hover:scale-110 ${theme.chip}`}
      >
        {getMethodIcon(payment.method)}
      </div>

      <div className="relative min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-base font-black tracking-tight text-slate-900 dark:text-white">{formatPrice(payment.amount)}</p>
          <span
            className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${getStatusBadgeClass(payment.status)}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full bg-current ${isActive ? "animate-pulse-soft" : ""}`} />
            {getStatusLabel(payment.status)}
          </span>
        </div>

        <p className="mt-1 truncate text-[13px] font-semibold text-slate-700 dark:text-white">
          {payment.customer_name || "Cliente"}
          {payment.order_number && (
            <span className="ml-1.5 font-medium text-slate-400 dark:text-white/40">· Orden {payment.order_number}</span>
          )}
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold ${theme.soft}`}>
            {getMethodLabel(payment.method)}
          </span>
          {payment.phone_number && payment.method === "yappy" && (
            <span className={`font-bold ${theme.accent}`}>{payment.phone_number}</span>
          )}
          {payment.card_last4 && payment.method === "card" && (
            <span className={`font-mono font-bold ${theme.accent}`}>•••• {payment.card_last4}</span>
          )}
          {payment.reference_code && !payment.phone_number && !payment.card_last4 && (
            <span className={`font-bold ${theme.accent}`}>Ref: {payment.reference_code}</span>
          )}
        </div>

        <p className="mt-1 text-[11px] font-medium text-slate-400 dark:text-white/35">{formatDate(payment.created_at)}</p>
      </div>
    </motion.div>
  );
}

function DetailedPaymentCard({ payment }: PaymentCardProps) {
  const theme = METHOD_THEME[payment.method] ?? METHOD_THEME.cash;
  const isActive = payment.status === "pending" || payment.status === "processing";
  const barClass =
    payment.method === "yappy"
      ? "gradient-ima"
      : payment.method === "cash"
        ? "gradient-gold"
        : "bg-gradient-to-r from-sky-400/70 via-sky-400/30 to-sky-400/5";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="overflow-hidden rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-[#142b45] shadow-panel"
    >
      <div className={`h-0.5 w-full ${barClass}`} />

      <div className="relative overflow-hidden px-5 py-5 sm:px-6 sm:pt-6">
        <div className={`pointer-events-none absolute inset-0 opacity-30 ${theme.glow}`} />
        <div className="pointer-events-none absolute top-6 -right-8 h-28 w-28 animate-float rounded-full bg-slate-100 dark:bg-white/[0.04] blur-2xl" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${theme.chip}`}
            >
              {getMethodIcon(payment.method)}
            </div>
            <div className="min-w-0">
              <h3 className="animate-shimmer text-2xl font-black tracking-tight text-gradient-gold">
                {formatPrice(payment.amount)}
              </h3>
              <p className={`mt-0.5 text-sm font-bold ${theme.accent}`}>{getMethodLabel(payment.method)}</p>
            </div>
          </div>
          <span
            className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${getStatusBadgeClass(payment.status)}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full bg-current ${isActive ? "animate-pulse-soft" : ""}`} />
            {getStatusLabel(payment.status)}
          </span>
        </div>

        <div className="relative mt-5 flex items-center justify-between gap-4 border-t border-slate-200/70 dark:border-white/10 pt-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-700 dark:text-white">
              {payment.customer_name || "Cliente"}
              {payment.order_number && (
                <span className="ml-1.5 font-medium text-slate-400 dark:text-white/40">· Orden {payment.order_number}</span>
              )}
            </p>
            <p className="mt-0.5 text-xs font-medium text-slate-400 dark:text-white/35">{formatDate(payment.created_at)}</p>
          </div>
          {(payment.phone_number && payment.method === "yappy") || (payment.card_last4 && payment.method === "card") ? (
            <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${theme.soft}`}>
              {payment.method === "yappy" ? `📱 ${payment.phone_number}` : `💳 •••• ${payment.card_last4}`}
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-3 border-t border-slate-200/70 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-5 py-5 sm:px-6">
        {payment.reference_code && (
          <div className="flex items-start justify-between gap-4">
            <span className="w-28 shrink-0 pt-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-white/40">
              Referencia
            </span>
            <span className="max-w-[65%] break-all text-right rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 font-mono text-xs font-bold text-amber-500 dark:text-amber-300 shadow-[0_0_14px_-4px_rgba(251,191,36,0.45)]">
              {payment.reference_code}
            </span>
          </div>
        )}

        {payment.transaction_id && (
          <div className="flex items-start justify-between gap-4">
            <span className="w-28 shrink-0 pt-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-white/40">
              Transacción
            </span>
            <span className="max-w-[65%] break-all text-right rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 py-1 font-mono text-xs font-bold text-slate-800 dark:text-white/90">
              {payment.transaction_id}
            </span>
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <span className="w-28 shrink-0 pt-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-white/40">
            Orden ID
          </span>
          <span className="max-w-[65%] break-all text-right rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 py-1 font-mono text-xs font-bold text-slate-800 dark:text-white/90">
            {payment.order_id}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <span className="w-28 shrink-0 pt-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-white/40">
            Pago ID
          </span>
          <span className="max-w-[65%] break-all text-right rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 py-1 font-mono text-xs font-bold text-slate-800 dark:text-white/90">
            {payment.id}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function PaymentCard({ payment, compact = false }: PaymentCardProps) {
  if (compact) {
    return <CompactPaymentCard payment={payment} />;
  }

  return <DetailedPaymentCard payment={payment} />;
}

export default PaymentCard;