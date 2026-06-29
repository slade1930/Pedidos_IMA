"use client";

import { motion } from "framer-motion";
import { Check, ShieldCheck, Heart } from "lucide-react";

// ─── PROPS ─────────────────────────────────────────────────

interface PaymentSuccessProps {
  message: string;
  submessage: string;
}

// ─── COMPONENTE ────────────────────────────────────────────

export function PaymentSuccess({ message, submessage }: PaymentSuccessProps) {
  // Generar posiciones aleatorias para las partículas de confeti
  const confettiParticles = Array.from({ length: 24 }).map((_, i) => ({
    id: i,
    x: Math.random() * 400 - 200,
    y: Math.random() * -300 - 50,
    size: Math.random() * 8 + 6,
    color: i % 3 === 0 ? "#3A5F26" : i % 3 === 1 ? "#FBBF24" : "#22C55E",
    delay: Math.random() * 0.4,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="text-center py-6 px-4 space-y-6 relative overflow-hidden">
      {/* Confeti Animado */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {confettiParticles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              opacity: 1, 
              x: 0, 
              y: 0, 
              scale: 0,
              rotate: 0 
            }}
            animate={{ 
              opacity: [1, 1, 0], 
              x: particle.x, 
              y: particle.y, 
              scale: [0, 1.2, 0.8],
              rotate: particle.rotation + 360
            }}
            transition={{ 
              duration: 2.2, 
              delay: particle.delay,
              ease: [0.1, 0.8, 0.3, 1] 
            }}
            className="absolute rounded-md"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
            }}
          />
        ))}
      </div>

      {/* Glow de fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#3A5F26]/8 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Círculo del Checkmark con anillos concéntricos */}
      <div className="relative mx-auto h-28 w-28 flex items-center justify-center">
        {/* Anillo exterior animado */}
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full border-2 border-[#3A5F26]/30"
        />
        {/* Anillo interior animado */}
        <motion.div 
          animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-2 rounded-full border border-[#FBBF24]/40"
        />
        {/* Círculo central */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="h-20 w-20 rounded-full bg-gradient-to-tr from-[#1E3A1E] to-[#3A5F26] flex items-center justify-center text-[#FBBF24] shadow-xl shadow-[#3A5F26]/30 relative z-10"
        >
          {/* Checkmark animado */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 12 }}
          >
            <Check size={38} strokeWidth={3.5} />
          </motion.div>
        </motion.div>
      </div>

      {/* Mensajes */}
      <div className="space-y-2 relative z-10 max-w-sm mx-auto">
        <motion.h3 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-black text-gray-900 tracking-tight"
        >
          {message}
        </motion.h3>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-[#3A5F26] font-extrabold uppercase tracking-widest flex items-center justify-center gap-1.5"
        >
          <ShieldCheck size={14} className="text-[#3A5F26]" /> Transacción Completada
        </motion.p>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-gray-500 font-semibold leading-relaxed pt-2"
        >
          {submessage}
        </motion.p>
      </div>

      {/* Barra de progreso de redirección */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="pt-4 max-w-xs mx-auto space-y-2"
      >
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.8, ease: "linear" }}
            className="absolute top-0 left-0 bottom-0 bg-[#3A5F26]"
          />
        </div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
          Por favor, no cierres esta ventana
        </p>
      </motion.div>

      {/* Footer de agradecimiento */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1 }}
        className="text-[9px] text-gray-400 font-bold uppercase tracking-widest pt-6 flex items-center justify-center gap-1"
      >
        Gracias por apoyar al productor nacional <Heart size={8} className="text-red-500 fill-red-500" /> IMA
      </motion.div>
    </div>
  );
}

export default PaymentSuccess;