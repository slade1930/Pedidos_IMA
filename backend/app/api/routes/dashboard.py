# app/api/routes/dashboard.py
from fastapi import APIRouter, Depends, Query

from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth_dependencies import get_current_staff
from app.core.database import get_db
from app.models.user_model import User
from app.schemas.response_schema import ResponseSchema
from app.schemas.dashboard_schema import DashboardStatsSchema
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=ResponseSchema[DashboardStatsSchema])
async def get_dashboard_stats(
    months: int = Query(12, ge=3, le=24, description="Meses de evolución de ingresos"),
    _: User = Depends(get_current_staff),
    db: AsyncSession = Depends(get_db),
):
    """Métricas reales del dashboard: ingresos, clientes, órdenes y evolución mensual."""
    service = DashboardService(db)
    stats = await service.get_stats(months=months)
    return ResponseSchema(
        message="Estadísticas del dashboard obtenidas",
        data=stats,
    )
