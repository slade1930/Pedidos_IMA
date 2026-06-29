"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PaymentCard } from "@/features/payments/components/PaymentCard";
import { PaymentMethodSelector } from "@/features/payments/components/PaymentMethodSelector";
import { paymentService } from "@/features/payments/services/payment.service";
import { usePayments } from "@/features/payments/hooks/usePayments";
import { useOrders } from "@/features/orders/hooks/useOrders";
import type { CreatePaymentPayload, PaymentMethod, PaymentStatus } from "@/features/payments/types/payment.types";
import { motion, AnimatePresence } from "framer-motion";

// ─── SCHEMA ────────────────────────────────────────────────

const createPaymentSchema = z.object({
  order_id: z.string().min(1, "Selecciona una orden"),
  amount: z.number({ message: "Ingresa un monto válido" }).min(0.01, "El monto debe ser mayor a 0"),
  method: z.enum(["yappy", "card", "cash"], { message: "Selecciona un método de pago" }),
  transaction_id: z.string().optional().or(z.literal("")),
  reference_code: z.string().optional().or(z.literal("")),
});

type CreatePaymentFormValues = z.infer<typeof createPaymentSchema>;

// ─── CONSTANTES ────────────────────────────────────────────

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Todos los estados" },
  { value: "completed", label: "Completado" },
  { value: "pending", label: "Pendiente" },
  { value: "processing", label: "Procesando" },
  { value: "failed", label: "Fallido" },
  { value: "refunded", label: "Reembolsado" },
];

// ─── COMPONENTE ────────────────────────────────────────────

export default function PaymentsPage() {
  const queryClient = useQueryClient();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [skip, setSkip] = useState(0);
  const page = Math.floor(skip / PAGE_SIZE) + 1;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setSkip(0);
  };

  // ─── QUERY ──────────────────────────────────────────
  const filters = {
    skip,
    limit: PAGE_SIZE,
    ...(search && { search }),
    ...(statusFilter && statusFilter !== "" && { status: statusFilter as PaymentStatus }),
  };

  const { data, isPending, isError, error, isFetching } = usePayments(filters);
  const payments = Array.isArray(data) ? data : data?.data ?? [];
  const totalPages = !Array.isArray(data) ? data?.pages ?? 1 : 1;
  const totalItems = !Array.isArray(data) ? data?.total ?? payments.length : payments.length;

  // Órdenes para el selector
  const { data: ordersData } = useOrders({ limit: 100 });
  const orders = Array.isArray(ordersData) ? ordersData : ordersData?.data ?? [];

  // ─── FORMULARIO CREAR ───────────────────────────────
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors: formErrors },
  } = useForm<CreatePaymentFormValues>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      order_id: "",
      amount: 0,
      method: "cash",
      transaction_id: "",
      reference_code: "",
    },
  });

  const selectedMethod = watch("method");
  const selectedOrderId = watch("order_id");

  // Auto-completar monto cuando se selecciona una orden
  const handleOrderChange = (orderId: string) => {
    setValue("order_id", orderId, { shouldValidate: true });
    const order = orders.find((o: { id: string; total_amount: number }) => o.id === orderId);
    if (order) {
      setValue("amount", order.total_amount, { shouldValidate: true });
    }
  };

  // ─── MUTACIÓN: CREAR ────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: CreatePaymentPayload) => paymentService.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      closeModal();
    },
    onError: (err: { message: string }) => {
      setServerError(err.message || "Error al registrar pago");
    },
  });

  // ─── HANDLERS ───────────────────────────────────────
  const openCreateModal = useCallback(() => {
    reset();
    setServerError(null);
    setShowCreateModal(true);
  }, [reset]);

  const closeModal = useCallback(() => {
    setShowCreateModal(false);
    setServerError(null);
  }, []);

  const handleCreateSubmit = useCallback(
    (data: CreatePaymentFormValues) => {
      setServerError(null);
      createMutation.mutate(data as CreatePaymentPayload);
    },
    [createMutation]
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6 text-white"
    >
      {/* Estilos CSS personalizados de la paleta Chocolate, Verde, Amarillo y Blanco */}
      <style>{`
        .chocolate-panel {
          background-color: #2D1A10; /* Chocolate oscuro */
          border: 2px solid #3A5F26; /* Verde */
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
          background-color: #FBBF24; /* Amarillo */
          color: #1E120C; /* Chocolate oscuro */
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
            Pagos
          </h1>
          <p className="mt-2 text-sm text-gray-200 font-medium">
            Supervisa, registra y gestiona las transacciones de pago del sistema.
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreateModal}
          className="yellow-btn inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm cursor-pointer"
        >
          <svg className="h-5 w-5 mr-2 stroke-[3px] text-[#1E120C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Registrar Pago
        </motion.button>
      </div>

      {/* Filtros */}
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
              placeholder="Buscar por orden o referencia..."
              className="chocolate-input block w-full rounded-xl pl-12 pr-4 py-3 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#FBBF24] transition-all" 
            />
          </div>
        </form>
        <select 
          value={statusFilter} 
          onChange={(e) => { setStatusFilter(e.target.value); setSkip(0); }}
          className="premium-select chocolate-input rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#FBBF24] transition-all cursor-pointer sm:w-56"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#1E120C] text-white">{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Lista de Pagos */}
      <div className="space-y-4">
        {isPending && (
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-[#2D1A10]/50 border-2 border-[#3A5F26]/30 rounded-xl" />
            ))}
          </div>
        )}

        {isError && !isPending && (
          <div className="rounded-2xl border-2 border-red-600 bg-red-950/80 p-8 text-center shadow-lg">
            <p className="text-red-200 font-bold text-lg">Error al cargar pagos</p>
            <p className="text-sm text-red-300 mt-2 font-medium">
              {(error as { message?: string })?.message || "Intenta nuevamente"}
            </p>
          </div>
        )}

        {!isPending && !isError && payments.length === 0 && (
          <div className="rounded-2xl border-2 border-[#3A5F26] bg-[#2D1A10] p-12 text-center shadow-lg">
            <p className="text-white font-bold text-lg">No se encontraron pagos registrados</p>
          </div>
        )}

        {!isPending && !isError && payments.map((payment) => (
          <PaymentCard key={payment.id} payment={payment} compact />
        ))}
      </div>

      {/* Paginación */}
      {!isPending && !isError && payments.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-[#3A5F26]/30">
          <p className="text-sm text-white font-bold">
            Mostrando{" "}
            <span className="text-[#FBBF24]">{skip + 1}</span>
            {" "}-{" "}
            <span className="text-[#FBBF24]">{Math.min(skip + PAGE_SIZE, totalItems)}</span>
            {" "}de{" "}
            <span className="text-[#FBBF24]">{totalItems}</span> pagos
          </p>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSkip((p) => Math.max(0, p - PAGE_SIZE))}
              disabled={skip <= 0 || isFetching}
              className="rounded-xl border-2 border-[#3A5F26] bg-[#2D1A10] px-4 py-2 text-sm font-bold text-[#FBBF24] hover:bg-[#1E120C] hover:border-[#FBBF24] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Anterior
            </button>
            <span className="text-sm text-white font-bold px-2">Página {page} de {totalPages}</span>
            <button 
              onClick={() => setSkip((p) => Math.min((totalPages - 1) * PAGE_SIZE, p + PAGE_SIZE))}
              disabled={skip >= (totalPages - 1) * PAGE_SIZE || isFetching}
              className="rounded-xl border-2 border-[#3A5F26] bg-[#2D1A10] px-4 py-2 text-sm font-bold text-[#FBBF24] hover:bg-[#1E120C] hover:border-[#FBBF24] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal Registrar Pago */}
      <AnimatePresence>
        {showCreateModal && (
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
              className="relative chocolate-panel rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-8 text-white"
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

              <form onSubmit={handleSubmit(handleCreateSubmit)} className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-[#FBBF24]">Registrar Pago</h3>
                  <p className="mt-1.5 text-sm text-white">Registra un nuevo pago para una orden activa</p>
                </div>

                {serverError && (
                  <div className="rounded-xl bg-red-950/80 border-2 border-red-600 p-4">
                    <p className="text-sm text-red-200 font-bold">{serverError}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="order_id" className="block text-sm font-bold text-white">Orden</label>
                  <select 
                    id="order_id" 
                    disabled={createMutation.isPending}
                    className={`premium-select chocolate-input block w-full rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#FBBF24] disabled:opacity-50 transition-all cursor-pointer ${formErrors.order_id ? "border-red-500" : ""}`}
                    value={selectedOrderId}
                    onChange={(e) => handleOrderChange(e.target.value)}
                  >
                    <option value="" className="bg-[#1E120C] text-white">Selecciona una orden</option>
                    {orders.map((order: { id: string; order_number: string; total_amount: number }) => (
                      <option key={order.id} value={order.id} className="bg-[#1E120C] text-white">
                        Orden {order.order_number} - {new Intl.NumberFormat("es-PA", { style: "currency", currency: "USD" }).format(order.total_amount)}
                      </option>
                    ))}
                  </select>
                  {formErrors.order_id && <p className="text-sm text-red-400 font-bold">{formErrors.order_id.message}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="amount" className="block text-sm font-bold text-white">Monto</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-[#FBBF24]">$</span>
                    <input 
                      id="amount" 
                      type="number" 
                      step="0.01" 
                      min="0.01" 
                      disabled={createMutation.isPending}
                      className={`chocolate-input block w-full rounded-xl pl-9 pr-4 py-3 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#FBBF24] disabled:opacity-50 transition-all ${formErrors.amount ? "border-red-500" : ""}`}
                      placeholder="0.00"
                      {...register("amount", { valueAsNumber: true })} 
                    />
                  </div>
                  {formErrors.amount && <p className="text-sm text-red-400 font-bold">{formErrors.amount.message}</p>}
                </div>

                <PaymentMethodSelector 
                  value={selectedMethod}
                  onChange={(method: PaymentMethod) => setValue("method", method, { shouldValidate: true })}
                  disabled={createMutation.isPending}
                  error={formErrors.method?.message} 
                />

                <div className="space-y-2">
                  <label htmlFor="reference_code" className="block text-sm font-bold text-white">
                    Referencia <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input 
                    id="reference_code" 
                    type="text" 
                    disabled={createMutation.isPending}
                    className="chocolate-input block w-full rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#FBBF24] disabled:opacity-50 transition-all"
                    placeholder="Número de referencia o comprobante"
                    {...register("reference_code")} 
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="transaction_id" className="block text-sm font-bold text-white">
                    ID de Transacción <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input 
                    id="transaction_id" 
                    type="text" 
                    disabled={createMutation.isPending}
                    className="chocolate-input block w-full rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#FBBF24] disabled:opacity-50 transition-all"
                    placeholder="ID de la transacción"
                    {...register("transaction_id")} 
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t-2 border-[#3A5F26]/30">
                  <button 
                    type="button" 
                    onClick={closeModal} 
                    disabled={createMutation.isPending}
                    className="rounded-xl border-2 border-white/30 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={createMutation.isPending}
                    className="yellow-btn rounded-xl px-5 py-2.5 text-sm disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {createMutation.isPending ? "Registrando..." : "Registrar Pago"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}