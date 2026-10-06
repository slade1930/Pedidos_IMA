import type { PaymentMethod } from "@/features/payments/types/payment.types";
import { motion } from "framer-motion";

// ─── PROPS ─────────────────────────────────────────────────

interface PaymentMethodSelectorProps {
  value: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
  disabled?: boolean;
  error?: string;
}

// ─── CONFIGURACIÓN ─────────────────────────────────────────

const METHODS: {
  value: PaymentMethod;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    value: "yappy",
    label: "Yappy",
    icon: "📱",
    description: "Pago con Yappy",
  },
  {
    value: "card",
    label: "Tarjeta",
    icon: "💳",
    description: "Tarjeta de crédito o débito",
  },
];

// ─── COMPONENTE ────────────────────────────────────────────

/**
 * PaymentMethodSelector
 * 
 * Selector visual de método de pago para la tienda online.
 * Solo muestra Yappy y Tarjeta (sin efectivo).
 */
export function PaymentMethodSelector({
  value,
  onChange,
  disabled = false,
  error,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      {/* Label Principal */}
      <label className="block text-sm font-bold text-white tracking-wide">
        Método de pago
      </label>

      {/* Grid de Métodos de Pago */}
      <div className="grid grid-cols-2 gap-4">
        {METHODS.map((method) => {
          const isSelected = value === method.value;

          return (
            <motion.button
              key={method.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(method.value)}
              whileHover={!disabled ? { scale: 1.02, y: -1 } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-5 text-center transition-all ${
                isSelected
                  ? "border-[var(--itas-gold)] bg-[var(--itas-gold-light)]/20 shadow-[0_0_20px_rgba(var(--itas-gold-rgb),0.18)]"
                  : "border-slate-200 bg-white hover:border-[var(--itas-green)]/50 hover:bg-slate-50"
              } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {/* Icono del método */}
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl shadow-inner transition-colors ${
                isSelected ? "bg-[var(--itas-gold-light)]/40 border border-[var(--itas-gold)]" : "bg-slate-100 border border-slate-200"
              }`}>
                {method.icon}
              </div>

              {/* Título de la opción */}
              <span className={`text-base font-extrabold tracking-tight transition-colors ${
                isSelected ? "text-[var(--itas-gold)]" : "text-slate-800"
              }`}>
                {method.label}
              </span>

              {/* Descripción de la opción */}
              <span className={`text-xs font-semibold leading-relaxed transition-colors ${
                isSelected ? "text-slate-700" : "text-slate-500"
              }`}>
                {method.description}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Mensaje de Error */}
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 font-bold mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

export default PaymentMethodSelector;