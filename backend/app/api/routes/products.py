# app/api/routes/products.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.product_service import ProductService
from app.schemas.product_schema import (
    ProductCreateSchema,
    ProductUpdateSchema,
    ProductResponseSchema,
)
from app.schemas.response_schema import ResponseSchema, PaginatedResponseSchema
from app.api.dependencies.auth_dependencies import (
    get_current_user,
    get_current_admin,
)
from app.models.user_model import User
import uuid

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/", response_model=PaginatedResponseSchema[ProductResponseSchema])
async def get_all_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    service = ProductService(db)
    products = await service.get_all(skip=skip, limit=limit)
    total = await service.get_total_count()
    return PaginatedResponseSchema(
        data=[ProductResponseSchema.model_validate(p) for p in products],
        total=total,
        page=(skip // limit) + 1 if limit > 0 else 1,
        limit=limit,
        pages=((total + limit - 1) // limit) if total > 0 else 0,
    )


@router.get("/public", response_model=ResponseSchema[list[ProductResponseSchema]])
async def get_public_products(
    fair_id: uuid.UUID = Query(None),
    category: str = Query(None),
    search: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Endpoint público para que los clientes vean productos disponibles"""
    service = ProductService(db)
    
    if fair_id and category:
        products = await service.get_by_category(category, fair_id)
    elif fair_id:
        products = await service.get_by_fair(fair_id)
    else:
        products = await service.get_all(limit=50)
    
    return ResponseSchema(
        data=[ProductResponseSchema.model_validate(p) for p in products]
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


@router.get(
    "/fair/{fair_id}", response_model=ResponseSchema[list[ProductResponseSchema]]
)
async def get_products_by_fair(
    fair_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    service = ProductService(db)
    products = await service.get_by_fair(fair_id)
    return ResponseSchema(
        data=[ProductResponseSchema.model_validate(p) for p in products]
    )


@router.get("/{product_id}", response_model=ResponseSchema[ProductResponseSchema])
async def get_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    service = ProductService(db)
    product = await service.get_by_id(product_id)
    return ResponseSchema(data=ProductResponseSchema.model_validate(product))


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
        message="Producto actualizado",
        data=ProductResponseSchema.model_validate(product),
    )


@router.delete("/{product_id}", response_model=ResponseSchema)
async def deactivate_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    service = ProductService(db)
    await service.deactivate(product_id)
    return ResponseSchema(message="Producto desactivado")