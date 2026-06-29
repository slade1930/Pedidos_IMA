// src/features/dashboard/types/dashboard.types.ts

// ─── ESTADÍSTICAS GENERALES ───────────────────────────────

/** Estadísticas generales del dashboard */
export interface DashboardStats {
  total_users: number;
  total_fairs: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  active_fairs: number;
  pending_orders: number;
  low_stock_products: number;
}

// ─── INGRESOS ─────────────────────────────────────────────

/** Punto de datos de ingresos (para gráficos) */
export interface RevenueDataPoint {
  date: string;
  amount: number;
  orders_count: number;
}

/** Respuesta de ingresos */
export interface RevenueStats {
  total_revenue: number;
  period: string;
  data: RevenueDataPoint[];
}

// ─── ESTADÍSTICAS DE ÓRDENES ──────────────────────────────

/** Punto de datos de órdenes (para gráficos) */
export interface OrderDataPoint {
  date: string;
  count: number;
  status: string;
}

/** Respuesta de estadísticas de órdenes */
export interface OrderStats {
  total_orders: number;
  by_status: Record<string, number>;
  data: OrderDataPoint[];
}

// ─── ESTADÍSTICAS DE INVENTARIO ───────────────────────────

/** Producto con stock bajo */
export interface LowStockProduct {
  product_id: string;
  product_name: string;
  stock: number;
  min_stock: number;
}

/** Respuesta de estadísticas de inventario */
export interface InventoryStats {
  total_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
  low_stock_products: LowStockProduct[];
}

// ─── ÓRDENES RECIENTES ────────────────────────────────────

/** Orden reciente (versión resumida para dashboard) */
export interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

/** Respuesta de órdenes recientes */
export interface RecentOrdersResponse {
  orders: RecentOrder[];
}