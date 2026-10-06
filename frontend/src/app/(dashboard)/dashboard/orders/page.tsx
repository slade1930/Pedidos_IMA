"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderTable } from "@/features/orders/components/OrderTable";
import { OrderCard } from "@/features/orders/components/OrderCard";
import { OrderForm } from "@/features/orders/components/OrderForm";
import { orderService } from "@/features/orders/services/order.service";
import { useFairs } from "@/features/fairs/hooks/useFairs";
import { useDebounce } from "@/hooks/useDebounce";
import type {
  Order,
  CreateOrderPayload,
  UpdateOrderStatusPayload,
  OrderStatus,
} from "@/features/orders/types/order.types";
import { motion, AnimatePresence } from "framer-motion";

// ─── ESTADOS DISPONIBLES ──────────────────────────────────

const STATUS_OPTIONS: { value: OrderStatus | ""; label: string }[] = [
  { value: "", label: "Todos los estados" },
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmada" },
  { value: "ready", label: "Lista" },
  { value: "delivered", label: "Entregada" },
  { value: "cancelled", label: "Cancelada" },
  { value: "expired", label: "Expirada" },
];

// ─── LEYENDA VISUAL DE ESTADOS ─────────────────────────────

const STATUS_LEGEND: { value: OrderStatus | ""; label: string; dot: string; animate?: boolean }[] = [
  { value: "pending", label: "Pendiente", dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]", animate: true },
  { value: "confirmed", label: "Confirmada", dot: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" },
  { value: "ready", label: "Lista", dot: "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]", animate: true },
  { value: "delivered", label: "Entregada", dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" },
  { value: "cancelled", label: "Cancelada", dot: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]" },
  { value: "expired", label: "Expirada", dot: "bg-zinc-500" },
];

// ─── COMPONENTE ────────────────────────────────────────────

export default function OrdersPage() {
  const queryClient = useQueryClient();

  const [modalMode, setModalMode] = useState<"create" | "view" | "status" | "report" | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [fairFilter, setFairFilter] = useState<string>("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>("pending");
  const [isDownloading, setIsDownloading] = useState(false);

  // Filtros del reporte
  const [reportFairId, setReportFairId] = useState<string>("");
  const [reportDateFrom, setReportDateFrom] = useState<string>("");
  const [reportDateTo, setReportDateTo] = useState<string>("");

  // Búsqueda en tiempo real con debounce
  const debouncedSearch = useDebounce(searchInput, 300);

  const { data: fairsData } = useFairs({ limit: 100 });
  const fairs = Array.isArray(fairsData) ? fairsData : fairsData?.data ?? [];

  // 👈 HANDLER PARA DESCARGAR REPORTE CON FILTROS
  const handleDownloadReport = async () => {
    setIsDownloading(true);
    setServerError(null);
    try {
      await orderService.downloadOrdersReport({
        fair_id: reportFairId || undefined,
        date_from: reportDateFrom || undefined,
        date_to: reportDateTo || undefined,
      });
      setModalMode(null);
    } catch {
      setServerError("Error al generar el reporte");
    } finally {
      setIsDownloading(false);
    }
  };

  // ─── MUTACIÓN: CREAR ────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: CreateOrderPayload) => orderService.createOrder(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setSelectedOrder(data);
      setModalMode("view");
    },
    onError: (error: { message: string }) => {
      setServerError(error.message || "Error al crear orden");
    },
  });

  // ─── MUTACIÓN: CAMBIAR ESTADO ───────────────────────
  const statusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusPayload }) =>
      orderService.updateOrderStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      closeModal();
    },
    onError: (error: { message: string }) => {
      setServerError(error.message || "Error al cambiar estado");
    },
  });

  // ─── HANDLERS ───────────────────────────────────────
  const openCreateModal = useCallback(() => {
    setSelectedOrder(null);
    setServerError(null);
    setModalMode("create");
  }, []);

  const openViewModal = useCallback((order: Order) => {
    setSelectedOrder(order);
    setServerError(null);
    setModalMode("view");
  }, []);

  const openStatusModal = useCallback((order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setServerError(null);
    setModalMode("status");
  }, []);

  const openReportModal = useCallback(() => {
    setServerError(null);
    setReportFairId("");
    setReportDateFrom("");
    setReportDateTo("");
    setModalMode("report");
  }, []);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setSelectedOrder(null);
    setServerError(null);
  }, []);

  const handleCreateSubmit = useCallback(
    (data: CreateOrderPayload) => {
      createMutation.mutate(data);
    },
    [createMutation]
  );

  const handleStatusSubmit = useCallback(() => {
    if (selectedOrder) {
      statusMutation.mutate({
        id: selectedOrder.id,
        data: { status: newStatus },
      });
    }
  }, [selectedOrder, newStatus, statusMutation]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6 text-slate-800 dark:text-[#eef6f4]"
    >
      <style>{`
        .chocolate-panel {
          background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid rgba(58, 95, 38, 0.3);
          box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.6);
        }
        .premium-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23A16207'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 16px;
          padding-right: 42px;
        }
        .yellow-btn {
          background: linear-gradient(135deg, var(--itas-gold) 0%, #20917a 100%);
          color: #ffffff;
          font-weight: 700;
          box-shadow: 0 4px 16px rgba(var(--itas-gold-rgb), 0.35);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .yellow-btn:hover {
          background: linear-gradient(135deg, #d4a020 0%, #20917a 100%);
          transform: translateY(-1.5px);
          box-shadow: 0 6px 22px rgba(var(--itas-gold-rgb), 0.5);
        }
        .yellow-btn:active {
          transform: translateY(0);
        }
        .chocolate-input {
          background-color: #ffffff;
          border: 1.5px solid rgba(58, 95, 38, 0.35);
          color: #0f172a;
        }
        .chocolate-input:focus {
          border-color: var(--itas-green);
          box-shadow: 0 0 0 3px rgba(var(--itas-green-rgb), 0.15);
          outline: none;
        }
        .chocolate-input::placeholder {
          color: #94a3b8;
        }
        .dark .chocolate-input {
          background-color: #0e1e33;
          color: #eef6f4;
        }
      `}</style>

      {/* Cabecera Premium */}
      <section className="relative overflow-hidden rounded-2xl chocolate-panel px-6 py-7 sm:px-8 sm:py-8">
        {/* Capa decorativa */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-32 h-72 w-72 rounded-full bg-[var(--itas-green)]/10 dark:bg-[#1b4f72]/25 blur-3xl animate-float" />
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--itas-gold)]/10 dark:bg-[#2fd4a7]/10 blur-3xl" />
          <div className="absolute bottom-0 right-[12%] h-48 w-48 rounded-full bg-[#2e7d9e]/10 dark:bg-[#2e7d9e]/15 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--itas-gold)]/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--itas-green)]/50 to-transparent" />
        </div>

        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl">
            {/* Insignia de sección */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--itas-gold)]/30 bg-[var(--itas-gold)]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--itas-gold)] backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--itas-gold)] animate-pulse shadow-[0_0_8px_rgba(var(--itas-gold-rgb),0.9)]" />
              Panel de Administración
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-gradient-gold leading-none">
              Órdenes
            </h1>
            <p className="mt-3 text-sm text-slate-500 dark:text-[#E8D8CA] font-medium leading-relaxed max-w-xl">
              Supervisa, filtra y gestiona el flujo de órdenes activas y pasadas del sistema.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Botón Generar Reporte */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openReportModal}
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold cursor-pointer border border-[var(--itas-green)]/50 bg-white dark:bg-[#0e1e33]/90 text-[var(--itas-gold)] hover:bg-[var(--itas-green)] hover:text-white hover:border-[var(--itas-green)] transition-all duration-200 shadow-md"
            >
              <svg className="h-5 w-5 mr-2 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Generar Reporte
            </motion.button>

            {/* Botón Nueva Orden */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openCreateModal}
              className="yellow-btn inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm cursor-pointer"
            >
              <svg className="h-5 w-5 mr-2 stroke-[3] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nueva Orden
            </motion.button>
          </div>
        </div>

        {/* Tira de métricas + leyenda de estados */}
        <div className="relative mt-8 flex flex-col lg:flex-row lg:items-center gap-5 rounded-2xl border border-slate-200/70 dark:border-white/10 bg-slate-50/70 dark:bg-black/20 px-5 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--itas-green)]/40 bg-[var(--itas-green-light)]/25 text-[var(--itas-green)] dark:text-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.15)]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l1.5-5h15L21 9M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0M4 9v10a2 2 0 002 2h12a2 2 0 002-2V9M3 21h18" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#7c95a8]">Ferias gestionadas</p>
              <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{fairs.length}</p>
            </div>
          </div>

          <div className="hidden lg:block h-10 w-px mx-1 bg-gradient-to-b from-transparent via-slate-300 dark:via-white/15 to-transparent" />

          <div className="flex-1 flex flex-wrap items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-[#7c95a8] mr-1">Flujo</span>
            {STATUS_LEGEND.map((s) => (
              <span key={s.value} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:text-[#c9dad4] backdrop-blur-md">
                <span className={`h-1.5 w-1.5 rounded-full ${s.dot} ${s.animate ? "animate-pulse" : ""}`} />
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Panel de Filtros */}
      <div className="chocolate-panel p-5 rounded-2xl">
        <div className="mb-4 flex items-center gap-2">
          <svg className="h-4 w-4 text-[var(--itas-gold)]/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
          </svg>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-[#7c95a8]">Filtrar órdenes</p>
          <span className="flex-1 h-px bg-gradient-to-r from-[var(--itas-green)]/40 to-transparent" />
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
        {/* Buscador en tiempo real */}
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--itas-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por número de orden, cliente o cédula..."
            className="chocolate-input block w-full rounded-xl pl-12 pr-4 py-3 text-sm transition-all"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Selector de Feria */}
          <select
            value={fairFilter}
            onChange={(e) => setFairFilter(e.target.value)}
            className="premium-select chocolate-input rounded-xl px-4 py-3 text-sm transition-all cursor-pointer sm:w-56 font-medium"
          >
            <option value="" className="bg-white text-slate-800">Todas las ferias</option>
            {fairs.map((fair: { id: string; name: string }) => (
              <option key={fair.id} value={fair.id} className="bg-white text-slate-800">{fair.name}</option>
            ))}
          </select>

          {/* Selector de Estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="premium-select chocolate-input rounded-xl px-4 py-3 text-sm transition-all cursor-pointer sm:w-48 font-medium"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white text-slate-800">{opt.label}</option>
            ))}
          </select>
        </div>
        </div>
      </div>

      {/* Contenedor de la Tabla */}
      <div className="chocolate-panel rounded-2xl overflow-hidden">
        <OrderTable
          search={debouncedSearch}
          statusFilter={statusFilter}
          fairIdFilter={fairFilter}
          fairs={fairs}
          onView={openViewModal}
          onStatusChange={openStatusModal}
        />
      </div>

      {/* Modal Reporte */}
      {modalMode === "report" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={closeModal} 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative chocolate-panel rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-7 text-slate-800 dark:text-[#eef6f4]"
          >
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 dark:text-white/80 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15 transition-all duration-200 cursor-pointer" 
              aria-label="Cerrar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-5 mt-1">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-[var(--itas-gold)]">Generar Reporte</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-[#c9dad4]">
                  Filtra por feria y rango de fechas para generar un reporte PDF
                </p>
              </div>

              {serverError && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/90 border border-red-500/80 p-4 shadow-sm">
                  <p className="text-sm text-red-700 dark:text-red-200 font-semibold">{serverError}</p>
                </div>
              )}

              {/* Feria */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-[#eef6f4]">Feria</label>
                <select 
                  value={reportFairId} 
                  onChange={(e) => setReportFairId(e.target.value)}
                  className="premium-select chocolate-input block w-full rounded-xl px-4 py-3 text-sm transition-all cursor-pointer font-medium"
                >
                  <option value="" className="bg-white text-slate-800">Todas las ferias</option>
                  {fairs.map((fair: { id: string; name: string }) => (
                    <option key={fair.id} value={fair.id} className="bg-white text-slate-800">{fair.name}</option>
                  ))}
                </select>
              </div>

              {/* Fecha Desde */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-[#eef6f4]">Fecha desde</label>
                <input 
                  type="date" 
                  value={reportDateFrom} 
                  onChange={(e) => setReportDateFrom(e.target.value)}
                  className="chocolate-input block w-full rounded-xl px-4 py-3 text-sm transition-all font-medium" 
                />
              </div>

              {/* Fecha Hasta */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-[#eef6f4]">Fecha hasta</label>
                <input 
                  type="date" 
                  value={reportDateTo} 
                  onChange={(e) => setReportDateTo(e.target.value)}
                  className="chocolate-input block w-full rounded-xl px-4 py-3 text-sm transition-all font-medium" 
                />
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-[var(--itas-green)]/40">
                <button 
                  onClick={closeModal} 
                  disabled={isDownloading}
                  className="rounded-xl border border-slate-300 dark:border-white/20 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-[#eef6f4] hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDownloadReport} 
                  disabled={isDownloading}
                  className="yellow-btn rounded-xl px-5 py-2.5 text-sm disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isDownloading ? "Generando..." : "Descargar PDF"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modales existentes */}
      <AnimatePresence>
        {modalMode === "create" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={closeModal} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative chocolate-panel rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-7 text-slate-800 dark:text-[#eef6f4]"
            >
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 dark:text-white/80 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15 transition-all duration-200 cursor-pointer" 
                aria-label="Cerrar"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="mt-1 text-slate-800 dark:text-[#eef6f4]">
                <OrderForm 
                  onSubmit={handleCreateSubmit} 
                  onCancel={closeModal}
                  isSubmitting={createMutation.isPending} 
                  serverError={serverError} 
                />
              </div>
            </motion.div>
          </div>
        )}

        {modalMode === "view" && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={closeModal} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative chocolate-panel rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-7 text-slate-800 dark:text-[#eef6f4]"
            >
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 dark:text-white/80 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15 transition-all duration-200 z-10 cursor-pointer" 
                aria-label="Cerrar"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="space-y-5 mt-1">
                <div className="rounded-xl bg-slate-50 dark:bg-[#0e1e33] p-4 border border-[var(--itas-green)]/30 dark:border-[#1b4f72]/50 shadow-inner">
                  <OrderCard 
                    order={selectedOrder} 
                    onStatusChange={(order) => { closeModal(); openStatusModal(order); }} 
                  />
                </div>
                <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-slate-50 dark:bg-[#0e1e33] border border-[var(--itas-green)]/30 dark:border-[#1b4f72]/50 shadow-inner">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-[#7c95a8]">Código de Retiro</span>
                  {selectedOrder.pickup_code ? (
                    <span className="font-mono text-4xl font-black tracking-widest text-[var(--itas-gold)] dark:text-gradient-gold">
                      {selectedOrder.pickup_code}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {modalMode === "status" && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={closeModal} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative chocolate-panel rounded-2xl w-full max-w-md p-7 text-slate-800 dark:text-[#eef6f4]"
            >
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 dark:text-white/80 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15 transition-all duration-200 cursor-pointer" 
                aria-label="Cerrar"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="space-y-5 mt-1">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-[var(--itas-gold)]">Cambiar Estado</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-[#c9dad4]">
                    Actualizando el estado de la Orden <span className="font-bold text-[var(--itas-gold)]">{selectedOrder.order_number}</span>
                  </p>
                </div>

                {serverError && (
                  <div className="rounded-xl bg-red-50 dark:bg-red-950/90 border border-red-500/80 p-4 shadow-sm">
                    <p className="text-sm text-red-700 dark:text-red-200 font-semibold">{serverError}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="status" className="block text-sm font-bold text-slate-700 dark:text-[#eef6f4]">Nuevo estado</label>
                  <select 
                    id="status" 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    disabled={statusMutation.isPending}
                    className="premium-select chocolate-input block w-full rounded-xl px-4 py-3 text-sm transition-all cursor-pointer font-medium disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.filter(o => o.value !== "").map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-white text-slate-800">{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-5 border-t border-[var(--itas-green)]/40">
                  <button 
                    onClick={closeModal} 
                    disabled={statusMutation.isPending}
                    className="rounded-xl border border-slate-300 dark:border-white/20 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-[#eef6f4] hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleStatusSubmit} 
                    disabled={statusMutation.isPending}
                    className="yellow-btn rounded-xl px-5 py-2.5 text-sm disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {statusMutation.isPending ? "Cambiando..." : "Cambiar Estado"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
