// src/features/dashboard/hooks/useDashboardStats.ts

import { useQueries } from "@tanstack/react-query";
import { userService } from "@/features/users/services/user.service";
import { fairService } from "@/features/fairs/services/fair.service";
import { productService } from "@/features/products/services/product.service";
import { inventoryService } from "@/features/inventory/services/inventory.service";
import { orderService } from "@/features/orders/services/order.service";
import { paymentService } from "@/features/payments/services/payment.service";
import type { DashboardStats } from "@/features/dashboard/types/dashboard.types";
import type { RecentOrder } from "@/features/dashboard/types/dashboard.types";

// ─── CONSTANTES ────────────────────────────────────────────

const STALE_TIME = 2 * 60 * 1000;

// ─── HOOK ──────────────────────────────────────────────────

export function useDashboardStats() {
  const results = useQueries({
    queries: [
      {
        queryKey: ["users", { limit: 1 }],
        queryFn: () => userService.getUsers({ limit: 1 }),
        staleTime: STALE_TIME,
      },
      {
        queryKey: ["fairs", { limit: 1 }],
        queryFn: () => fairService.getFairs({ limit: 1 }),
        staleTime: STALE_TIME,
      },
      {
        queryKey: ["products", { limit: 1 }],
        queryFn: () => productService.getProducts({ limit: 1 }),
        staleTime: STALE_TIME,
      },
      {
        queryKey: ["inventory", { low_stock: true, limit: 5 }],
        queryFn: () => inventoryService.getInventory({ low_stock: true, limit: 5 }),
        staleTime: STALE_TIME,
      },
      {
        queryKey: ["orders", { limit: 1 }],
        queryFn: () => orderService.getOrders({ limit: 1 }),
        staleTime: STALE_TIME,
      },
      {
        queryKey: ["orders", "recent", { limit: 10 }],
        queryFn: () => orderService.getOrders({ limit: 10 }),
        staleTime: STALE_TIME,
      },
      {
        queryKey: ["payments", { limit: 1 }],
        queryFn: () => paymentService.getPayments({ limit: 1 }),
        staleTime: STALE_TIME,
      },
    ],
  });

  const [usersQ, fairsQ, productsQ, inventoryQ, ordersQ, recentQ, paymentsQ] = results;

  const isLoading = results.some((q) => q.isLoading);
  const isError = results.some((q) => q.isError);
  const errors = results
    .filter((q) => q.error)
    .map((q) => (q.error as { message?: string })?.message || "Error");

  // Calcular stats desde los datos reales
  const stats: DashboardStats = {
    total_users: usersQ.data?.total ?? 0,
    total_fairs: fairsQ.data?.total ?? 0,
    total_products: productsQ.data?.total ?? 0,
    total_orders: ordersQ.data?.total ?? 0,
    total_revenue: 0, // No podemos calcular sin sumar payments
    active_fairs: 0,  // Requiere filtrar por status
    pending_orders: 0, // Requiere filtrar por status
    low_stock_products: inventoryQ.data?.total ?? 0,
  };

  // Órdenes recientes
  const recentOrders: RecentOrder[] = (recentQ.data?.data ?? []).map((order) => ({
    id: order.id,
    order_number: order.order_number,
    customer_name: order.user_id, // Usamos user_id como fallback
    total_amount: order.total_amount,
    status: order.status,
    created_at: order.created_at ?? "",
  }));

  return {
    stats,
    recentOrders,
    isLoading,
    isError,
    errors,
    refetch: () => results.forEach((q) => q.refetch()),
  };
}

export default useDashboardStats;