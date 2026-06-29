"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  QrCode, 
  Smartphone, 
  Check, 
  ShieldCheck, 
  Coins 
} from "lucide-react";

// ─── PROPS ─────────────────────────────────────────────────

interface YappyPaymentProps {
  amount: number;
  onSuccess: () => void;
  onBack: () => void;
}

// ─── CONSTANTES ────────────────────────────────────────────

const YAPPY_PHONE = "6798-7745";
const YAPPY_NAME = "IMA System";

// ─── UTILITARIOS ───────────────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

// ─── COMPONENTE ────────────────────────────────────────────

export function YappyPayment({ amount, onSuccess, onBack }: YappyPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleConfirm = () => {
    setIsProcessing(true);

    // Simular procesamiento de pago (2 segundos)
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      // Dar tiempo para ver la animación
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 2000);
  };

  // ─── PANTALLA DE ÉXITO ──────────────────────────────
  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl border border-gray-200 p-8 text-center space-y-5 relative overflow-hidden"
      >
        {/* Glow de fondo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-green-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Animación del Checkmark con círculos concéntricos */}
        <div className="relative mx-auto h-24 w-24 flex items-center justify-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.1, 1], opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 rounded-full bg-green-50 border border-green-200"
          />
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-1 rounded-full border-2 border-green-500/30"
          />
          <div className="h-16 w-16 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/35 relative z-10">
            <Check size={32} strokeWidth={3} />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-black text-gray-900 tracking-tight">¡Pago Exitoso!</h3>
          <p className="text-xs text-green-700 font-extrabold uppercase tracking-widest flex items-center justify-center gap-1">
            <ShieldCheck size={14} /> Transacción Validada
          </p>
        </div>

        <p className="text-sm text-gray-500 font-semibold leading-relaxed max-w-sm mx-auto">
          Tu transferencia por un monto de <span className="text-gray-900 font-extrabold font-mono">{formatPrice(amount)}</span> ha sido confirmada correctamente por nuestro sistema de cobros.
        </p>

        {/* Barra de progreso de redirección */}
        <div className="pt-2">
          <div className="w-48 h-1 bg-gray-100 rounded-full mx-auto overflow-hidden relative">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.8, ease: "linear" }}
              className="absolute top-0 left-0 bottom-0 bg-green-500"
            />
          </div>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1.5">Redirigiendo...</span>
        </div>
      </motion.div>
    );
  }

  // ─── PANTALLA DE PAGO ───────────────────────────────
  return (
    <div className="space-y-6">
      {/* Estilos CSS Locales para Yappy */}
      <style>{`
        .yappy-gradient {
          background: linear-gradient(135deg, #0057FF, #7F00FF);
        }
        .yappy-glass-pill {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .instruction-number {
          background: rgba(127, 0, 255, 0.08);
          border: 1px solid rgba(127, 0, 255, 0.15);
          color: #7F00FF;
        }
        @keyframes scan {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 100%; opacity: 0.8; }
          100% { top: 0%; opacity: 0.8; }
        }
        .scan-line {
          animation: scan 3s linear infinite;
        }
      `}</style>

      {/* Header Yappy */}
      <div className="flex items-center gap-3">
        {/* Yappy Icono Personalizado */}
        <div className="h-11 w-11 rounded-2xl yappy-gradient flex items-center justify-center text-white text-xl font-black shadow-lg shadow-[#0057FF]/25">
          Y
        </div>
        <div>
          <h3 className="text-base font-black text-gray-900 leading-tight">Yappy</h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Pago Directo y Seguro</p>
        </div>
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="ml-auto text-xs font-black uppercase tracking-wider text-gray-400 hover:text-gray-900 disabled:opacity-50 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={2.5} /> Volver
        </button>
      </div>

      {/* Datos del pago */}
      <div className="yappy-gradient text-white rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden">
        {/* Luz decorativa */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full blur-xl pointer-events-none" />

        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-white/70 uppercase tracking-widest flex items-center gap-1"><Coins size={14} /> Importe a transferir</span>
          <span className="text-2xl font-black font-mono">{formatPrice(amount)}</span>
        </div>

        <div className="border-t border-white/15 pt-4">
          <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest mb-2.5">Envía el monto exacto al siguiente número:</p>
          
          <div className="bg-black/25 rounded-2xl border border-white/10 p-4 relative overflow-hidden group">
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0">
                <span className="text-[9px] text-white/60 font-black uppercase tracking-wider block">Número de Directorio</span>
                <span className="text-2xl font-black tracking-widest text-[#FBBF24] font-mono block mt-0.5">{YAPPY_PHONE}</span>
                <span className="text-[10px] text-white/70 font-semibold block mt-1">A nombre de: <span className="font-extrabold text-white">{YAPPY_NAME}</span></span>
              </div>
              
              {/* QR Code Simulado Premium */}
              <div className="h-16 w-16 bg-white rounded-xl p-1.5 flex-shrink-0 relative overflow-hidden flex items-center justify-center shadow-md">
                <QrCode size={48} className="text-gray-900" strokeWidth={1.8} />
                {/* Láser de escaneo animado */}
                <div className="absolute left-0 right-0 h-0.5 bg-[#7F00FF] scan-line shadow-[0_0_8px_#7F00FF]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="glass-card rounded-2xl p-5 space-y-3.5 shadow-sm">
        <h4 className="text-xs font-black uppercase tracking-widest text-gray-900">Guía de Pasos:</h4>
        <div className="space-y-3">
          
          <div className="flex gap-3">
            <div className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black instruction-number flex-shrink-0">1</div>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Abre la aplicación de **Banco General** e ingresa a **Yappy**.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black instruction-number flex-shrink-0">2</div>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Selecciona la opción de **Enviar dinero**.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black instruction-number flex-shrink-0">3</div>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Busca por número de teléfono e introduce: <span className="font-extrabold text-[#7F00FF] font-mono">{YAPPY_PHONE}</span>.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black instruction-number flex-shrink-0">4</div>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Transfiere el monto total de <span className="font-extrabold text-[#7F00FF] font-mono">{formatPrice(amount)}</span>.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black instruction-number flex-shrink-0">5</div>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Regresa aquí y presiona el botón **Confirmar Pago** para validar.
            </p>
          </div>

        </div>
      </div>

      {/* Botón confirmar */}
      <motion.button
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        onClick={handleConfirm}
        disabled={isProcessing}
        className="w-full rounded-2xl yappy-gradient px-4 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-[#0057FF]/20 hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Verificando pago...</span>
          </>
        ) : (
          <>
            <Smartphone size={16} strokeWidth={2.5} />
            <span>Confirmar Pago</span>
          </>
        )}
      </motion.button>

      <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
        Al confirmar, validaremos la recepción del depósito en nuestra cuenta.
      </p>
    </div>
  );
}

export default YappyPayment;