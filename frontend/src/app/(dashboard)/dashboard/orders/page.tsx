"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderTable } from "@/features/orders/components/OrderTable";
import { OrderCard } from "@/features/orders/components/OrderCard";
import { OrderForm } from "@/features/orders/components/OrderForm";
import { QRDisplay } from "@/features/orders/components/QRDisplay";
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCreateSubmit = useCallback(
    (data: any) => {
      createMutation.mutate(data as CreateOrderPayload);
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
      className="space-y-6 text-[#FFF8F0]"
    >
      <style>{`
        .chocolate-panel {
          background: linear-gradient(145deg, #28170F 0%, #1D100A 100%);
          border: 1px solid rgba(58, 95, 38, 0.6);
          box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.05);
        }
        .premium-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FBBF24'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 16px;
          padding-right: 42px;
        }
        .yellow-btn {
          background: linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%);
          color: #1A0D07;
          font-weight: 700;
          box-shadow: 0 4px 16px rgba(251, 191, 36, 0.35);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .yellow-btn:hover {
          background: linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%);
          transform: translateY(-1.5px);
          box-shadow: 0 6px 22px rgba(251, 191, 36, 0.5);
        }
        .yellow-btn:active {
          transform: translateY(0);
        }
        .chocolate-input {
          background-color: #150C07;
          border: 1.5px solid rgba(58, 95, 38, 0.5);
          color: #FFF8F0;
        }
        .chocolate-input:focus {
          border-color: #FBBF24;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.2);
          outline: none;
        }
        .chocolate-input::placeholder {
          color: #A38F80;
        }
      `}</style>

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-[#3A5F26]/40 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-sm">
            Órdenes
          </h1>
          <p className="mt-1.5 text-sm text-[#E8D8CA] font-medium leading-relaxed">
            Supervisa, filtra y gestiona el flujo de órdenes activas y pasadas del sistema.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Botón Generar Reporte */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openReportModal}
            className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold cursor-pointer border border-[#3A5F26] bg-[#1E120C]/90 text-[#FBBF24] hover:bg-[#3A5F26] hover:text-white hover:border-[#3A5F26] transition-all duration-200 shadow-md"
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
            <svg className="h-5 w-5 mr-2 stroke-[3] text-[#1A0D07]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nueva Orden
          </motion.button>
        </div>
      </div>

      {/* Panel de Filtros */}
      <div className="chocolate-panel p-5 rounded-2xl flex flex-col lg:flex-row gap-4">
        {/* Buscador en tiempo real */}
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#FBBF24]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
            <option value="" className="bg-[#150C07] text-[#FFF8F0]">Todas las ferias</option>
            {fairs.map((fair: { id: string; name: string }) => (
              <option key={fair.id} value={fair.id} className="bg-[#150C07] text-[#FFF8F0]">{fair.name}</option>
            ))}
          </select>

          {/* Selector de Estado */}
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="premium-select chocolate-input rounded-xl px-4 py-3 text-sm transition-all cursor-pointer sm:w-48 font-medium"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#150C07] text-[#FFF8F0]">{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Contenedor de la Tabla */}
      <div className="chocolate-panel rounded-2xl overflow-hidden">
        <OrderTable
          search={debouncedSearch}
          statusFilter={statusFilter}
          fairIdFilter={fairFilter}
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
            className="relative chocolate-panel rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-7 text-[#FFF8F0]"
          >
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 border border-white/15 transition-all duration-200 cursor-pointer" 
              aria-label="Cerrar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-5 mt-1">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-[#FBBF24]">Generar Reporte</h3>
                <p className="mt-1 text-sm text-[#D4C4B5]">
                  Filtra por feria y rango de fechas para generar un reporte PDF
                </p>
              </div>

              {serverError && (
                <div className="rounded-xl bg-red-950/90 border border-red-500/80 p-4 shadow-sm">
                  <p className="text-sm text-red-200 font-semibold">{serverError}</p>
                </div>
              )}

              {/* Feria */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#FFF8F0]">Feria</label>
                <select 
                  value={reportFairId} 
                  onChange={(e) => setReportFairId(e.target.value)}
                  className="premium-select chocolate-input block w-full rounded-xl px-4 py-3 text-sm transition-all cursor-pointer font-medium"
                >
                  <option value="" className="bg-[#150C07] text-[#FFF8F0]">Todas las ferias</option>
                  {fairs.map((fair: { id: string; name: string }) => (
                    <option key={fair.id} value={fair.id} className="bg-[#150C07] text-[#FFF8F0]">{fair.name}</option>
                  ))}
                </select>
              </div>

              {/* Fecha Desde */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#FFF8F0]">Fecha desde</label>
                <input 
                  type="date" 
                  value={reportDateFrom} 
                  onChange={(e) => setReportDateFrom(e.target.value)}
                  className="chocolate-input block w-full rounded-xl px-4 py-3 text-sm transition-all font-medium" 
                />
              </div>

              {/* Fecha Hasta */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#FFF8F0]">Fecha hasta</label>
                <input 
                  type="date" 
                  value={reportDateTo} 
                  onChange={(e) => setReportDateTo(e.target.value)}
                  className="chocolate-input block w-full rounded-xl px-4 py-3 text-sm transition-all font-medium" 
                />
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-[#3A5F26]/40">
                <button 
                  onClick={closeModal} 
                  disabled={isDownloading}
                  className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-[#FFF8F0] hover:bg-white/10 disabled:opacity-50 transition-all cursor-pointer"
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
              className="relative chocolate-panel rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-7 text-[#FFF8F0]"
            >
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 border border-white/15 transition-all duration-200 cursor-pointer" 
                aria-label="Cerrar"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="mt-1 text-[#FFF8F0]">
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
              className="relative chocolate-panel rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-7 text-[#FFF8F0]"
            >
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 border border-white/15 transition-all duration-200 z-10 cursor-pointer" 
                aria-label="Cerrar"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="space-y-5 mt-1">
                <div className="rounded-xl bg-[#150C07] p-4 border border-[#3A5F26]/50 shadow-inner">
                  <OrderCard 
                    order={selectedOrder} 
                    onStatusChange={(order) => { closeModal(); openStatusModal(order); }} 
                  />
                </div>
                <div className="flex justify-center p-6 rounded-xl bg-[#150C07] border border-[#3A5F26]/50 shadow-inner">
                  <QRDisplay 
                    qrCode={selectedOrder.qr_code} 
                    orderNumber={selectedOrder.order_number} 
                    size="md" 
                    downloadable 
                  />
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
              className="relative chocolate-panel rounded-2xl w-full max-w-md p-7 text-[#FFF8F0]"
            >
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 border border-white/15 transition-all duration-200 cursor-pointer" 
                aria-label="Cerrar"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="space-y-5 mt-1">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-[#FBBF24]">Cambiar Estado</h3>
                  <p className="mt-1 text-sm text-[#D4C4B5]">
                    Actualizando el estado de la Orden <span className="font-bold text-[#FBBF24]">{selectedOrder.order_number}</span>
                  </p>
                </div>

                {serverError && (
                  <div className="rounded-xl bg-red-950/90 border border-red-500/80 p-4 shadow-sm">
                    <p className="text-sm text-red-200 font-semibold">{serverError}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="status" className="block text-sm font-bold text-[#FFF8F0]">Nuevo estado</label>
                  <select 
                    id="status" 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    disabled={statusMutation.isPending}
                    className="premium-select chocolate-input block w-full rounded-xl px-4 py-3 text-sm transition-all cursor-pointer font-medium disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.filter(o => o.value !== "").map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#150C07] text-[#FFF8F0]">{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-5 border-t border-[#3A5F26]/40">
                  <button 
                    onClick={closeModal} 
                    disabled={statusMutation.isPending}
                    className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-[#FFF8F0] hover:bg-white/10 disabled:opacity-50 transition-all cursor-pointer"
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
