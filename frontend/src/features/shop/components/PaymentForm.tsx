"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart.store";
import { useCheckout } from "@/features/shop/hooks/useCheckout";
import { PaymentMethodSelector } from "@/features/payments/components/PaymentMethodSelector";
import { YappyPayment } from "@/features/shop/components/YappyPayment";
import { CardPayment } from "@/features/shop/components/CardPayment";
import { PaymentSuccess } from "@/features/shop/components/PaymentSuccess";
import type { PaymentMethod } from "@/features/payments/types/payment.types";
import type { PdaRestriction } from "@/features/orders/types/order.types";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  Calendar, 
  Store, 
  AlertTriangle, 
  ShieldCheck, 
  AlertCircle, 
  ShoppingBag, 
  ArrowLeft, 
  Check, 
  Lock, 
  Coins 
} from "lucide-react";

// ─── PASOS ─────────────────────────────────────────────────

type Step = "method" | "pay" | "success";

// ─── UTILITARIOS ───────────────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("es-PA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── COMPONENTE ────────────────────────────────────────────

export function PaymentForm() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const checkout = useCheckout();

  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<PaymentMethod>("yappy");
  const [serverError, setServerError] = useState<string | null>(null);
  const [pdaError, setPdaError] = useState<PdaRestriction | null>(null);
  const [successMessage, setSuccessMessage] = useState("¡Pago Exitoso!");
  const [successSubmessage, setSuccessSubmessage] = useState("");

  // Detectar error PDA cuando la mutación falle
  useEffect(() => {
    if (checkout.isError && checkout.checkoutError) {
      if (checkout.checkoutError.isPdaRestriction && checkout.checkoutError.pda) {
        setPdaError(checkout.checkoutError.pda);
        setStep("method");
      } else {
        setServerError(checkout.checkoutError.message || "Error al crear la orden");
        setStep("pay");
      }
    }
  }, [checkout.isError, checkout.checkoutError]);

  // Redirigir cuando la orden se cree exitosamente
  useEffect(() => {
    if (checkout.isSuccess && checkout.data) {
      const order = checkout.data;
      setSuccessMessage("¡Pedido Creado!");
      setSuccessSubmessage(`Orden #${order.order_number}. Serás redirigido...`);
      setTimeout(() => {
        router.push(`/shop/orders/${order.id}?new=true`);
      }, 2000);
    }
  }, [checkout.isSuccess, checkout.data, router]);

  const handleMethodSelect = (selectedMethod: PaymentMethod) => {
    setMethod(selectedMethod);
    setServerError(null);
    setPdaError(null);
    setStep("pay");
  };

  const handlePaymentSuccess = () => {
    setSuccessMessage("¡Pago Exitoso!");
    setSuccessSubmessage("Creando tu pedido...");
    setStep("success");
    checkout.reset(); // Resetear error anterior

    setTimeout(() => {
      checkout.mutate({ payment_method: method, notes: undefined });
    }, 2500);
  };

  const handleBack = () => {
    setStep("method");
    setServerError(null);
    setPdaError(null);
  };

  // ─── RENDER ─────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative min-h-screen overflow-hidden text-[#1E3A1E]">
      {/* Estilos CSS Locales para Diseño Premium */}
      <style>{`
        .premium-glow {
          box-shadow: 0 25px 50px -12px rgba(58, 95, 38, 0.15);
        }
        .pda-glow {
          box-shadow: 0 15px 30px -10px rgba(245, 158, 11, 0.25);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(58, 95, 38, 0.08);
        }
        .dark-glass-receipt {
          background: linear-gradient(145deg, #1A331A, #0E1D0E);
          border: 1px solid rgba(251, 191, 36, 0.15);
        }
        .grain-bg {
          background-image: radial-gradient(rgba(58, 95, 38, 0.035) 1px, transparent 0);
          background-size: 20px 20px;
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.05); }
        }
        .animate-float {
          animation: float-slow 6s ease-in-out infinite;
        }
        .receipt-dotted-bottom {
          background-image: radial-gradient(circle, transparent 30%, #1A331A 30%);
          background-size: 12px 12px;
          background-position: bottom;
          height: 6px;
        }
      `}</style>

      {/* Círculos de Luces de Fondo Animadas (Ambient Decor) */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#3A5F26]/5 rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FBBF24]/5 rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMNA CENTRAL/IZQUIERDA: RESUMEN DE COMPRA & ERRORES (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Error genérico */}
          <AnimatePresence>
            {serverError && (
              <motion.div 
                initial={{ opacity: 0, y: -15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="rounded-2xl bg-red-50 border-2 border-red-200 p-4 shadow-md flex items-start gap-3"
              >
                <div className="p-1 rounded-lg bg-red-100 text-red-700 flex-shrink-0">
                  <AlertCircle size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-red-800">Transacción Fallida</h4>
                  <p className="text-sm font-semibold text-red-700 mt-1 leading-snug">{serverError}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error PDA (Restricciones del IMA) */}
          <AnimatePresence>
            {pdaError && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="pda-glow rounded-3xl border-2 border-[#FBBF24] bg-gradient-to-br from-amber-50 to-amber-100/60 p-6 space-y-4 relative overflow-hidden"
              >
                {/* Patrón de fondo */}
                <div className="absolute inset-0 opacity-[0.03] bg-repeat pointer-events-none grain-bg" />

                <div className="flex items-start gap-3 relative z-10">
                  <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-700 border border-amber-300">
                    <AlertTriangle size={20} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-amber-950 leading-tight">Control de Beneficios</h4>
                    <p className="text-[10px] text-amber-600 font-extrabold uppercase tracking-widest mt-0.5">IMA Panamá</p>
                  </div>
                </div>

                <p className="text-xs text-amber-900 font-semibold leading-relaxed relative z-10">
                  {pdaError.message}
                </p>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 space-y-2.5 shadow-inner border border-amber-200/50 relative z-10">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-gray-500 flex items-center gap-1.5"><Calendar size={13} className="text-amber-600" /> Última compra</span>
                    <span className="text-gray-900 font-extrabold">{formatDate(pdaError.last_purchase_date)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-gray-500 flex items-center gap-1.5"><Store size={13} className="text-amber-600" /> Feria Libre</span>
                    <span className="text-gray-900 font-extrabold truncate max-w-[140px]">{pdaError.last_fair_name}</span>
                  </div>
                  <div className="border-t border-amber-200/50 pt-2 flex justify-between items-center text-xs font-bold">
                    <span className="text-gray-500">⏳ Días restantes</span>
                    <span className="text-amber-800 font-black text-base bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300">
                      {pdaError.days_remaining} {pdaError.days_remaining === 1 ? "día" : "días"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold pt-1">
                    <span className="text-gray-500 flex items-center gap-1.5"><ShieldCheck size={13} className="text-green-600" /> Fecha de liberación</span>
                    <span className="text-green-700 font-black bg-green-50 px-2 py-0.5 rounded-lg border border-green-200">{formatDate(pdaError.next_available_date)}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resumen del Pedido (Diseño Ticket Digital) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ scale: 1.01, rotateY: 1 }}
            className="dark-glass-receipt rounded-3xl p-6 shadow-2xl relative overflow-hidden text-white group"
          >
            {/* Elemento de seguridad flotante */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-[#FBBF24]" />
                <h2 className="text-xs font-black uppercase tracking-wider text-white">Detalle de Productos</h2>
              </div>
              <span className="text-[10px] font-bold bg-[#3A5F26] text-[#FBBF24] border border-[#FBBF24]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Lock size={10} /> Conexión Segura
              </span>
            </div>

            {/* Listado de items */}
            <div className="space-y-4 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/15">
              {items.map((item, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  key={item.cartItemId} 
                  className="flex justify-between items-center text-xs font-bold group-hover:bg-white/2 p-1.5 rounded-lg transition-colors"
                >
                  <span className="text-white/80 max-w-[200px] truncate">
                    {item.product_name} <span className="text-[#FBBF24] font-medium font-mono">× {item.quantity}</span>
                  </span>
                  <span className="text-white font-extrabold font-mono">{formatPrice(item.unit_price * item.quantity)}</span>
                </motion.div>
              ))}
            </div>

            {/* Total e Impuestos */}
            <div className="pt-4 mt-4 border-t border-dashed border-white/15 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-white/50">
                <span>Subtotal Neto</span>
                <span className="font-mono">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-white/50">
                <span>Cargos e Impuestos</span>
                <span className="font-mono">$0.00</span>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-white/10 font-bold">
                <span className="text-xs text-[#FBBF24] uppercase tracking-widest flex items-center gap-1"><Coins size={12} /> Total a Pagar</span>
                <span className="text-2xl font-black font-mono tracking-tight text-white">{formatPrice(subtotal)}</span>
              </div>
            </div>

            {/* Borde Deteccion Ticket */}
            <div className="absolute bottom-0 left-0 right-0 receipt-dotted-bottom opacity-20" />
          </motion.div>
          
        </div>

        {/* COLUMNA DERECHA: FLUJO INTERACTIVO DE PASOS (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Stepper Progress Bar */}
          <div className="glass-card rounded-2xl p-4 shadow-sm relative overflow-hidden flex items-center justify-between">
            <div className="absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
            <motion.div 
              className="absolute top-1/2 left-[10%] h-0.5 bg-gradient-to-r from-[#3A5F26] to-[#FBBF24] -translate-y-1/2 z-0 origin-left"
              initial={{ width: "0%" }}
              animate={{ 
                width: step === "method" ? "0%" : step === "pay" ? "50%" : "100%" 
              }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />

            {/* Paso 1: Metodo */}
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 border-2 ${
                step === "method" 
                  ? "bg-[#3A5F26] text-white border-[#3A5F26] scale-110 shadow-lg shadow-[#3A5F26]/20" 
                  : (step === "pay" || step === "success") 
                    ? "bg-[#FBBF24] text-[#1E3A1E] border-[#FBBF24]" 
                    : "bg-white text-gray-400 border-gray-200"
              }`}>
                {step === "pay" || step === "success" ? <Check size={14} strokeWidth={3} /> : "1"}
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Método</span>
            </div>

            {/* Paso 2: Pago */}
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 border-2 ${
                step === "pay" 
                  ? "bg-[#3A5F26] text-white border-[#3A5F26] scale-110 shadow-lg shadow-[#3A5F26]/20" 
                  : step === "success" 
                    ? "bg-[#FBBF24] text-[#1E3A1E] border-[#FBBF24]" 
                    : "bg-white text-gray-400 border-gray-200"
              }`}>
                {step === "success" ? <Check size={14} strokeWidth={3} /> : "2"}
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Formulario</span>
            </div>

            {/* Paso 3: Exito */}
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 border-2 ${
                step === "success" 
                  ? "bg-[#3A5F26] text-[#FBBF24] border-[#FBBF24] scale-110 shadow-lg shadow-[#FBBF24]/30" 
                  : "bg-white text-gray-400 border-gray-200"
              }`}>
                3
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Verificación</span>
            </div>
          </div>

          {/* Animación del Contenedor del Checkout Principal */}
          <div className="premium-glow glass-card rounded-3xl p-6 sm:p-8 min-h-[380px] relative overflow-hidden">
            
            {/* Header del Formulario */}
            <div className="flex items-center gap-2 border-b border-[#3A5F26]/10 pb-4 mb-6">
              {step !== "method" && (
                <motion.button 
                  whileHover={{ scale: 1.1, x: -3 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleBack}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 mr-1"
                >
                  <ArrowLeft size={16} strokeWidth={2.5} />
                </motion.button>
              )}
              <h3 className="text-sm font-black uppercase tracking-widest">
                {step === "method" ? "Seleccione su método de pago" : "Procesar transacción segura"}
              </h3>
            </div>

            <AnimatePresence mode="wait">
              
              {/* Paso 1: Seleccionar método */}
              {step === "method" && (
                <motion.div 
                  key="step-method"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <PaymentMethodSelector
                    value={method}
                    onChange={handleMethodSelect}
                  />
                </motion.div>
              )}

              {/* Paso 2: YappyPayment */}
              {step === "pay" && method === "yappy" && (
                <motion.div 
                  key="step-pay-yappy"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <YappyPayment
                    amount={subtotal}
                    onSuccess={handlePaymentSuccess}
                    onBack={handleBack}
                  />
                </motion.div>
              )}

              {/* Paso 2: CardPayment */}
              {step === "pay" && method === "card" && (
                <motion.div 
                  key="step-pay-card"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardPayment
                    amount={subtotal}
                    onSuccess={handlePaymentSuccess}
                    onBack={handleBack}
                  />
                </motion.div>
              )}

              {/* Paso 3: Éxito */}
              {step === "success" && (
                <motion.div 
                  key="step-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <PaymentSuccess
                    message={successMessage}
                    submessage={successSubmessage}
                  />
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}

export default PaymentForm;