import type { PaymentMethod, PaymentStatus } from "@/features/payments/types/payment.types";
import type { Payment } from "@/features/payments/types/payment.types";
import { motion } from "framer-motion";

// ─── PROPS ─────────────────────────────────────────────────

interface PaymentCardProps {
  payment: Payment;
  compact?: boolean;
}

// ─── UTILITARIOS ───────────────────────────────────────────

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
      return "bg-[#1B4314] text-[#4ADE80] border border-[#22C55E]";
    case "pending":
      return "bg-[#45300B] text-[#FBBF24] border border-[#D97706]";
    case "processing":
      return "bg-[#1E293B] text-[#60A5FA] border border-[#3B82F6]";
    case "failed":
      return "bg-[#450A0A] text-[#F87171] border border-[#EF4444]";
    case "refunded":
      return "bg-[#3B0764] text-[#C084FC] border border-[#A855F7]";
    default:
      return "bg-[#27272A] text-[#A1A1AA] border border-[#71717A]";
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

// ─── VERSIÓN COMPACTA ──────────────────────────────────────

function CompactPaymentCard({ payment }: PaymentCardProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex items-center gap-4 p-4 bg-[#2D1A10] border-2 border-[#3A5F26] rounded-xl shadow-lg hover:border-[#FBBF24] transition-colors cursor-pointer"
    >
      <div className="flex-shrink-0 h-11 w-11 rounded-full bg-[#1E120C] border-2 border-[#3A5F26] flex items-center justify-center text-xl shadow-inner">
        {getMethodIcon(payment.method)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-extrabold text-white">{formatPrice(payment.amount)}</p>
          <span className={`inline-flex rounded-lg px-2.5 py-0.5 text-xs font-bold ${getStatusBadgeClass(payment.status)}`}>
            {getStatusLabel(payment.status)}
          </span>
        </div>
        <p className="text-xs text-white font-medium mt-1">
          {getMethodLabel(payment.method)}
          {payment.reference_code && (
            <span className="text-[#FBBF24] font-bold"> — Ref: {payment.reference_code}</span>
          )}
        </p>
      </div>
    </motion.div>
  );
}

// ─── VERSIÓN DETALLADA ─────────────────────────────────────

function DetailedPaymentCard({ payment }: PaymentCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[#2D1A10] rounded-2xl border-2 border-[#3A5F26] overflow-hidden shadow-2xl"
    >
      {/* Cabecera de la Tarjeta */}
      <div className="px-6 pt-6 pb-5 flex items-center justify-between gap-4 bg-gradient-to-b from-[#352014] to-[#2D1A10]">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-[#1E120C] border-2 border-[#FBBF24] flex items-center justify-center text-3xl shadow-md">
            {getMethodIcon(payment.method)}
          </div>
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">{formatPrice(payment.amount)}</h3>
            <p className="text-sm text-[#FBBF24] font-bold">{getMethodLabel(payment.method)}</p>
          </div>
        </div>
        <span className={`inline-flex rounded-lg px-3 py-1 text-xs font-black uppercase tracking-wider ${getStatusBadgeClass(payment.status)}`}>
          {getStatusLabel(payment.status)}
        </span>
      </div>

      {/* Cuerpo de la Tarjeta */}
      <div className="px-6 py-5 bg-[#1E120C]/80 border-t-2 border-[#3A5F26] space-y-4">
        {payment.reference_code && (
          <div className="flex items-center justify-between gap-4 pb-2 border-b border-[#3A5F26]/30">
            <span className="text-sm font-bold text-white">Referencia</span>
            <span className="text-sm font-extrabold text-[#FBBF24]">{payment.reference_code}</span>
          </div>
        )}

        {payment.transaction_id && (
          <div className="flex items-center justify-between gap-4 pb-2 border-b border-[#3A5F26]/30">
            <span className="text-sm font-bold text-white">Transacción</span>
            <span className="text-xs font-mono font-bold bg-black/50 border border-[#3A5F26] px-2.5 py-1 rounded-md text-[#FBBF24] break-all max-w-[65%] text-right shadow-inner">
              {payment.transaction_id}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 pb-2 border-b border-[#3A5F26]/30">
          <span className="text-sm font-bold text-white">Orden ID</span>
          <span className="text-xs font-mono font-bold bg-black/50 border border-[#3A5F26] px-2.5 py-1 rounded-md text-white break-all max-w-[65%] text-right shadow-inner">
            {payment.order_id}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-bold text-white">Pago ID</span>
          <span className="text-xs font-mono font-bold bg-black/50 border border-[#3A5F26] px-2.5 py-1 rounded-md text-white break-all max-w-[65%] text-right shadow-inner">
            {payment.id}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────

export function PaymentCard({ payment, compact = false }: PaymentCardProps) {
  if (compact) {
    return <CompactPaymentCard payment={payment} />;
  }

  return <DetailedPaymentCard payment={payment} />;
}

export default PaymentCard;