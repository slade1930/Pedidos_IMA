// src/app/(dashboard)/orders/[id]/page.tsx

"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useOrder } from "@/features/orders/hooks/useOrder";
import { OrderCard } from "@/features/orders/components/OrderCard";
import { QRDisplay } from "@/features/orders/components/QRDisplay";
import { orderService } from "@/features/orders/services/order.service";
import type { OrderStatus, UpdateOrderStatusPayload } from "@/features/orders/types/order.types";

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

/**
 * Página de Detalle de Orden
 * 
 * Ruta: /dashboard/orders/:id
 * Layout: (dashboard) → ProtectedLayout
 */
export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const orderId = params.id as string;

  const { data: order, isPending, isError } = useOrder(orderId);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>("pending");
  const [serverError, setServerError] = useState<string | null>(null);

  // ─── MUTACIÓN: CAMBIAR ESTADO ───────────────────────
  const statusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusPayload }) =>
      orderService.updateOrderStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setShowStatusModal(false);
    },
    onError: (error: { message: string }) => {
      setServerError(error.message || "Error al cambiar estado");
    },
  });

  // ─── HANDLERS ───────────────────────────────────────
  const handleStatusChange = () => {
    if (order) {
      setNewStatus(order.status);
      setServerError(null);
      setShowStatusModal(true);
    }
  };

  const handleStatusSubmit = () => {
    statusMutation.mutate({
      id: orderId,
      data: { status: newStatus },
    });
  };

  // ─── LOADING ────────────────────────────────────────
  if (isPending) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  // ─── ERROR ──────────────────────────────────────────
  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Orden no encontrada</h2>
        <p className="mt-2 text-sm text-gray-500">La orden que buscas no existe o fue eliminada.</p>
        <button onClick={() => router.push("/dashboard/orders")}
          className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors">
          Volver a Órdenes
        </button>
      </div>
    );
  }

  // ─── RENDER ─────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/dashboard/orders")}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Órdenes
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium truncate">{order.order_number}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OrderCard order={order} onStatusChange={handleStatusChange} />
        </div>

        <div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Código QR</h3>
            <QRDisplay qrCode={order.qr_code} orderNumber={order.order_number} size="lg" downloadable />
          </div>
        </div>
      </div>

      {/* Modal Cambiar Estado */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-600/50" onClick={() => setShowStatusModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <button onClick={() => setShowStatusModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Cerrar">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cambiar Estado</h3>
                <p className="mt-1 text-sm text-gray-500">Orden {order.order_number}</p>
              </div>

              {serverError && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-700">{serverError}</p>
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Nuevo estado</label>
                <select id="status" value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  disabled={statusMutation.isPending}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50">
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowStatusModal(false)} disabled={statusMutation.isPending}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleStatusSubmit} disabled={statusMutation.isPending}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors">
                  {statusMutation.isPending ? "Cambiando..." : "Cambiar Estado"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}