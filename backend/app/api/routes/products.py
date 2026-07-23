# app/api/routes/inventory.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.inventory_service import InventoryService
from app.schemas.inventory_schema import (
    InventoryCreateSchema,
    InventoryUpdateSchema,
    InventoryResponseSchema,
)
from app.schemas.response_schema import ResponseSchema, PaginatedResponseSchema
from app.api.dependencies.auth_dependencies import (
    get_current_staff,
    get_current_admin,
)
from app.models.user_model import User
import uuid

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("/", response_model=PaginatedResponseSchema[InventoryResponseSchema])
async def get_all_inventory(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    search: str = Query(None),           # 👈 NUEVO
    fair_id: uuid.UUID = Query(None),    # 👈 NUEVO
    low_stock: bool = Query(False),      # 👈 NUEVO
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_staff),
):
    service = InventoryService(db)
    items = await service.get_all(
        skip=skip, limit=limit, search=search, fair_id=fair_id, low_stock=low_stock
    )
    total = await service.get_total_count(
        search=search, fair_id=fair_id, low_stock=low_stock
    )
    return PaginatedResponseSchema(
        data=[
            InventoryResponseSchema(
                id=i.id,
                product_id=i.product_id,
                product_name=i.product.name if i.product else None,
                fair_id=i.fair_id,
                total_stock=i.total_stock,
                reserved_stock=i.reserved_stock,
                delivered_stock=i.delivered_stock,
                available_stock=i.available_stock,
                is_available=i.is_available,
                notes=i.notes,
            )
            for i in items
        ],
        total=total,
        page=(skip // limit) + 1 if limit > 0 else 1,
        limit=limit,
        pages=((total + limit - 1) // limit) if total > 0 else 0,
    )


@router.post("/", response_model=ResponseSchema[InventoryResponseSchema])
async def create_inventory(
    data: InventoryCreateSchema,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    service = InventoryService(db)
    inventory = await service.create(data)
    return ResponseSchema(
        message="Inventario creado",
        data=InventoryResponseSchema.model_validate(inventory),
    )


@router.get(
    "/fair/{fair_id}", response_model=ResponseSchema[list[InventoryResponseSchema]]
)
async def get_inventory_by_fair(
    fair_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_staff),
):
    service = InventoryService(db)
    inventory = await service.get_by_fair(fair_id)
    return ResponseSchema(
        data=[InventoryResponseSchema.model_validate(i) for i in inventory]
    )


@router.put("/{inventory_id}", response_model=ResponseSchema[InventoryResponseSchema])
async def update_inventory(
    inventory_id: uuid.UUID,
    data: InventoryUpdateSchema,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    service = InventoryService(db)
    inventory = await service.update_stock(inventory_id, data)
    return ResponseSchema(
        message="Inventario actualizado",
        data=InventoryResponseSchema.model_validate(inventory),
    )
