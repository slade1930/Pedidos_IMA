# app/api/router.py
from fastapi import APIRouter
from app.api.routes import (
    auth,
    users,
    fairs,
    products,
    inventory,
    orders,
    payments,
    notifications,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(fairs.router)
api_router.include_router(products.router)
api_router.include_router(inventory.router)
api_router.include_router(orders.router)
api_router.include_router(payments.router)
api_router.include_router(notifications.router)
