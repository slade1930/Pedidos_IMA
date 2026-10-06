# app/services/dashboard_service.py
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import select, func, extract
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.payment_model import Payment
from app.models.order_model import Order
from app.models.user_model import User
from app.models.product_model import Product
from app.models.inventory_model import Inventory
from app.models.fair_model import Fair
from app.core.constants import PaymentStatus, OrderStatus, FairStatus, UserRole

from app.schemas.dashboard_schema import (
    DashboardStatsSchema,
    DashboardTotalsSchema,
    MonthlyRevenuePoint,
)


# ─── UTILITARIOS ───────────────────────────────────────────

MONTH_LABELS = {
    1: "Ene", 2: "Feb", 3: "Mar", 4: "Abr",
    5: "May", 6: "Jun", 7: "Jul", 8: "Ago",
    9: "Sep", 10: "Oct", 11: "Nov", 12: "Dic",
}


def _to_float(value) -> float:
    if value is None:
        return 0.0
    if isinstance(value, Decimal):
        return float(value)
    return float(value)


class DashboardService:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def _revenue_for_range(self, start: datetime, end: datetime) -> float:
        """Suma de órdenes con payment_status=COMPLETED dentro de un rango [start, end)."""
        result = await self.db.execute(
            select(func.coalesce(func.sum(Order.total_amount), 0)).where(
                Order.payment_status == PaymentStatus.COMPLETED,
                Order.is_active.is_(True),
                Order.created_at >= start,
                Order.created_at < end,
            )
        )
        return _to_float(result.scalar())

    async def _count_orders_in_range(self, start: datetime, end: datetime) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Order).where(
                Order.payment_status == PaymentStatus.COMPLETED,
                Order.is_active.is_(True),
                Order.created_at >= start,
                Order.created_at < end,
            )
        )
        return result.scalar() or 0

    async def get_stats(self, months: int = 12) -> DashboardStatsSchema:
        now = datetime.now(timezone.utc)

        # ── Ingresos (pagos COMPLETADOS) ──────────────────
        total_revenue = await self._revenue_for_range(
            datetime(2000, 1, 1, tzinfo=timezone.utc), now
        )

        # Este mes / día actual
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        next_month = (
            month_start.replace(month=month_start.month % 12 + 1)
            if month_start.month < 12
            else month_start.replace(year=month_start.year + 1, month=1)
        )
        day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        next_day = now.replace(hour=23, minute=59, second=59, microsecond=999999)
        next_day = day_start + (next_day - day_start)

        month_revenue = await self._revenue_for_range(month_start, next_month)
        day_revenue = await self._revenue_for_range(day_start, next_day)

        # Mes anterior (para comparación)
        prev_month_end = month_start
        prev_month_start = (
            prev_month_end.replace(month=prev_month_end.month - 1)
            if prev_month_end.month > 1
            else prev_month_end.replace(year=prev_month_end.year - 1, month=12)
        )
        prev_month_revenue = await self._revenue_for_range(
            prev_month_start, prev_month_end
        )

        # Día anterior (para comparación)
        prev_day_start = day_start - (next_day - day_start)
        prev_day_revenue = await self._revenue_for_range(prev_day_start, day_start)

        # ── Conteos ────────────────────────────────────────
        total_clients = (
            await self.db.execute(
                select(func.count())
                .select_from(User)
                .where(User.is_active.is_(True), User.role == UserRole.CLIENT)
            )
        ).scalar() or 0

        total_orders = (
            await self.db.execute(
                select(func.count())
                .select_from(Order)
                .where(Order.is_active.is_(True))
            )
        ).scalar() or 0

        completed_orders = (
            await self.db.execute(
                select(func.count())
                .select_from(Order)
                .where(
                    Order.is_active.is_(True),
                    Order.status == OrderStatus.DELIVERED,
                )
            )
        ).scalar() or 0

        pending_orders = (
            await self.db.execute(
                select(func.count())
                .select_from(Order)
                .where(
                    Order.is_active.is_(True),
                    Order.status.in_(
                        [OrderStatus.PENDING, OrderStatus.CONFIRMED]
                    ),
                )
            )
        ).scalar() or 0

        total_products = (
            await self.db.execute(
                select(func.count())
                .select_from(Product)
                .where(Product.is_active.is_(True))
            )
        ).scalar() or 0

        total_fairs = (
            await self.db.execute(
                select(func.count())
                .select_from(Fair)
                .where(Fair.is_active.is_(True))
            )
        ).scalar() or 0

        active_fairs = (
            await self.db.execute(
                select(func.count())
                .select_from(Fair)
                .where(
                    Fair.is_active.is_(True),
                    Fair.status == FairStatus.ACTIVE,
                )
            )
        ).scalar() or 0

        low_stock_products = (
            await self.db.execute(
                select(func.count())
                .select_from(Inventory)
                .where(
                    Inventory.is_active.is_(True),
                    (Inventory.total_stock - Inventory.reserved_stock - Inventory.delivered_stock)
                    <= Inventory.low_stock_threshold,
                )
            )
        ).scalar() or 0

        totals = DashboardTotalsSchema(
            total_revenue=total_revenue,
            month_revenue=month_revenue,
            day_revenue=day_revenue,
            prev_month_revenue=prev_month_revenue,
            prev_day_revenue=prev_day_revenue,
            total_clients=total_clients,
            total_orders=total_orders,
            total_payments=await self._count_orders_in_range(
                datetime(2000, 1, 1, tzinfo=timezone.utc), now
            ),
            total_products=total_products,
            total_fairs=total_fairs,
            active_fairs=active_fairs,
            completed_orders=completed_orders,
            pending_orders=pending_orders,
            low_stock_products=low_stock_products,
        )

        # ── Serie de ingresos por mes (últimos N meses) ────
        revenue_series = await self._build_monthly_series(months)

        # ── Distribuciones ─────────────────────────────────
        orders_by_status = await self._orders_by_status()
        payments_by_method = await self._payments_by_method()

        return DashboardStatsSchema(
            totals=totals,
            revenue_series=revenue_series,
            orders_by_status=orders_by_status,
            payments_by_method=payments_by_method,
        )

    async def _build_monthly_series(self, months: int) -> list[MonthlyRevenuePoint]:
        """Agrega ingresos por mes calendario para los últimos `months` meses."""
        now = datetime.now(timezone.utc)

        # Punto de partida: primer día del mes hace `months-1` meses
        year, month = now.year, now.month
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        for _ in range(months - 1):
            if month == 1:
                year, month = year - 1, 12
            else:
                month -= 1
            start = start.replace(year=year, month=month)

        # Consulta: agrupar órdenes con payment_status=COMPLETED por año/mes
        result = await self.db.execute(
            select(
                extract("year", Order.created_at).label("y"),
                extract("month", Order.created_at).label("m"),
                func.coalesce(func.sum(Order.total_amount), 0).label("total"),
                func.count().label("cnt"),
            )
            .where(
                Order.payment_status == PaymentStatus.COMPLETED,
                Order.is_active.is_(True),
                Order.created_at >= start,
            )
            .group_by("y", "m")
            .order_by("y", "m")
        )
        rows = result.all()

        # Mapa mes -> datos
        bucket: dict[tuple[int, int], dict] = {}
        for y, m, total, cnt in rows:
            bucket[(int(y), int(m))] = {
                "amount": _to_float(total),
                "orders_count": int(cnt),
            }

        # Construir serie completa (incluye meses vacíos)
        series: list[MonthlyRevenuePoint] = []
        y, m = start.year, start.month
        for _ in range(months):
            data = bucket.get((y, m), {"amount": 0.0, "orders_count": 0})
            series.append(
                MonthlyRevenuePoint(
                    period=f"{y}-{m:02d}",
                    label=MONTH_LABELS[m],
                    amount=data["amount"],
                    orders_count=data["orders_count"],
                )
            )
            if m == 12:
                y, m = y + 1, 1
            else:
                m += 1

        return series

    async def _orders_by_status(self) -> dict[str, int]:
        result = await self.db.execute(
            select(Order.status, func.count())
            .where(Order.is_active.is_(True))
            .group_by(Order.status)
        )
        return {str(status.value): count for status, count in result.all()}

    async def _payments_by_method(self) -> dict[str, int]:
        result = await self.db.execute(
            select(Payment.method, func.count())
            .where(Payment.is_active.is_(True))
            .group_by(Payment.method)
        )
        return {str(method.value): count for method, count in result.all()}
