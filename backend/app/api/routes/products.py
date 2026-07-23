# app/api/routes/products.py

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.product_service import ProductService
from app.schemas.product_schema import (
    ProductResponseSchema,
    ProductCreateSchema,
    ProductUpdateSchema,
)
from app.schemas.response_schema import ResponseSchema, PaginatedResponseSchema
from app.api.dependencies.auth_dependencies import get_current_admin, get_current_staff
from app.models.user_model import User
import uuid

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/", response_model=PaginatedResponseSchema[ProductResponseSchema])
async def get_all_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    search: str = Query(None),
    category: str = Query(None),
    fair_id: uuid.UUID = Query(None),  # 👈 NUEVO: filtrar por feria
    is_active: bool = Query(True),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_staff),
):
    service = ProductService(db)
    items = await service.get_all(
        skip=skip, 
        limit=limit, 
        search=search, 
        category=category,
        fair_id=fair_id,  # 👈 NUEVO: pasar a service
        is_active=is_active
    )
    total = await service.get_total_count(
        search=search, 
        category=category,
        fair_id=fair_id,  # 👈 NUEVO: pasar a service
        is_active=is_active
    )
    return PaginatedResponseSchema(
        data=[ProductResponseSchema.model_validate(p) for p in items],
        total=total,
        page=(skip // limit) + 1 if limit > 0 else 1,
        limit=limit,
        pages=((total + limit - 1) // limit) if total > 0 else 0,
    )


@router.post("/", response_model=ResponseSchema[ProductResponseSchema])
async def create_product(
    data: ProductCreateSchema,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    service = ProductService(db)
    product = await service.create(data)
    return ResponseSchema(
        message="Producto creado exitosamente",
        data=ProductResponseSchema.model_validate(product),
    )


@router.get("/{product_id}", response_model=ResponseSchema[ProductResponseSchema])
async def get_product_by_id(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_staff),
):
    service = ProductService(db)
    product = await service.get_by_id(product_id)
    return ResponseSchema(
        data=ProductResponseSchema.model_validate(product),
    )


@router.put("/{product_id}", response_model=ResponseSchema[ProductResponseSchema])
async def update_product(
    product_id: uuid.UUID,
    data: ProductUpdateSchema,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    service = ProductService(db)
    product = await service.update(product_id, data)
    return ResponseSchema(
        message="Producto actualizado exitosamente",
        data=ProductResponseSchema.model_validate(product),
    )


@router.delete("/{product_id}", response_model=ResponseSchema)
async def delete_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    service = ProductService(db)
    await service.deactivate(product_id)
    return ResponseSchema(
        message="Producto desactivado exitosamente",
    )
