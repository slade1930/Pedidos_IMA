# app/api/routes/orders.py
from fastapi import APIRouter, Depends, Response, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.services.order_service import OrderService
from app.services.invoice_service import InvoiceService
from app.services.report_service import ReportService
from app.schemas.order_schema import (
    OrderCreateSchema,
    OrderStatusUpdateSchema,
    OrderResponseSchema,
)
from app.schemas.response_schema import ResponseSchema, PaginatedResponseSchema
from app.api.dependencies.auth_dependencies import (
    get_current_user,
    get_current_staff,
)
from app.models.user_model import User
import uuid

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("/", response_model=PaginatedResponseSchema[OrderResponseSchema])
async def get_all_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: str = Query(None),           # 👈 NUEVO
    fair_id: uuid.UUID = Query(None),    # 👈 NUEVO
    status: str = Query(None),           # 👈 NUEVO
    date_from: str = Query(None),        # 👈 NUEVO
    date_to: str = Query(None),          # 👈 NUEVO
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_staff),
):
    service = OrderService(db)
    orders = await service.get_all(
        skip=skip, limit=limit,
        search=search, fair_id=fair_id, status=status,
        date_from=date_from, date_to=date_to,
    )
    total = await service.get_total_count(
        search=search, fair_id=fair_id, status=status,
        date_from=date_from, date_to=date_to,
    )
    return PaginatedResponseSchema(
        data=[OrderResponseSchema.model_validate(o) for o in orders],
        total=total,
        page=(skip // limit) + 1 if limit > 0 else 1,
        limit=limit,
        pages=((total + limit - 1) // limit) if total > 0 else 0,
    )


@router.post("/", response_model=ResponseSchema[OrderResponseSchema])
async def create_order(
    data: OrderCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = OrderService(db)
    order = await service.create(current_user.id, data)
    return ResponseSchema(
        message="Pedido creado exitosamente",
        data=OrderResponseSchema.model_validate(order),
    )


# ─── ENDPOINT DE REPORTE CON FILTROS ───────────────────────

@router.get("/report")
async def download_orders_report(
    fair_id: uuid.UUID = Query(None),    # 👈 NUEVO
    date_from: str = Query(None),        # 👈 NUEVO
    date_to: str = Query(None),          # 👈 NUEVO
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_staff),
):
    """Genera y descarga un reporte PDF con filtros opcionales"""
    service = OrderService(db)
    
    orders = await service.get_all_for_report(
        fair_id=fair_id, date_from=date_from, date_to=date_to
    )
    
    pdf = ReportService.generate_orders_report(orders)
    
    # Nombre de archivo con fecha
    from datetime import datetime
    today = datetime.now().strftime("%Y-%m-%d")
    
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=reporte-ordenes-{today}.pdf"
        },
    )


@router.get("/my-orders", response_model=ResponseSchema[list[OrderResponseSchema]])
async def get_my_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = OrderService(db)
    orders = await service.get_by_user(current_user.id)
    return ResponseSchema(data=[OrderResponseSchema.model_validate(o) for o in orders])


@router.get("/fair/{fair_id}", response_model=ResponseSchema[list[OrderResponseSchema]])
async def get_orders_by_fair(
    fair_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_staff),
):
    service = OrderService(db)
    orders = await service.get_by_fair(fair_id)
    return ResponseSchema(data=[OrderResponseSchema.model_validate(o) for o in orders])


@router.get("/{order_id}", response_model=ResponseSchema[OrderResponseSchema])
async def get_order(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Obtener un pedido individual por ID"""
    service = OrderService(db)
    order = await service.get_by_id(order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado",
        )
    return ResponseSchema(data=OrderResponseSchema.model_validate(order))


@router.put("/{order_id}/status", response_model=ResponseSchema[OrderResponseSchema])
async def update_order_status(
    order_id: uuid.UUID,
    data: OrderStatusUpdateSchema,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_staff),
):
    service = OrderService(db)
    order = await service.update_status(order_id, data)
    return ResponseSchema(
        message="Estado actualizado",
        data=OrderResponseSchema.model_validate(order),
    )


@router.post("/validate-qr", response_model=ResponseSchema[OrderResponseSchema])
async def validate_qr(
    qr_code: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_staff),
):
    service = OrderService(db)
    order = await service.validate_qr(qr_code)
    return ResponseSchema(
        message="QR válido",
        data=OrderResponseSchema.model_validate(order),
    )


@router.get("/{order_id}/invoice")
async def download_invoice(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Descarga factura en PDF. Acceso público por UUID seguro."""
    service = OrderService(db)
    order = await service.get_by_id(order_id)

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado",
        )

    if order.user_id:
        user = await service.user_repo.get_by_id(order.user_id)
        order.user = user

    pdf = InvoiceService.generate_pdf(order)
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=factura-{order.order_number}.pdf"
        },
    )
