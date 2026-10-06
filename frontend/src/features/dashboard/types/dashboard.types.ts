// src/features/dashboard/types/dashboard.types.ts

// ─── METRICAS PRINCIPALES ──────────────────────────────────

/** Métricas agregadas del dashboard (datos reales del backend) */
export interface DashboardTotals {
  total_revenue: number;
  month_revenue: number;
  day_revenue: number;

  prev_month_revenue: number;
  prev_day_revenue: number;

  total_clients: number;
  total_orders: number;
  total_payments: number;
  total_products: number;
  total_fairs: number;
  active_fairs: number;
  completed_orders: number;
  pending_orders: number;
  low_stock_products: number;
}

// ─── PUNTO DE INGRESO MENSUAL ──────────────────────────────

/** Ingresos agregados por mes */
export interface MonthlyRevenuePoint {
  period: string; // "2026-01"
  label: string;  // "Ene"
  amount: number;
  orders_count: number;
}

// ─── DATOS COMPLETOS DEL DASHBOARD ─────────────────────────

/** Respuesta del endpoint GET /api/v1/dashboard/stats */
export interface DashboardStats {
  totals: DashboardTotals;
  revenue_series: MonthlyRevenuePoint[];
  orders_by_status: Record<string, number>;
  payments_by_method: Record<string, number>;
}

// ─── TIPOS DERIVADOS PARA LA UI ────────────────────────────

export type RevenuePeriod = "month" | "6m" | "12m" | "year";
