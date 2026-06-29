"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderTable } from "@/features/orders/components/OrderTable";
import { OrderCard } from "@/features/orders/components/OrderCard";
import { OrderForm } from "@/features/orders/components/OrderForm";
import { QRDisplay } from "@/features/orders/components/QRDisplay";
import { orderService } from "@/features/orders/services/order.service";
import { useFairs } from "@/features/fairs/hooks/useFairs";
import type {
  Order,
  CreateOrderPayload,
  UpdateOrderStatusPayload,
  OrderStatus,
} from "@/features/orders/types/order.types";
import { motion, AnimatePresence } from "framer-motion";

// ─── ESTADOS DISPONIBLES ──────────────────────────────────

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
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

  const [modalMode, setModalMode] = useState<"create" | "view" | "status" | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [fairIdFilter, setFairIdFilter] = useState<string>("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>("pending");
  const [isDownloading, setIsDownloading] = useState(false); // 👈 Estado para el botón de reporte

  const [searchInput, setSearchInput] = useState("");

  const { data: fairsData } = useFairs({ limit: 100 });
  const fairs = Array.isArray(fairsData) ? fairsData : fairsData?.data ?? [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  // 👈 HANDLER PARA DESCARGAR REPORTE
  const handleDownloadReport = async () => {
    setIsDownloading(true);
    setServerError(null);
    try {
      await orderService.downloadOrdersReport();
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6 text-white"
    >
      <style>{`
        .chocolate-panel {
          background-color: #2D1A10;
          border: 2px solid #3A5F26;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }
        .premium-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FBBF24'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 16px;
          padding-right: 42px;
        }
        .yellow-btn {
          background-color: #FBBF24;
          color: #1E120C;
          font-weight: 700;
          box-shadow: 0 4px 14px rgba(251, 191, 36, 0.4);
          transition: all 0.2s ease-in-out;
        }
        .yellow-btn:hover {
          background-color: #F59E0B;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
        }
        .yellow-btn:active {
          transform: translateY(1px);
        }
        .chocolate-input {
          background-color: #1E120C;
          border: 2px solid #3A5F26;
          color: #FFFFFF;
        }
        .chocolate-input:focus {
          border-color: #FBBF24;
          outline: none;
        }
      `}</style>

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b-2 border-[#3A5F26] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Órdenes
          </h1>
          <p className="mt-2 text-sm text-gray-200 font-medium">
            Supervisa, filtra y gestiona el flujo de órdenes activas y pasadas del sistema.
          </p>
        </div>
        
        {/* 👈 BOTONES: Generar Reporte + Nueva Orden */}
        <div className="flex items-center gap-3">
          {/* Botón Generar Reporte */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadReport}
            disabled={isDownloading}
            className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold cursor-pointer border-2 border-[#3A5F26] bg-[#1E120C] text-[#FBBF24] hover:bg-[#3A5F26] hover:text-white disabled:opacity-50 transition-all duration-200"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {isDownloading ? "Generando..." : "Generar Reporte"}
          </motion.button>

          {/* Botón Nueva Orden */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreateModal}
            className="yellow-btn inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm cursor-pointer"
          >
            <svg className="h-5 w-5 mr-2 stroke-[3px] text-[#1E120C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nueva Orden
          </motion.button>
        </div>
      </div>

      {/* Panel de Filtros */}
      <div className="chocolate-panel p-5 rounded-2xl flex flex-col lg:flex-row gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#FBBF24]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input 
              type="text" 
              value={searchInput} 
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por número de orden..."
              className="chocolate-input block w-full rounded-xl pl-12 pr-4 py-3 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#FBBF24] transition-all" 
            />
          </div>
        </form>

        <div className="flex flex-col sm:flex-row gap-3">
          <select 
            value={fairIdFilter} 
            onChange={(e) => setFairIdFilter(e.target.value)}
            className="premium-select chocolate-input rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#FBBF24] transition-all cursor-pointer sm:w-56"
          >
            <option value="" className="bg-[#1E120C] text-white">Todas las ferias</option>
            {fairs.map((fair: { id: string; name: string }) => (
              <option key={fair.id} value={fair.id} className="bg-[#1E120C] text-white">{fair.name}</option>
            ))}
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="premium-select chocolate-input rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#FBBF24] transition-all cursor-pointer sm:w-48"
          >
            <option value="" className="bg-[#1E120C] text-white">Todos los estados</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#1E120C] text-white">{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Contenedor de la Tabla */}
      <div className="chocolate-panel rounded-2xl overflow-hidden">
        <OrderTable
          search={search}
          statusFilter={statusFilter}
          fairIdFilter={fairIdFilter}
          onView={openViewModal}
          onStatusChange={openStatusModal}
        />
      </div>

      {/* Modales */}
      <AnimatePresence>
        {modalMode === "create" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80" 
              onClick={closeModal} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative chocolate-panel rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-8 text-white"
            >
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-lg text-white hover:bg-white/10 border-2 border-white/20 transition-all duration-200" 
                aria-label="Cerrar"
              >
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="mt-2 text-white">
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
              className="absolute inset-0 bg-black/80" 
              onClick={closeModal} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative chocolate-panel rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 text-white"
            >
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-lg text-white hover:bg-white/10 border-2 border-white/20 transition-all duration-200 z-10" 
                aria-label="Cerrar"
              >
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="space-y-6 mt-2">
                <div className="rounded-xl bg-[#1E120C] p-4 border-2 border-[#3A5F26]">
                  <OrderCard 
                    order={selectedOrder} 
                    onStatusChange={(order) => { closeModal(); openStatusModal(order); }} 
                  />
                </div>
                <div className="flex justify-center p-6 rounded-xl bg-[#1E120C] border-2 border-[#3A5F26]">
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
              className="absolute inset-0 bg-black/80" 
              onClick={closeModal} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative chocolate-panel rounded-2xl w-full max-w-md p-8 text-white"
            >
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-lg text-white hover:bg-white/10 border-2 border-white/20 transition-all duration-200" 
                aria-label="Cerrar"
              >
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="space-y-6 mt-2">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-[#FBBF24]">Cambiar Estado</h3>
                  <p className="mt-1.5 text-sm text-white">
                    Actualizando el estado de la Orden <span className="font-bold text-[#FBBF24]">{selectedOrder.order_number}</span>
                  </p>
                </div>

                {serverError && (
                  <div className="rounded-xl bg-red-950/80 border-2 border-red-600 p-4">
                    <p className="text-sm text-red-200 font-bold">{serverError}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="status" className="block text-sm font-bold text-white">Nuevo estado</label>
                  <select 
                    id="status" 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    disabled={statusMutation.isPending}
                    className="premium-select chocolate-input block w-full rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#FBBF24] disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#1E120C] text-white">{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t-2 border-[#3A5F26]">
                  <button 
                    onClick={closeModal} 
                    disabled={statusMutation.isPending}
                    className="rounded-xl border-2 border-white/30 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50 transition-all cursor-pointer"
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