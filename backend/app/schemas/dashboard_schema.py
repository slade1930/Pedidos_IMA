# app/schemas/dashboard_schema.py
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


# ─── METRICAS PRINCIPALES ──────────────────────────────────

class DashboardTotalsSchema(BaseModel):
    """Resumen de métricas del dashboard."""

    total_revenue: float = Field(default=0.0)
    month_revenue: float = Field(default=0.0)
    day_revenue: float = Field(default=0.0)

    prev_month_revenue: float = Field(default=0.0)
    prev_day_revenue: float = Field(default=0.0)

    total_clients: int = Field(default=0)
    total_orders: int = Field(default=0)
    total_payments: int = Field(default=0)
    total_products: int = Field(default=0)
    total_fairs: int = Field(default=0)
    active_fairs: int = Field(default=0)
    completed_orders: int = Field(default=0)
    pending_orders: int = Field(default=0)
    low_stock_products: int = Field(default=0)


# ─── PUNTO DE INGRESO MENSUAL ──────────────────────────────

class MonthlyRevenuePoint(BaseModel):
    """Ingresos agregados por mes (para gráficas)."""

    period: str  # "2026-01"
    label: str   # "Ene", "Feb", ...
    amount: float
    orders_count: int


# ─── RESPONSE DEL DASHBOARD ────────────────────────────────

class DashboardStatsSchema(BaseModel):
    """Datos completos del dashboard."""

    totals: DashboardTotalsSchema

    # Evolución de ingresos (series mensuales)
    revenue_series: list[MonthlyRevenuePoint] = Field(default_factory=list)

    # Distribución de órdenes por estado
    orders_by_status: dict[str, int] = Field(default_factory=dict)

    # Distribución de pagos por método
    payments_by_method: dict[str, int] = Field(default_factory=dict)
