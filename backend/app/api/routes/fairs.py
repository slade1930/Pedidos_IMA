# app/api/routes/fairs.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.fair_service import FairService
from app.schemas.fair_schema import (
    FairCreateSchema,
    FairUpdateSchema,
    FairResponseSchema,
)
from app.schemas.response_schema import ResponseSchema, PaginatedResponseSchema
from app.api.dependencies.auth_dependencies import (
    get_current_user,
    get_current_admin,
)
from app.models.user_model import User
import uuid

router = APIRouter(prefix="/fairs", tags=["Fairs"])


@router.get("/", response_model=PaginatedResponseSchema[FairResponseSchema])
async def get_all_fairs(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    service = FairService(db)
    fairs = await service.get_all(skip=skip, limit=limit)
    total = await service.get_total_count()
    return PaginatedResponseSchema(
        data=[FairResponseSchema.model_validate(f) for f in fairs],
        total=total,
        page=(skip // limit) + 1 if limit > 0 else 1,
        limit=limit,
        pages=((total + limit - 1) // limit) if total > 0 else 0,
    )


@router.get("/public", response_model=ResponseSchema[list[FairResponseSchema]])
async def get_public_fairs(
    db: AsyncSession = Depends(get_db),
):
    """Endpoint público para que los clientes vean las ferias disponibles"""
    service = FairService(db)
    fairs = await service.get_active()
    upcoming = await service.get_upcoming()
    all_fairs = fairs + upcoming
    return ResponseSchema(
        data=[FairResponseSchema.model_validate(f) for f in all_fairs]
    )


@router.post("/", response_model=ResponseSchema[FairResponseSchema])
async def create_fair(
    data: FairCreateSchema,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    service = FairService(db)
    fair = await service.create(data)
    return ResponseSchema(
        message="Feria creada exitosamente",
        data=FairResponseSchema.model_validate(fair),
    )


@router.get("/active", response_model=ResponseSchema[list[FairResponseSchema]])
async def get_active_fairs(
    db: AsyncSession = Depends(get_db),
):
    service = FairService(db)
    fairs = await service.get_active()
    return ResponseSchema(data=[FairResponseSchema.model_validate(f) for f in fairs])


@router.get("/upcoming", response_model=ResponseSchema[list[FairResponseSchema]])
async def get_upcoming_fairs(
    db: AsyncSession = Depends(get_db),
):
    service = FairService(db)
    fairs = await service.get_upcoming()
    return ResponseSchema(data=[FairResponseSchema.model_validate(f) for f in fairs])


@router.get("/{fair_id}", response_model=ResponseSchema[FairResponseSchema])
async def get_fair(
    fair_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    service = FairService(db)
    fair = await service.get_by_id(fair_id)
    return ResponseSchema(data=FairResponseSchema.model_validate(fair))


@router.put("/{fair_id}", response_model=ResponseSchema[FairResponseSchema])
async def update_fair(
    fair_id: uuid.UUID,
    data: FairUpdateSchema,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    service = FairService(db)
    fair = await service.update(fair_id, data)
    return ResponseSchema(
        message="Feria actualizada",
        data=FairResponseSchema.model_validate(fair),
    )


@router.delete("/{fair_id}", response_model=ResponseSchema)
async def deactivate_fair(
    fair_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    service = FairService(db)
    await service.deactivate(fair_id)
    return ResponseSchema(message="Feria desactivada")