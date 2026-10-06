"use client";

import type { PdaRestriction } from "@/features/orders/types/order.types";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Calendar,
  Store,
  ShieldCheck,
} from "lucide-react";

// ─── UTILITARIOS ───────────────────────────────────────────

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("es-PA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── PROPS ─────────────────────────────────────────────────

interface PdaRestrictionCardProps {
  restriction: PdaRestriction;
  /** Texto de acción: qué debe esperar el usuario */
  hint?: string;
}

// ─── COMPONENTE ────────────────────────────────────────────

export function PdaRestrictionCard({ restriction, hint }: PdaRestrictionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="pda-glow rounded-3xl border-2 border-[#2fd4a7] bg-gradient-to-br from-amber-50 to-amber-100/60 p-6 space-y-4 relative overflow-hidden"
    >
      <style>{`
        .pda-glow {
          box-shadow: 0 15px 30px -10px rgba(245, 158, 11, 0.25);
        }
        .grain-bg {
          background-image: radial-gradient(rgba(58, 95, 38, 0.035) 1px, transparent 0);
          background-size: 20px 20px;
        }
      `}</style>

      {/* Patrón de fondo */}
      <div className="absolute inset-0 opacity-[0.03] bg-repeat pointer-events-none grain-bg" />

      <div className="flex items-start gap-3 relative z-10">
        <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-700 border border-amber-300">
          <AlertTriangle size={20} strokeWidth={2.2} />
        </div>
        <div>
          <h4 className="text-base font-black text-amber-950 leading-tight">Control de Beneficios</h4>
          <p className="text-[10px] text-amber-600 font-extrabold uppercase tracking-widest mt-0.5">ITAS Panamá</p>
        </div>
      </div>

      <p className="text-xs text-amber-900 font-semibold leading-relaxed relative z-10">
        {hint || restriction.message}
      </p>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 space-y-2.5 shadow-inner border border-amber-200/50 relative z-10">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-gray-500 flex items-center gap-1.5"><Calendar size={13} className="text-amber-600" /> Última compra</span>
          <span className="text-gray-900 font-extrabold">{formatDate(restriction.last_purchase_date)}</span>
        </div>
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-gray-500 flex items-center gap-1.5"><Store size={13} className="text-amber-600" /> Feria Libre</span>
          <span className="text-gray-900 font-extrabold truncate max-w-[140px]">{restriction.last_fair_name}</span>
        </div>
        <div className="border-t border-amber-200/50 pt-2 flex justify-between items-center text-xs font-bold">
          <span className="text-gray-500">⏳ Días restantes</span>
          <span className="text-amber-800 font-black text-base bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300">
            {restriction.days_remaining} {restriction.days_remaining === 1 ? "día" : "días"}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs font-bold pt-1">
          <span className="text-gray-500 flex items-center gap-1.5"><ShieldCheck size={13} className="text-green-600" /> Fecha de liberación</span>
          <span className="text-green-700 font-black bg-green-50 px-2 py-0.5 rounded-lg border border-green-200">{formatDate(restriction.next_available_date)}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default PdaRestrictionCard;