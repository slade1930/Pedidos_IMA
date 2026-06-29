"use client";

import { useState } from "react";
import { useOrder } from "@/features/orders/hooks/useOrder";
import { OrderCard } from "@/features/orders/components/OrderCard";
import { OrderConfirmation } from "@/features/shop/components/OrderConfirmation";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  FileDown, 
  User, 
  MapPin, 
  ChevronLeft, 
  Copy, 
  Check, 
  AlertTriangle,
  Receipt,
  Store,
  ShieldCheck,
  Clock,
  PackageCheck
} from "lucide-react";

// ─── PROPS ─────────────────────────────────────────────────

interface OrderDetailProps {
  orderId: string;
}

// ─── UTILITARIOS ───────────────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("es-PA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "Reciente";
  }
}

// ─── COMPONENTE ────────────────────────────────────────────

export function OrderDetail({ orderId }: OrderDetailProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isNew = searchParams.get("new") === "true";
  const [copied, setCopied] = useState(false);

  const { data: order, isPending, isError } = useOrder(orderId);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleCopyCode = () => {
    if (order?.pickup_code) {
      navigator.clipboard.writeText(order.pickup_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#3A5F26] border-t-transparent" />
          <div className="absolute h-8 w-8 rounded-full bg-[#1E3A1E]/10 animate-ping" />
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-[#3A5F26]/70 animate-pulse">
          Cargando detalles de tu pedido...
        </p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="text-center py-20 max-w-md mx-auto px-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4 border border-red-200">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Pedido no encontrado</h2>
        <p className="text-sm text-gray-500 mt-2 font-medium">
          No pudimos localizar la información del pedido solicitado. Verifica el código e intenta de nuevo.
        </p>
        <button
          onClick={() => router.push("/shop/history")}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg hover:bg-gray-800 transition-all"
        >
          <ChevronLeft size={14} strokeWidth={2.5} />
          Volver al Historial
        </button>
      </div>
    );
  }

  // Si es nuevo, mostrar confirmación
  if (isNew) {
    return <OrderConfirmation order={order} />;
  }

  const isCancelled = order.status === "cancelled";
  const isExpired = order.status === "expired";

  // Mapeo de estados para la barra de progreso
  const steps = [
    { label: "Pendiente", description: "Espera de pago", icon: Clock },
    { label: "Confirmada", description: "Compra registrada", icon: ShieldCheck },
    { label: "Lista para Retiro", description: "Visita la feria", icon: Store },
    { label: "Entregada", description: "¡Disfruta tus productos!", icon: PackageCheck },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case "pending": return 0;
      case "confirmed": return 1;
      case "ready": return 2;
      case "delivered": return 3;
      default: return -1;
    }
  };

  const currentStep = getStepIndex(order.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative text-[#1E3A1E] space-y-8">
      {/* Estilos CSS Locales para Diseño Premium */}
      <style>{`
        .premium-shadow {
          box-shadow: 0 20px 40px -15px rgba(58, 95, 38, 0.08);
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(58, 95, 38, 0.06);
        }
        .gold-stamp-gradient {
          background: linear-gradient(135deg, #1E3A1E, #122412);
          border: 1px solid rgba(251, 191, 36, 0.35);
        }
        .gold-glow-border {
          border: 2px dashed #FBBF24;
          box-shadow: 0 0 25px rgba(251, 191, 36, 0.12);
        }
        .pulse-gold {
          animation: pulse-gold-keyframes 3s infinite ease-in-out;
        }
        @keyframes pulse-gold-keyframes {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.3; }
        }
        .ticket-cutout-left, .ticket-cutout-right {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: #f9fafb;
          z-index: 10;
        }
        .ticket-cutout-left { left: -9px; }
        .ticket-cutout-right { right: -9px; }
      `}</style>

      {/* Luces de Fondo Decorativas */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-[#3A5F26]/4 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#FBBF24]/3 rounded-full blur-3xl pointer-events-none" />

      {/* Cabecera / Botón Atrás + Título */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={() => router.push("/shop/history")}
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#3A5F26] hover:text-[#1E3A1E] transition-colors mb-2"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
            <span>Volver al Historial</span>
          </button>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            Detalle del Pedido
          </h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            IMA Panamá — Ref: {order.order_number}
          </p>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-3">
          <a
            href={`${apiUrl}/api/v1/orders/${order.id}/invoice`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all bg-white shadow-sm"
          >
            <FileDown size={14} strokeWidth={2.5} />
            <span>Descargar Factura</span>
          </a>
        </div>
      </div>

      {/* SECCIÓN ESTADO DEL PEDIDO */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel rounded-3xl p-6 md:p-8 premium-shadow"
      >
        {isCancelled || isExpired ? (
          <div className="flex items-center gap-4 bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700">
            <AlertTriangle size={32} className="flex-shrink-0" />
            <div>
              <h3 className="font-extrabold uppercase text-xs tracking-wider">
                Pedido {isCancelled ? "Cancelado" : "Expirado"}
              </h3>
              <p className="text-sm font-medium opacity-90 mt-1">
                Este pedido ha sido {isCancelled ? "cancelado de forma definitiva" : "marcado como expirado por falta de retiro"}. Si tienes alguna duda, contacta al soporte de la feria libre.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#3A5F26]/10 pb-4">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                Progreso del Envío / Retiro
              </span>
              <span className="text-xs font-black uppercase tracking-widest text-[#3A5F26] bg-[#3A5F26]/10 px-3 py-1 rounded-full">
                {steps[currentStep]?.label ?? "Procesando"}
              </span>
            </div>

            {/* Timeline Horizontal */}
            <div className="relative pt-6 pb-2">
              {/* Barra de progreso conectora */}
              <div className="absolute top-[38px] left-[10%] right-[10%] h-[3px] bg-gray-100 rounded-full z-0">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${(currentStep / 3) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-[#3A5F26] to-[#FBBF24] rounded-full"
                />
              </div>

              {/* Hitos */}
              <div className="relative z-10 grid grid-cols-4 gap-2 text-center">
                {steps.map((step, idx) => {
                  const IconComponent = step.icon;
                  const isCompleted = idx < currentStep;
                  const isActive = idx === currentStep;

                  return (
                    <div key={idx} className="flex flex-col items-center space-y-3">
                      {/* Círculo del icono */}
                      <motion.div
                        initial={isActive ? { scale: 0.9 } : false}
                        animate={isActive ? { scale: [1, 1.08, 1] } : false}
                        transition={isActive ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : undefined}
                        className={`h-11 w-11 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-[#3A5F26] text-white shadow-lg shadow-[#3A5F26]/20"
                            : isActive
                            ? "bg-gradient-to-tr from-[#3A5F26] to-[#558b38] text-white shadow-lg shadow-[#3A5F26]/30 border-2 border-white"
                            : "bg-white text-gray-400 border border-gray-200"
                        }`}
                      >
                        {isCompleted ? (
                          <Check size={18} strokeWidth={3} />
                        ) : (
                          <IconComponent size={18} strokeWidth={isActive ? 2.5 : 2} />
                        )}
                      </motion.div>

                      {/* Texto */}
                      <div className="space-y-0.5">
                        <p className={`text-xs font-black uppercase tracking-wider ${isActive ? "text-[#1E3A1E]" : isCompleted ? "text-gray-700" : "text-gray-400"}`}>
                          {step.label}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold hidden sm:block">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* DISEÑO EN DOS COLUMNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* COLUMNA PRINCIPAL: DETALLE DE PRODUCTOS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Card del pedido */}
          <div className="bg-white rounded-3xl p-1 border border-gray-100 premium-shadow">
            <OrderCard order={order} />
          </div>

          {/* Banner de Garantía / Comercio Justo */}
          <div className="glass-panel rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-4 border border-[#3A5F26]/10">
            <div className="h-12 w-12 rounded-2xl bg-[#3A5F26]/10 flex items-center justify-center text-[#3A5F26] flex-shrink-0">
              <Store size={22} />
            </div>
            <div className="text-center sm:text-left space-y-0.5">
              <h4 className="text-xs font-black uppercase tracking-widest text-[#1E3A1E]">Apoyando la Producción Nacional</h4>
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                Este pedido impulsa directamente a los productores locales panameños. Al comprar en las ferias libres, obtienes frescura garantizada y fomentas el comercio justo en el país.
              </p>
            </div>
          </div>
        </motion.div>

        {/* COLUMNA LATERAL: DETALLES DE RETIRO Y CLIENTE */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* CÓDIGO DE RETIRO (TICKET ESTILO STAMP GOLD PREMIUM) */}
          {order.pickup_code && !isCancelled && !isExpired && (
            <motion.div
              whileHover={{ y: -2 }}
              className="gold-stamp-gradient text-white rounded-3xl p-6 text-center relative overflow-hidden premium-shadow cursor-pointer"
              onClick={handleCopyCode}
            >
              {/* Pulso de fondo */}
              <div className="absolute inset-0 bg-[#FBBF24] pulse-gold pointer-events-none" />
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />

              <div className="relative z-10 space-y-3">
                <span className="text-[10px] text-[#FBBF24] font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <MapPin size={12} /> Código de Retiro Autorizado
                </span>

                <div className="gold-glow-border rounded-2xl p-5 bg-black/45 flex flex-col items-center justify-center relative">
                  {/* Cortes de boleto laterales */}
                  <div className="ticket-cutout-left" style={{ backgroundColor: "#1e3a1e", left: "-9px" }} />
                  <div className="ticket-cutout-right" style={{ backgroundColor: "#1e3a1e", right: "-9px" }} />

                  <p className="text-4xl sm:text-5xl font-black tracking-widest text-[#FBBF24] font-mono leading-none">
                    {order.pickup_code}
                  </p>

                  {/* Código de barras decorativo */}
                  <div className="flex gap-0.5 h-6 mt-4 opacity-50">
                    {[2, 4, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 4, 2, 1, 3, 2, 4].map((width, idx) => (
                      <div key={idx} className="bg-white h-full" style={{ width: `${width}px` }} />
                    ))}
                  </div>
                </div>

                {/* Acciones de Copiado */}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  {copied ? (
                    <span className="text-xs text-green-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                      <Check size={12} strokeWidth={3} /> ¡Copiado!
                    </span>
                  ) : (
                    <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Copy size={11} /> Clic para copiar código
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* DATOS DEL CLIENTE */}
          {(order.customer_name || order.customer_cedula) && (
            <div className="glass-panel rounded-3xl p-5 space-y-4 premium-shadow">
              <div className="flex items-center gap-2 border-b border-[#3A5F26]/10 pb-3">
                <div className="h-7 w-7 rounded-lg bg-[#3A5F26]/10 flex items-center justify-center text-[#3A5F26]">
                  <User size={14} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">
                  Datos del Cliente
                </h3>
              </div>

              <div className="space-y-3 text-xs font-bold">
                {order.customer_name && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-400 uppercase tracking-wider">Nombre</span>
                    <span className="text-gray-900 font-extrabold text-right max-w-[180px] truncate">
                      {order.customer_name}
                    </span>
                  </div>
                )}
                {order.customer_cedula && (
                  <div className="flex justify-between items-center py-1 border-t border-gray-50">
                    <span className="text-gray-400 uppercase tracking-wider">Cédula</span>
                    <span className="text-gray-900 font-extrabold font-mono">
                      {order.customer_cedula}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RESUMEN FINANCIERO ADICIONAL */}
          <div className="glass-panel rounded-3xl p-5 space-y-4 premium-shadow">
            <div className="flex items-center gap-2 border-b border-[#3A5F26]/10 pb-3">
              <div className="h-7 w-7 rounded-lg bg-[#3A5F26]/10 flex items-center justify-center text-[#3A5F26]">
                <Receipt size={14} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">
                Resumen de Transacción
              </h3>
            </div>

            <div className="space-y-3 text-xs font-bold">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400 uppercase tracking-wider">Fecha de Compra</span>
                <span className="text-gray-900 font-extrabold">
                  {order.created_at ? formatDate(order.created_at) : "Reciente"}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-200">
                <span className="text-[#3A5F26] uppercase tracking-wider">Importe Total</span>
                <span className="text-lg font-black text-gray-900 font-mono">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default OrderDetail;