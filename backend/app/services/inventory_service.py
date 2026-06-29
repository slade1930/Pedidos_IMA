# app/services/inventory_service.py
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.inventory_repository import InventoryRepository
from app.models.inventory_model import Inventory
from app.schemas.inventory_schema import (
    InventoryCreateSchema,
    InventoryUpdateSchema,
)
from app.services.notification_service import NotificationService
import uuid


class InventoryService:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.inventory_repo = InventoryRepository(db)

    async def get_all(self, skip: int = 0, limit: int = 10) -> list[Inventory]:
        return await self.inventory_repo.get_all(skip, limit)

    async def get_total_count(self) -> int:
        return await self.inventory_repo.get_total_count()

    async def create(self, data: InventoryCreateSchema) -> Inventory:
        existing = await self.inventory_repo.get_by_product_and_fair(
            data.product_id, data.fair_id
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe inventario para este producto en esta feria",
            )

        inventory = Inventory(**data.model_dump())
        return await self.inventory_repo.create(inventory)

    async def get_by_fair(self, fair_id: uuid.UUID) -> list[Inventory]:
        return await self.inventory_repo.get_by_fair(fair_id)

    async def update_stock(
        self, inventory_id: uuid.UUID, data: InventoryUpdateSchema
    ) -> Inventory:
        inventory = await self.inventory_repo.get_by_id(inventory_id)
        if not inventory:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inventario no encontrado",
            )

        updated = await self.inventory_repo.update(
            inventory_id, data.model_dump(exclude_none=True)
        )

        # Notificar si stock bajo
        if updated.available_stock <= 10:
            await NotificationService.notify_low_stock(
                product_name=str(updated.product_id),
                available=updated.available_stock,
            )

        return updated

    async def check_availability(
        self, product_id: uuid.UUID, fair_id: uuid.UUID, quantity: int
    ) -> bool:
        inventory = await self.inventory_repo.get_by_product_and_fair(
            product_id, fair_id
        )
        if not inventory:
            return False
        return inventory.available_stock >= quantity